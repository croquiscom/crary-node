"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchWithTimeout = fetchWithTimeout;
async function fetchWithTimeout(input, init) {
    const { timeout, ...rest } = init ?? {};
    if (!timeout || !(timeout > 0)) {
        return await fetch(input, rest);
    }
    const abort = new AbortController();
    // keep the timer after the headers arrive so that it also aborts reading the body.
    // unref so that a pending timer does not keep the process alive
    const timer = setTimeout(() => {
        abort.abort();
    }, timeout);
    timer.unref();
    // init.signal replaces a Request's own signal, so keep the Request's one unless init gives a signal
    const caller_signal = rest.signal !== undefined ? rest.signal : input instanceof Request ? input.signal : null;
    const signal = caller_signal ? AbortSignal.any([caller_signal, abort.signal]) : abort.signal;
    try {
        return await fetch(input, { ...rest, signal });
    }
    catch (error) {
        clearTimeout(timer);
        throw error;
    }
}
