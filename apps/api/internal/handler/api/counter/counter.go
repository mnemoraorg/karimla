package counter

import (
	counterservice "github.com/mnemoraorg/karimla/apps/api/internal/domain/counter/service"
)

type CounterResponse struct {
	Count int `json:"count"`
}

type Handlers struct {
	Service *counterservice.Service
}

func New(counterService *counterservice.Service) *Handlers {
	return &Handlers{Service: counterService}
}
