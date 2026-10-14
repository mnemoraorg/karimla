SHELL := /bin/sh

ATLAS ?= atlas
ATLAS_DIR := file://ent/migrate/migrations

.PHONY: help dev format generate atlas/validate atlas/hash atlas/new atlas/apply build test test/integration lint tidy clean

help:
	@printf "%s\n" \
		"make dev             Start the API on port 35080" \
		"make format          Format Go sources" \
		"make generate        Generate the Ent client" \
		"make atlas/validate  Validate Atlas migration checksums and SQL" \
		"make atlas/hash      Recompute the Atlas migration checksum" \
		"make atlas/new name=... Create an empty Atlas migration" \
		"make atlas/apply     Apply Atlas migrations to DATABASE_URL" \
		"make build           Generate Ent code and compile the API" \
		"make test            Run Go tests" \
		"make test/integration Run PostgreSQL integration tests" \
		"make lint            Run gofmt and go vet" \
		"make tidy            Sync Go module files" \
		"make clean           Remove local build artifacts"

dev:
	@set -a; [ ! -f .env ] || . ./.env; set +a; PORT="$${PORT:-35080}" go run ./cmd/api

format:
	gofmt -w $$(find . -type f -name '*.go')

generate:
	go generate ./ent

atlas/validate:
	$(ATLAS) migrate validate --dir $(ATLAS_DIR)

atlas/hash:
	$(ATLAS) migrate hash --dir $(ATLAS_DIR)

atlas/new:
	@test -n "$(name)" || (echo "usage: make atlas/new name=..."; exit 1)
	$(ATLAS) migrate new --dir $(ATLAS_DIR) "$(name)"

# The database is shared with the BetterAuth auth schema, which Atlas does not
# manage, so applies allow unmanaged schemas. Atlas still tracks its own
# revisions and only runs the migrations in $(ATLAS_DIR).
atlas/apply:
	@test -n "$(DATABASE_URL)" || (echo "DATABASE_URL is required"; exit 1)
	@$(ATLAS) migrate apply --dir $(ATLAS_DIR) --url "$(DATABASE_URL)" --allow-dirty

build: generate
	go build ./...
	mkdir -p bin
	go build -o ./bin/karimla-api ./cmd/api

test: generate
	go test ./...

test/integration: generate
	go test -tags=integration ./test/integration

lint: generate
	@test -z "$$(gofmt -l .)" || (echo "gofmt required:"; gofmt -l .; exit 1)
	go vet ./...

tidy: generate
	go mod tidy

clean:
	rm -rf ./bin
