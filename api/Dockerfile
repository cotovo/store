FROM golang:1.23-alpine AS build

WORKDIR /src
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
RUN go build -o /out/store-api ./cmd/server

FROM alpine:3.21

RUN adduser -D -H appuser
WORKDIR /app
COPY --from=build /out/store-api /app/store-api
USER appuser

EXPOSE 8080
ENTRYPOINT ["/app/store-api"]
