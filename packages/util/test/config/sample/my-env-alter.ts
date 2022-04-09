import { BaseConfigType } from './default';
import MyEnvConfig from './my-env';

const Config: BaseConfigType = {
  nested: {
    env: 'my-env-alter',
    nested: {
      leaf: null,
    },
  },
};

export default [MyEnvConfig, Config];
