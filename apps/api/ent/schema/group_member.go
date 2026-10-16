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

// GroupMember maps public.group_members: one row per user per group.
type GroupMember struct {
	ent.Schema
}

func (GroupMember) Annotations() []schema.Annotation {
	return []schema.Annotation{entsql.Annotation{Table: "group_members"}}
}

func (GroupMember) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("group_id", "auth_user_id").Unique(),
	}
}

func (GroupMember) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("id", uuid.UUID{}).Default(uuid.New).Immutable(),
		field.String("group_id"),
		field.String("auth_user_id"),
		field.String("display_name").Default(""),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}
