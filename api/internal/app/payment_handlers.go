package app

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/jackc/pgx/v5"
)

func (a *App) mockPaymentSuccess(w http.ResponseWriter, r *http.Request) {
	if !a.cfg.MockPayEnabled {
		fail(w, http.StatusNotFound, "mock pay is disabled")
		return
	}
	tradeNo := chiParam(r, "tradeNo")
	order, err := a.markOrderPaidAndDeliver(r, tradeNo)
	if err != nil {
		fail(w, http.StatusBadRequest, err.Error())
		return
	}
	http.Redirect(w, r, fmt.Sprintf("%s/order/%s", a.cfg.PublicBaseURL, order.TradeNo), http.StatusFound)
}

func (a *App) paymentCallback(w http.ResponseWriter, r *http.Request) {
	channel := chiParam(r, "channel")
	var body struct {
		TradeNo     string `json:"tradeNo"`
		AmountCents int64  `json:"amountCents"`
		Sign        string `json:"sign"`
	}
	if err := decode(r, &body); err != nil {
		fail(w, http.StatusBadRequest, "invalid callback")
		return
	}
	// Real adapters should verify provider signatures before this point.
	_ = channel
	existing, err := a.loadOrderByTradeNo(r, body.TradeNo)
	if err != nil {
		fail(w, http.StatusNotFound, "order not found")
		return
	}
	if body.AmountCents > 0 && body.AmountCents != existing.AmountCents {
		fail(w, http.StatusBadRequest, "amount mismatch")
		return
	}
	if _, err := a.markOrderPaidAndDeliver(r, body.TradeNo); err != nil {
		fail(w, http.StatusBadRequest, err.Error())
		return
	}
	respond(w, http.StatusOK, "success", "success")
}

func (a *App) markOrderPaidAndDeliver(r *http.Request, tradeNo string) (Order, error) {
	ctx := r.Context()
	tx, err := a.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return Order{}, err
	}
	defer tx.Rollback(ctx)

	var o Order
	var deliveryMode, manualText, autoOrder string
	var channelID int64
	err = tx.QueryRow(ctx, `
		select o.id,o.trade_no,o.product_id,p.name,o.quantity,o.amount_cents,o.buyer_email,o.buyer_contact,
		       coalesce(o.payment_channel_id,0),o.payment_status,o.delivery_status,coalesce(o.delivery_content,''),
		       coalesce(o.pay_url,''),o.paid_at,o.delivered_at,o.created_ip,o.created_user_agent,o.created_at,
		       p.delivery_mode,p.manual_text,p.auto_delivery_order
		from orders o
		join products p on p.id=o.product_id
		where o.trade_no=$1
		for update of o`, tradeNo).
		Scan(&o.ID, &o.TradeNo, &o.ProductID, &o.ProductName, &o.Quantity, &o.AmountCents, &o.BuyerEmail, &o.BuyerContact,
			&channelID, &o.PaymentStatus, &o.DeliveryStatus, &o.DeliveryContent,
			&o.PayURL, &o.PaidAt, &o.DeliveredAt, &o.CreatedIP, &o.CreatedUserAgent, &o.CreatedAt,
			&deliveryMode, &manualText, &autoOrder)
	if err != nil {
		return Order{}, err
	}
	if channelID > 0 {
		o.PaymentChannelID = &channelID
	}
	if o.PaymentStatus == PaymentPaid {
		_ = tx.Commit(ctx)
		return o, nil
	}

	if _, err = tx.Exec(ctx, `update orders set payment_status='paid', paid_at=now() where id=$1`, o.ID); err != nil {
		return Order{}, err
	}
	o.PaymentStatus = PaymentPaid

	if deliveryMode == DeliveryAuto {
		content, err := a.allocateCards(ctx, tx, o.ID, o.ProductID, o.Quantity, autoOrder)
		if err != nil {
			return Order{}, err
		}
		if _, err = tx.Exec(ctx, `update orders set delivery_status='delivered', delivery_content=$2, delivered_at=now() where id=$1`, o.ID, content); err != nil {
			return Order{}, err
		}
		o.DeliveryStatus = DeliveryDelivered
		o.DeliveryContent = content
	} else {
		if manualText == "" {
			manualText = "已支付，正在发货中，请稍后查询。"
		}
		if _, err = tx.Exec(ctx, `update orders set delivery_content=$2 where id=$1`, o.ID, manualText); err != nil {
			return Order{}, err
		}
		o.DeliveryContent = manualText
	}

	if err = tx.Commit(ctx); err != nil {
		return Order{}, err
	}
	if o.DeliveryStatus == DeliveryDelivered {
		a.sendDeliveryEmail(ctx, o)
	}
	return o, nil
}

func (a *App) allocateCards(ctx context.Context, tx pgx.Tx, orderID int64, productID int64, quantity int, autoOrder string) (string, error) {
	orderBy := "id asc"
	switch autoOrder {
	case "newest":
		orderBy = "id desc"
	case "random":
		orderBy = "random()"
	}
	rows, err := tx.Query(ctx, fmt.Sprintf(`
		select id, secret
		from product_cards
		where product_id=$1 and status='available'
		order by %s
		limit $2
		for update skip locked`, orderBy), productID, quantity)
	if err != nil {
		return "", err
	}
	defer rows.Close()

	ids := []int64{}
	secrets := []string{}
	for rows.Next() {
		var id int64
		var secret string
		if err := rows.Scan(&id, &secret); err != nil {
			return "", err
		}
		ids = append(ids, id)
		secrets = append(secrets, secret)
	}
	if err := rows.Err(); err != nil {
		return "", err
	}
	if len(ids) != quantity {
		return "", fmt.Errorf("stock is not enough")
	}
	if _, err := tx.Exec(ctx, `update product_cards set status='sold', sold_order_id=$1, sold_at=now() where id=any($2)`, orderID, ids); err != nil {
		return "", err
	}
	return strings.Join(secrets, "\n"), nil
}
