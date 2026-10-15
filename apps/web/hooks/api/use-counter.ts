"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { decrementCounter, getCounter, incrementCounter } from "@/api/counter"

export function useCounter() {
  return useQuery<number, Error>({ queryKey: ["counter"], queryFn: getCounter })
}

export function useIncrementCounter() {
  const queryClient = useQueryClient()
  return useMutation<number, Error, void>({
    mutationFn: incrementCounter,
    onSuccess: (count) => queryClient.setQueryData<number>(["counter"], count),
  })
}

export function useDecrementCounter() {
  const queryClient = useQueryClient()
  return useMutation<number, Error, void>({
    mutationFn: decrementCounter,
    onSuccess: (count) => queryClient.setQueryData<number>(["counter"], count),
  })
}
