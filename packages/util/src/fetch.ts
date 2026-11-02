export type FetchWithTimeoutInit = RequestInit & {
  /** milliseconds to wait for the response headers. rejects with AbortError on timeout */
  timeout?: number;
};

export async function fetchWithTimeout(input: string | URL | Request, init?: FetchWithTimeoutInit): Promise<Response> {
  const { timeout, ...rest } = init ?? {};
  if (!timeout || !(timeout > 0)) {
    return await fetch(input, rest);
  }
  const abort = new AbortController();
  const timer = setTimeout(() => {
    abort.abort();
  }, timeout);
  // init.signal replaces a Request's own signal, so keep the Request's one unless init gives a signal
  const caller_signal = rest.signal !== undefined ? rest.signal : input instanceof Request ? input.signal : null;
  const signal = caller_signal ? AbortSignal.any([caller_signal, abort.signal]) : abort.signal;
  try {
    return await fetch(input, { ...rest, signal });
  } finally {
    clearTimeout(timer);
  }
}
