export type FetchWithTimeoutInit = RequestInit & {
    /** milliseconds to wait for the whole call, including reading the response body. rejects with AbortError on timeout */
    timeout?: number;
};
export declare function fetchWithTimeout(input: string | URL | Request, init?: FetchWithTimeoutInit): Promise<Response>;
