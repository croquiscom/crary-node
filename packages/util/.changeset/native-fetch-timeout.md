---
'@croquiscom/crary-util': major
---

fetchWithTimeout uses the built-in fetch instead of node-fetch

- `init` and the result are now the built-in `RequestInit` / `Response` types. `response.json()` resolves to `any`, `response.body` is a web `ReadableStream`, and node-fetch only options (`agent`, `compress`, `size`) and methods (`response.buffer()`) are no longer available.
- A `signal` passed by the caller is combined with the timeout instead of being overwritten.
- Timeouts still reject with `AbortError` and only cover waiting for the response headers.
