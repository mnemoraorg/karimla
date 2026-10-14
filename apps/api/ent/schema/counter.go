package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema"
	"entgo.io/ent/schema/field"
)

type Counter struct {
	ent.Schema
}

func (Counter) Annotations() []schema.Annotation {
	return []schema.Annotation{entsql.Annotation{Table: "counters"}}
}

func (Counter) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").StorageKey("auth_user_id").NotEmpty().Immutable(),
		field.Int("count").Default(0),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}
