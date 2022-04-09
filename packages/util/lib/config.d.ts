import type { DeepPartial } from 'ts-essentials';
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
export declare function loadConfig<T>(dir: string, getAltEnv?: (env: string) => string[], env_for_test?: string): T;
export type { DeepPartial };
