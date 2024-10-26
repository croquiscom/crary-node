import type { DeepPartial } from 'ts-essentials';

function cloneDeep(obj: null | undefined): null | undefined;
function cloneDeep<T extends Record<string, any>>(obj: T): T;
function cloneDeep<T extends Record<string, any>>(obj: T | null): T | null {
  if (!obj) {
    return obj;
  }
  if (obj instanceof Promise) {
    return obj;
  }
  const copied = (Array.isArray(obj) ? [] : {}) as T;
  for (const key in obj) {
    const value = obj[key];
    copied[key] = typeof value === 'object' ? cloneDeep(value) : value;
  }
  return copied;
}

function merge<T extends Record<string, any>>(obj: T, other: T | null) {
  if (!other) {
    return;
  }
  for (const key in other) {
    if (!other[key]) {
      obj[key] = other[key];
    } else if (typeof other[key] === 'object' && typeof obj[key] === 'object') {
      merge(obj[key], other[key]);
    } else {
      obj[key] = other[key];
    }
  }
}

function loadConfigByList(dir: string, file_list: string[]) {
  for (const file of file_list) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const config = require(`${dir}/${file}`).default;
      return config;
    } catch {
      // 파일을 찾지 못하면 무시하고 다음 설정으로 넘어간다
    }
  }
  throw new Error('can not find');
}

function defaultGetAltEnv(env: string): string[] {
  if (env === 'beta' || env.startsWith('beta-')) {
    return ['production'];
  } else if (env === 'real-beta' || env.startsWith('real-beta-')) {
    return ['real-prod'];
  } else if (env.startsWith('dev-')) {
    return ['dev-default', 'alpha'];
  } else if (env.startsWith('real-dev-')) {
    return ['real-dev-default', 'real-alpha'];
  }
  return [];
}

/**
 * 해당 디렉토리에 있는 설정값을 읽는다.
 *
 * 사용방법
 * - `const Config = loadConfig<typeof BaseConfig>(__dirname);`
 *
 * 기본적으로 default.js 파일을 읽는다. 추가로 <env>.js 파일의 내용을 읽어 덮어 쓴다.
 * getAltEnv 인자를 제공하면 <env>.js 파일이 없을 경우 대체해서 읽을 파일을 지정할 수 있다.
 *
 * 기본적으로는 다음 환경에 대해 다음과 같이 대체 파일이 지정되어 있다.
 * * beta -> production
 * * real-beta -> real-prod
 * * dev-xxx -> dev-default 또는 alpha (dev-xxx가 존재하면 dev-default는 읽지 않는다.)
 * * real-dev-xxx -> real-dev-default 또는 real-alpha
 */
export function loadConfig<T extends Record<string, any>>(
  dir: string,
  getAltEnv: (env: string) => string[] = defaultGetAltEnv,
  env_for_test?: string,
): T {
  const env = env_for_test || process.env.NODE_ENV;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const base = cloneDeep(require(`${dir}/default`).default as T);

  if (env) {
    try {
      const file_list = [env, ...getAltEnv(env)];
      const env_config = loadConfigByList(dir, file_list) as T;
      if (Array.isArray(env_config)) {
        for (const item of env_config as T[]) {
          merge(base, item);
        }
      } else {
        merge(base, env_config);
      }
    } catch {
      console.log(`Cannot find configs for env=${env}`);
    }
  }

  return base;
}

export type { DeepPartial };
