"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { getCounter, incrementCounter } from "@/api/counter"

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
