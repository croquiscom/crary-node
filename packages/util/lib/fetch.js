"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchWithTimeout = fetchWithTimeout;
async function fetchWithTimeout(input, init) {
    const { timeout, ...rest } = init ?? {};
    if (!timeout || !(timeout > 0)) {
        return await fetch(input, rest);
    }
    const abort = new AbortController();
    const timer = setTimeout(() => {
        abort.abort();
    }, timeout);
    const signal = rest.signal ? AbortSignal.any([rest.signal, abort.signal]) : abort.signal;
    try {
        return await fetch(input, { ...rest, signal });
    }
    finally {
        clearTimeout(timer);
    }
}
