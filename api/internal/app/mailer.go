package app

import (
	"context"
	"fmt"
	"net/smtp"
	"strings"
)

func (a *App) sendDeliveryEmail(ctx context.Context, order Order) {
	if order.BuyerEmail == "" || a.cfg.SMTPHost == "" {
		return
	}
	subject := "发货成功，请查看订单"
	queryURL := fmt.Sprintf("%s/order/%s", a.cfg.PublicBaseURL, order.TradeNo)
	body := fmt.Sprintf("您的订单 %s 已处理。\n\n查询地址：%s\n", order.TradeNo, queryURL)
	if order.PaymentStatus == PaymentPaid && order.DeliveryStatus == DeliveryDelivered && a.cfg.MailSecrets {
		body += "\n发货内容：\n" + order.DeliveryContent + "\n"
	}
	err := a.sendMail(order.BuyerEmail, subject, body)
	status := "sent"
	message := ""
	if err != nil {
		status = "failed"
		message = err.Error()
	}
	_, _ = a.db.Exec(ctx, `insert into email_logs(recipient,subject,body,status,message,created_at) values($1,$2,$3,$4,$5,now())`, order.BuyerEmail, subject, body, status, message)
}

func (a *App) sendMail(to, subject, body string) error {
	addr := a.cfg.SMTPHost + ":" + a.cfg.SMTPPort
	auth := smtp.PlainAuth("", a.cfg.SMTPUsername, a.cfg.SMTPPassword, a.cfg.SMTPHost)
	msg := strings.Join([]string{
		"From: " + a.cfg.SMTPFromName + " <" + a.cfg.SMTPUsername + ">",
		"To: " + to,
		"Subject: " + subject,
		"Content-Type: text/plain; charset=UTF-8",
		"",
		body,
	}, "\r\n")
	return smtp.SendMail(addr, auth, a.cfg.SMTPUsername, []string{to}, []byte(msg))
}
