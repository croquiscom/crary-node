"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchWithTimeout = void 0;
const node_abort_controller_1 = require("node-abort-controller");
const tsimportlib_1 = require("tsimportlib");
const nodeFetchModule = (0, tsimportlib_1.dynamicImport)('node-fetch', module);
async function fetchWithTimeout(url, init) {
    const nodeFetch = (await nodeFetchModule).default;
    const timeout = init?.timeout;
    if (!timeout || !(timeout > 0)) {
        return await nodeFetch(url, init);
    }
    const abort = new node_abort_controller_1.AbortController();
    const timer = setTimeout(() => {
        abort.abort();
    }, timeout);
    const init_copied = {
        ...init,
        signal: abort.signal,
    };
    delete init_copied.timeout;
    try {
        return await nodeFetch(url, init_copied);
    }
    finally {
        clearTimeout(timer);
    }
}
exports.fetchWithTimeout = fetchWithTimeout;
