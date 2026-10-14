package postgres

import (
	"database/sql"

	"entgo.io/ent/dialect"
	dialectsql "entgo.io/ent/dialect/sql"
	entclient "github.com/mnemoraorg/karimla/apps/api/ent"
)

type Store struct {
	ent *entclient.Client
}

func New(db *sql.DB) *Store {
	return &Store{ent: entclient.NewClient(entclient.Driver(dialectsql.OpenDB(dialect.Postgres, db)))}
}
