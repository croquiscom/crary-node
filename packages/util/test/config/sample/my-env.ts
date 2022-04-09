import { BaseConfigType } from './default';

const Config: BaseConfigType = {
  nested: {
    env: 'my-env',
    nested: {
      leaf: [1, 2],
    },
    func: null,
    prm: undefined,
  },
};

export default Config;
