import { DeepPartial } from '../../../src/config';

const Config = {
  project: 'sample',

  nested: {
    env: 'default',
    nested: {
      leaf: 5 as any,
    },
    und: undefined,
    nul: null,
    func: ((a: number) => a * 2) as ((a: number) => number) | null,
    prm: new Promise((resolve) => setTimeout(() => resolve('hello'), 50)) as Promise<string> | undefined,
  },
};

export type BaseConfigType = DeepPartial<typeof Config>;

export default Config;
