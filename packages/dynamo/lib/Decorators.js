"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalIndex = exports.GlobalIndex = exports.Field = exports.RangeKey = exports.HashKey = exports.Model = exports.ArrayField = exports.SubModel = void 0;
const _ = __importStar(require("lodash"));
const Dynogels_1 = require("./Dynogels");
const ModelDefs = {};
function getModelDefinition(name) {
    if (!ModelDefs[name]) {
        ModelDefs[name] = { schema: {}, indexes: [] };
    }
    return ModelDefs[name];
}
function Model(target) {
    const modelName = target.prototype.constructor.name;
    const def = getModelDefinition(modelName);
    target.setSchema(modelName, def);
}
exports.Model = Model;
function SubModel(target) {
    const modelName = target.prototype.constructor.name;
    const def = getModelDefinition(modelName);
    ModelDefs[modelName] = Dynogels_1.types.object().keys(def.schema);
}
exports.SubModel = SubModel;
function HashKey(target, property) {
    const modelName = target.constructor.name;
    const def = getModelDefinition(modelName);
    def.hashKey = property;
}
exports.HashKey = HashKey;
function RangeKey(target, property) {
    const modelName = target.constructor.name;
    const def = getModelDefinition(modelName);
    def.rangeKey = property;
}
exports.RangeKey = RangeKey;
function getModelDefinitionByVariantType(type) {
    if (typeof type === 'string') {
        return getModelDefinition(type);
    }
    else if (typeof type === 'function') {
        return getModelDefinition(type.prototype.constructor.name);
    }
    else {
        return type;
    }
}
function Field(type) {
    // tslint:disable-next-line: only-arrow-functions
    return function (target, property) {
        const modelName = target.constructor.name;
        const def = getModelDefinition(modelName);
        def.schema[property] = getModelDefinitionByVariantType(type);
    };
}
exports.Field = Field;
function ArrayField(type) {
    // tslint:disable-next-line: only-arrow-functions
    return function (target, property) {
        const modelName = target.constructor.name; // AdDisplaySlot
        const def = getModelDefinition(modelName);
        const arrayModel = getModelDefinitionByVariantType(type);
        def.schema[property] = Dynogels_1.types.array().items(arrayModel);
    };
}
exports.ArrayField = ArrayField;
function GlobalIndex(hashKey, rangeKey, projection) {
    // tslint:disable-next-line: only-arrow-functions
    return function (target, property) {
        const modelName = target.prototype.constructor.name;
        const def = getModelDefinition(modelName);
        const globalIndex = { name: property, hashKey, type: 'global', projection };
        if (rangeKey) {
            _.assign(globalIndex, { rangeKey });
        }
        def.indexes.push(globalIndex);
        target[property] = `${property.toString()}`;
    };
}
exports.GlobalIndex = GlobalIndex;
function LocalIndex(rangeKey) {
    // tslint:disable-next-line: only-arrow-functions
    return function (target, property) {
        const modelName = target.prototype.constructor.name;
        const def = getModelDefinition(modelName);
        const localIndex = { name: property, hashKey: def.hashKey, rangeKey, type: 'local' };
        def.indexes.push(localIndex);
        target[property] = `${property.toString()}`;
    };
}
exports.LocalIndex = LocalIndex;
