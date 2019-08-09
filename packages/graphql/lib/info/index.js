"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const addArgumentToInfo_1 = require("./addArgumentToInfo");
exports.addArgumentToInfo = addArgumentToInfo_1.addArgumentToInfo;
const addFieldToInfo_1 = require("./addFieldToInfo");
exports.addFieldToInfo = addFieldToInfo_1.addFieldToInfo;
const conformInfoToSchema_1 = require("./conformInfoToSchema");
exports.conformInfoToSchema = conformInfoToSchema_1.conformInfoToSchema;
var getFieldList_1 = require("./getFieldList");
exports.getFieldList = getFieldList_1.getFieldList;
exports.getFieldList1st = getFieldList_1.getFieldList1st;
var getFieldString_1 = require("./getFieldString");
exports.getFieldString = getFieldString_1.getFieldString;
const removeArgumentFromInfo_1 = require("./removeArgumentFromInfo");
exports.removeArgumentFromInfo = removeArgumentFromInfo_1.removeArgumentFromInfo;
function wrapInfo(info) {
    return Object.assign({}, info, { addArgument(name, value, type, path) { return addArgumentToInfo_1.addArgumentToInfo(this, name, value, type, path); },
        addField(name, path) { return addFieldToInfo_1.addFieldToInfo(this, name, path); },
        removeArgument(name) { return removeArgumentFromInfo_1.removeArgumentFromInfo(this, name); },
        conformToSchema(schema, fragments) { return conformInfoToSchema_1.conformInfoToSchema(this, schema, fragments); } });
}
exports.wrapInfo = wrapInfo;
