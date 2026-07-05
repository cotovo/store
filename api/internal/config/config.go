package config

import (
	"os"
	"time"
)

type Config struct {
	HTTPAddr       string
	DatabaseURL    string
	RedisAddr      string
	RedisPassword  string
	RedisDB        int
	SessionTTL     time.Duration
	PublicBaseURL  string
	AdminBaseURL   string
	SMTPHost       string
	SMTPPort       string
	SMTPUsername   string
	SMTPPassword   string
	SMTPFromName   string
	MailSecrets    bool
	MockPayEnabled bool
}

func Load() Config {
	return Config{
		HTTPAddr:       env("HTTP_ADDR", ":8080"),
		DatabaseURL:    env("DATABASE_URL", "postgres://faka:faka_password@127.0.0.1:5432/faka?sslmode=disable"),
		RedisAddr:      env("REDIS_ADDR", "127.0.0.1:6379"),
		RedisPassword:  env("REDIS_PASSWORD", ""),
		RedisDB:        0,
		SessionTTL:     24 * time.Hour,
		PublicBaseURL:  env("PUBLIC_BASE_URL", "http://127.0.0.1:5173"),
		AdminBaseURL:   env("ADMIN_BASE_URL", "http://127.0.0.1:5173/admin"),
		SMTPHost:       env("SMTP_HOST", ""),
		SMTPPort:       env("SMTP_PORT", "587"),
		SMTPUsername:   env("SMTP_USERNAME", ""),
		SMTPPassword:   env("SMTP_PASSWORD", ""),
		SMTPFromName:   env("SMTP_FROM_NAME", "Modern Faka"),
		MailSecrets:    env("MAIL_INCLUDE_SECRETS", "false") == "true",
		MockPayEnabled: env("MOCK_PAY_ENABLED", "true") == "true",
	}
}

func env(key string, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
