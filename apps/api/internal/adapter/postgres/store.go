package postgres

import (
	"database/sql"

	"entgo.io/ent/dialect"
	dialectsql "entgo.io/ent/dialect/sql"
	entclient "github.com/mnemoraorg/yappi/apps/api/ent"
	"github.com/mnemoraorg/yappi/apps/api/internal/adapter/postgres/repository"
	"github.com/mnemoraorg/yappi/apps/api/internal/domain/group"
	"github.com/mnemoraorg/yappi/apps/api/internal/middleware/idempotency"
)

type Store struct {
	ent *entclient.Client
}

func New(db *sql.DB) *Store {
	return &Store{ent: entclient.NewClient(entclient.Driver(dialectsql.OpenDB(dialect.Postgres, db)))}
}

func (s *Store) Groups() group.Repository {
	return repository.NewGroup(s.ent)
}

func (s *Store) GroupCounts() group.CountRepository {
	return repository.NewCount(s.ent)
}

func (s *Store) IdempotencyKeys() idempotency.Store {
	return repository.NewIdempotency(s.ent)
}
