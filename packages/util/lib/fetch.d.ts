export type FetchWithTimeoutInit = RequestInit & {
    /** milliseconds to wait for the response headers. rejects with AbortError on timeout */
    timeout?: number;
};
export declare function fetchWithTimeout(input: string | URL | Request, init?: FetchWithTimeoutInit): Promise<Response>;
