import { BaseModel } from '../src';
import { Field, HashKey, Model, RangeKey } from '../src/Decorators';
import { types } from '../src/Dynogels';

@Model
export class TestModel extends BaseModel {
  @HashKey
  @Field(types.number())
  hashf!: number;

  @RangeKey
  @Field(types.string())
  rangef!: string;

  @Field(types.string())
  strf!: string;

  @Field(types.array())
  strarrf?: string[];

  @Field(types.date())
  datef?: Date;
}
