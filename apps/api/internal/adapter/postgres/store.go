package postgres

import (
	"database/sql"

	"entgo.io/ent/dialect"
	dialectsql "entgo.io/ent/dialect/sql"
	entclient "github.com/mnemoraorg/karimla/apps/api/ent"
	"github.com/mnemoraorg/karimla/apps/api/internal/adapter/postgres/repository"
	"github.com/mnemoraorg/karimla/apps/api/internal/domain/counter"
)

type Store struct {
	ent *entclient.Client
}

func New(db *sql.DB) *Store {
	return &Store{ent: entclient.NewClient(entclient.Driver(dialectsql.OpenDB(dialect.Postgres, db)))}
}

func (s *Store) Counters() counter.Repository {
	return repository.NewCounter(s.ent)
}
