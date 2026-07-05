package app

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"golang.org/x/crypto/bcrypt"

	"modern-faka/api/internal/config"
)

type App struct {
	cfg   config.Config
	db    *pgxpool.Pool
	redis *redis.Client
}

func New(cfg config.Config) (*App, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	db, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		return nil, err
	}
	if err := db.Ping(ctx); err != nil {
		db.Close()
		return nil, err
	}

	rdb := redis.NewClient(&redis.Options{Addr: cfg.RedisAddr, Password: cfg.RedisPassword, DB: cfg.RedisDB})
	if err := rdb.Ping(ctx).Err(); err != nil {
		db.Close()
		return nil, err
	}

	return &App{cfg: cfg, db: db, redis: rdb}, nil
}

func (a *App) Close() {
	if a.db != nil {
		a.db.Close()
	}
	if a.redis != nil {
		_ = a.redis.Close()
	}
}

func (a *App) Routes() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(a.cors)

	r.Get("/api/health", func(w http.ResponseWriter, r *http.Request) {
		respond(w, http.StatusOK, "ok", map[string]string{"status": "ok"})
	})

	r.Route("/api/public", func(r chi.Router) {
		r.Get("/products", a.publicProducts)
		r.Get("/products/{id}", a.publicProduct)
		r.Post("/orders", a.createOrder)
		r.Get("/orders/{tradeNo}/status", a.orderStatus)
		r.Post("/orders/query", a.queryOrder)
		r.Post("/orders/{tradeNo}/secret", a.orderSecret)
	})

	r.Route("/api/payments", func(r chi.Router) {
		r.Get("/mock/success/{tradeNo}", a.mockPaymentSuccess)
		r.Post("/{channel}/callback", a.paymentCallback)
	})

	r.Route("/api/admin", func(r chi.Router) {
		r.Post("/auth/login", a.adminLogin)
		r.Group(func(r chi.Router) {
			r.Use(a.adminAuth)
			r.Post("/auth/logout", a.adminLogout)
			r.Get("/dashboard", a.adminDashboard)
			r.Get("/categories", a.adminCategories)
			r.Post("/categories", a.adminSaveCategory)
			r.Get("/products", a.adminProducts)
			r.Post("/products", a.adminSaveProduct)
			r.Get("/cards", a.adminCards)
			r.Post("/cards/import", a.adminImportCards)
			r.Post("/cards/{id}/lock", a.adminSetCardStatus(CardLocked))
			r.Post("/cards/{id}/unlock", a.adminSetCardStatus(CardAvailable))
			r.Get("/orders", a.adminOrders)
			r.Post("/orders/{id}/deliver", a.adminDeliverOrder)
			r.Get("/operation-logs", a.adminLogs)
		})
	})

	return r
}

func (a *App) cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func respond(w http.ResponseWriter, status int, msg string, data interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(APIResponse{Code: statusCode(status), Msg: msg, Data: data})
}

func fail(w http.ResponseWriter, status int, msg string) {
	respond(w, status, msg, nil)
}

func statusCode(httpStatus int) int {
	if httpStatus >= 200 && httpStatus < 300 {
		return 200
	}
	return httpStatus
}

func decode(r *http.Request, dst interface{}) error {
	defer r.Body.Close()
	return json.NewDecoder(r.Body).Decode(dst)
}

func token() (string, error) {
	var b [24]byte
	if _, err := rand.Read(b[:]); err != nil {
		return "", err
	}
	return hex.EncodeToString(b[:]), nil
}

func tradeNo() (string, error) {
	var b [5]byte
	if _, err := rand.Read(b[:]); err != nil {
		return "", err
	}
	return fmt.Sprintf("%s%s", time.Now().Format("060102150405"), strings.ToUpper(hex.EncodeToString(b[:]))), nil
}

func parseIDParam(r *http.Request, name string) (int64, error) {
	return strconv.ParseInt(chi.URLParam(r, name), 10, 64)
}

func (a *App) adminAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		header := r.Header.Get("Authorization")
		raw := strings.TrimPrefix(header, "Bearer ")
		if raw == "" || raw == header {
			fail(w, http.StatusUnauthorized, "missing admin token")
			return
		}
		adminID, err := a.redis.Get(r.Context(), "admin_session:"+raw).Int64()
		if err != nil || adminID <= 0 {
			fail(w, http.StatusUnauthorized, "invalid admin token")
			return
		}
		ctx := context.WithValue(r.Context(), adminIDKey{}, adminID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

type adminIDKey struct{}

func adminID(ctx context.Context) int64 {
	v, _ := ctx.Value(adminIDKey{}).(int64)
	return v
}

func (a *App) audit(ctx context.Context, content string) {
	_, _ = a.db.Exec(ctx, `insert into operation_logs(admin_id, content, created_at) values($1,$2,now())`, adminID(ctx), content)
}

func hashPassword(password string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(b), err
}

func checkPassword(hash, password string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

func publicOrder(o Order) Order {
	if o.PaymentStatus != PaymentPaid || o.DeliveryStatus != DeliveryDelivered {
		o.DeliveryContent = ""
	}
	return o
}
