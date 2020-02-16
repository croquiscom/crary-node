"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const create_app_1 = __importDefault(require("./create_app"));
exports.createApp = create_app_1.default;
var util_1 = require("./util");
exports.shrinkStackTrace = util_1.shrinkStackTrace;
