import * as _ from 'lodash';
import { types as Types } from './Dynogels';

const ModelDefs = {};
function getModelDefinition(name: string) {
  if (!ModelDefs[name]) {
    ModelDefs[name] = { schema: {}, indexes: [] };
  }

  return ModelDefs[name];
}

function Model(target: any) {
  const modelName = target.prototype.constructor.name;
  const def = getModelDefinition(modelName);
  target.setSchema(modelName, def);
}

export function SubModel(target: any) {
  const modelName = target.prototype.constructor.name;
  const def = getModelDefinition(modelName);
  ModelDefs[modelName] = Types.object().keys(def.schema);
}

function HashKey(target: any, property: string | symbol) {
  const modelName = target.constructor.name;
  const def = getModelDefinition(modelName);
  def.hashKey = property;
}

function RangeKey(target: any, property: string | symbol) {
  const modelName = target.constructor.name;
  const def = getModelDefinition(modelName);
  def.rangeKey = property;
}

function getModelDefinitionByVariantType(type: any) {
  if (typeof type === 'string') {
    return getModelDefinition(type);
  } else if (typeof type === 'function') {
    return getModelDefinition(type.prototype.constructor.name);
  } else {
    return type;
  }
}

function Field(type: any) {
  // tslint:disable-next-line: only-arrow-functions
  return function(target: any, property: string | symbol) {
    const modelName = target.constructor.name;
    const def = getModelDefinition(modelName);
    def.schema[property] = getModelDefinitionByVariantType(type);
  };
}

export function ArrayField(type: any) {
  // tslint:disable-next-line: only-arrow-functions
  return function(target: any, property: string | symbol) {
    const modelName = target.constructor.name; // AdDisplaySlot
    const def = getModelDefinition(modelName);

    const arrayModel = getModelDefinitionByVariantType(type);
    def.schema[property] = Types.array().items(arrayModel);
  };
}

function GlobalIndex(hashKey: string, rangeKey?: string, projection?: object) {
  // tslint:disable-next-line: only-arrow-functions
  return function(target: any, property: string | symbol) {
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

function LocalIndex(rangeKey: string) {
  // tslint:disable-next-line: only-arrow-functions
  return function(target: any, property: string | symbol) {
    const modelName = target.prototype.constructor.name;
    const def = getModelDefinition(modelName);
    const localIndex = { name: property, hashKey: def.hashKey, rangeKey, type: 'local' };
    def.indexes.push(localIndex);
    target[property] = `${property.toString()}`;
  };
}

export { Model, HashKey, RangeKey, Field, GlobalIndex, LocalIndex };
