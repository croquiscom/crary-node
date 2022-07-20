import { AbortController as NodeAbortController } from 'node-abort-controller';
import nodeFetch, {
  RequestInfo as NodeFetchRequestInfo,
  RequestInit as NodeFetchRequestInit,
  Response as NodeFetchResponse,
} from 'node-fetch';

export async function fetchWithTimeout(
  url: NodeFetchRequestInfo,
  init: NodeFetchRequestInit & { timeout: number },
): Promise<NodeFetchResponse> {
  if (!(init?.timeout > 0)) {
    throw new Error('invalid timeout');
  }
  const timeout = init.timeout;
  const abort = new NodeAbortController();
  const timer = setTimeout(() => {
    abort.abort();
  }, timeout);
  const init_copied = {
    ...init,
    signal: abort.signal,
  };
  delete (init_copied as unknown as any).timeout;
  try {
    return await nodeFetch(url, init_copied);
  } finally {
    clearTimeout(timer);
  }
}
