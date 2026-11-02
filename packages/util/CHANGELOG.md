# @croquiscom/crary-util

## 2.1.0

### Minor Changes

- 12403e0: fetchWithTimeout's timeout now covers reading the response body
  - Before, the timer was cleared once the response headers arrived, so `response.json()`, `response.arrayBuffer()` and the like could wait forever on a server that sends the headers and then stalls the body.
  - Now the timeout covers the whole call. Reading the body after the timeout rejects with `AbortError`.
  - Callers that stream a long response (SSE, large downloads) must pass a timeout long enough for the whole body, or no timeout.

## 2.0.0

### Major Changes

- 4f7184d: fetchWithTimeout uses the built-in fetch instead of node-fetch
  - `init` and the result are now the built-in `RequestInit` / `Response` types. `response.json()` resolves to `any`, `response.body` is a web `ReadableStream`, and node-fetch only options (`agent`, `compress`, `size`) and methods (`response.buffer()`) are no longer available.
  - A `signal` passed by the caller is combined with the timeout instead of being overwritten.
  - Timeouts still reject with `AbortError` and only cover waiting for the response headers.

## 1.4.0

### Minor Changes

- 42c066c: update dependencies
