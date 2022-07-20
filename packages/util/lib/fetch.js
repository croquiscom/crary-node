"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchWithTimeout = void 0;
const node_abort_controller_1 = require("node-abort-controller");
const node_fetch_1 = __importDefault(require("node-fetch"));
async function fetchWithTimeout(url, init) {
    if (!(init?.timeout > 0)) {
        throw new Error('invalid timeout');
    }
    const timeout = init.timeout;
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
        return await (0, node_fetch_1.default)(url, init_copied);
    }
    finally {
        clearTimeout(timer);
    }
}
exports.fetchWithTimeout = fetchWithTimeout;
