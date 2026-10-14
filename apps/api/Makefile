SHELL := /bin/sh

.PHONY: help dev format build test lint tidy clean

help:
	@printf "%s\n" \
		"make dev             Start the API on port 35080" \
		"make format          Format Go sources" \
		"make build           Compile the API" \
		"make test            Run Go tests" \
		"make lint            Run gofmt and go vet" \
		"make tidy            Sync Go module files" \
		"make clean           Remove local build artifacts"

dev:
	@set -a; [ ! -f .env ] || . ./.env; set +a; PORT="$${PORT:-35080}" go run ./cmd/api

format:
	gofmt -w $$(find . -type f -name '*.go')

build:
	go build ./...
	mkdir -p bin
	go build -o ./bin/karimla-api ./cmd/api

test:
	go test ./...

lint:
	@test -z "$$(gofmt -l .)" || (echo "gofmt required:"; gofmt -l .; exit 1)
	go vet ./...

tidy:
	go mod tidy

clean:
	rm -rf ./bin
