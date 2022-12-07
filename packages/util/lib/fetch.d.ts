import type { RequestInfo as NodeFetchRequestInfo, RequestInit as NodeFetchRequestInit, Response as NodeFetchResponse } from 'node-fetch';
export declare function fetchWithTimeout(url: NodeFetchRequestInfo, init?: NodeFetchRequestInit & {
    timeout?: number;
}): Promise<NodeFetchResponse>;
