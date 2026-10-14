import { apiRequest } from "./client"

type CounterResponse = {
  count: number
}

export async function getCounter(): Promise<number> {
  const response = await apiRequest<CounterResponse>("/counter")
  return response.count
}

export async function incrementCounter(): Promise<number> {
  const response = await apiRequest<CounterResponse>("/counter/increment", { method: "POST" })
  return response.count
}

export async function decrementCounter(): Promise<number> {
  const response = await apiRequest<CounterResponse>("/counter/decrement", { method: "POST" })
  return response.count
}
