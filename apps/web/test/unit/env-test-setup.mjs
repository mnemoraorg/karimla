export const testEnvValues = {
  NEXT_PUBLIC_ENVIRONMENT: "development",
  NEXT_PUBLIC_DEBUG: "true",
  NEXT_PUBLIC_AUTH_URL_V1: "https://auth.example/api/v1",
  NEXT_PUBLIC_API_URL_V1: "https://api.example/api/v1",
}

export function setTestEnv() {
  const original = Object.fromEntries(
    Object.keys(testEnvValues).map((key) => [key, process.env[key]]),
  )
  Object.assign(process.env, testEnvValues)

  return () => {
    for (const key of Object.keys(testEnvValues)) {
      if (original[key] === undefined) delete process.env[key]
      else process.env[key] = original[key]
    }
  }
}
