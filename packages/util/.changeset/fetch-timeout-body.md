---
'@croquiscom/crary-util': minor
---

fetchWithTimeout's timeout now covers reading the response body

- Before, the timer was cleared once the response headers arrived, so `response.json()`, `response.arrayBuffer()` and the like could wait forever on a server that sends the headers and then stalls the body.
- Now the timeout covers the whole call. Reading the body after the timeout rejects with `AbortError`.
- Callers that stream a long response (SSE, large downloads) must pass a timeout long enough for the whole body, or no timeout.
