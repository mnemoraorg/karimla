package service

import "github.com/mnemoraorg/karimla/apps/api/internal/domain/counter"

type Service struct {
	repository counter.Repository
}

func NewService(repository counter.Repository) *Service {
	return &Service{repository: repository}
}
