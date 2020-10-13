"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapInfo = exports.removeFieldFromInfo = exports.removeArgumentFromInfo = exports.getFieldString = exports.getFieldList1st = exports.getFieldList = exports.conformInfoToSchema = exports.addFieldToInfo = exports.addArgumentToInfo = void 0;
const addArgumentToInfo_1 = require("./addArgumentToInfo");
Object.defineProperty(exports, "addArgumentToInfo", { enumerable: true, get: function () { return addArgumentToInfo_1.addArgumentToInfo; } });
const addFieldToInfo_1 = require("./addFieldToInfo");
Object.defineProperty(exports, "addFieldToInfo", { enumerable: true, get: function () { return addFieldToInfo_1.addFieldToInfo; } });
const conformInfoToSchema_1 = require("./conformInfoToSchema");
Object.defineProperty(exports, "conformInfoToSchema", { enumerable: true, get: function () { return conformInfoToSchema_1.conformInfoToSchema; } });
var getFieldList_1 = require("./getFieldList");
Object.defineProperty(exports, "getFieldList", { enumerable: true, get: function () { return getFieldList_1.getFieldList; } });
Object.defineProperty(exports, "getFieldList1st", { enumerable: true, get: function () { return getFieldList_1.getFieldList1st; } });
var getFieldString_1 = require("./getFieldString");
Object.defineProperty(exports, "getFieldString", { enumerable: true, get: function () { return getFieldString_1.getFieldString; } });
const removeArgumentFromInfo_1 = require("./removeArgumentFromInfo");
Object.defineProperty(exports, "removeArgumentFromInfo", { enumerable: true, get: function () { return removeArgumentFromInfo_1.removeArgumentFromInfo; } });
const removeFieldFromInfo_1 = require("./removeFieldFromInfo");
Object.defineProperty(exports, "removeFieldFromInfo", { enumerable: true, get: function () { return removeFieldFromInfo_1.removeFieldFromInfo; } });
function wrapInfo(info) {
    return Object.assign(Object.assign({}, info), { addArgument(name, value, type, options) { return addArgumentToInfo_1.addArgumentToInfo(this, name, value, type, options); },
        addField(name, options) { return addFieldToInfo_1.addFieldToInfo(this, name, options); },
        removeField(name, options) { return removeFieldFromInfo_1.removeFieldFromInfo(this, name, options); },
        removeArgument(name) { return removeArgumentFromInfo_1.removeArgumentFromInfo(this, name); },
        conformToSchema(schema) { return conformInfoToSchema_1.conformInfoToSchema(this, schema); } });
}
exports.wrapInfo = wrapInfo;
