declare function Model(target: any): void;
export declare function SubModel(target: any): void;
declare function HashKey(target: any, property: string | symbol): void;
declare function RangeKey(target: any, property: string | symbol): void;
declare function Field(type: any): (target: any, property: string | symbol) => void;
export declare function ArrayField(type: any): (target: any, property: string | symbol) => void;
declare function GlobalIndex(hashKey: string, rangeKey?: string, projection?: object): (target: any, property: string | symbol) => void;
declare function LocalIndex(rangeKey: string): (target: any, property: string | symbol) => void;
export { Model, HashKey, RangeKey, Field, GlobalIndex, LocalIndex };
