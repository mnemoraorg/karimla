package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"github.com/google/uuid"
)

// IdempotencyKey maps public.idempotency_keys: one stored response per client
// operation. A retried count tap replays the stored answer instead of counting
// again. Rows expire (see the repository) because a key is only ever retried
// while its tap is still unsettled.
type IdempotencyKey struct {
	ent.Schema
}

func (IdempotencyKey) Annotations() []schema.Annotation {
	return []schema.Annotation{entsql.Annotation{Table: "idempotency_keys"}}
}

func (IdempotencyKey) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("key_id", "endpoint", "auth_user_id").Unique(),
	}
}

func (IdempotencyKey) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("id", uuid.UUID{}).Default(uuid.New).Immutable(),
		field.String("key_id"),
		field.String("endpoint"),
		field.String("auth_user_id"),
		field.Int("status_code"),
		field.Bytes("body"),
		field.Time("created_at").Default(time.Now).Immutable(),
	}
}
