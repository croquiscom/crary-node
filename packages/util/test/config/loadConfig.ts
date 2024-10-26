import { expect } from 'chai';
import { loadConfig } from '../../src';

describe('loadConfig', () => {
  it('기본 설정을 로드한다', async () => {
    const config: any = loadConfig(`${__dirname}/sample`);

    const func = config?.nested?.func;
    delete config?.nested?.func;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(func).to.be.exist;
    expect(func(5)).to.eql(10);

    const prm = config?.nested?.prm;
    delete config?.nested?.prm;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(prm).to.be.exist;
    expect(await prm).to.eql('hello');

    expect(config).to.eql({
      project: 'sample',
      nested: {
        env: 'default',
        nested: {
          leaf: 5,
        },
        und: undefined,
        nul: null,
      },
    });
  });

  it('환경별 설정을 포함한다', () => {
    const config: any = loadConfig(`${__dirname}/sample`, undefined, 'my-env');

    expect(config).to.eql({
      project: 'sample',
      nested: {
        env: 'my-env',
        nested: {
          leaf: [1, 2],
        },
        und: undefined,
        nul: null,
        func: null,
        prm: undefined,
      },
    });
  });

  it('환경 설정에 기반이 되는 환경을 포함해 배열로 선언할 수 있다', () => {
    const config: any = loadConfig(`${__dirname}/sample`, undefined, 'my-env-alter');

    expect(config).to.eql({
      project: 'sample',
      nested: {
        env: 'my-env-alter',
        nested: {
          leaf: null,
        },
        und: undefined,
        nul: null,
        func: null,
        prm: undefined,
      },
    });
  });

  it('대체 설정 파일을 읽는다', () => {
    const config: any = loadConfig(`${__dirname}/sample`, undefined, 'dev-order-team');

    expect(config).to.eql({
      project: 'sample',
      nested: {
        env: 'dev-default',
        nested: {
          leaf: 5,
        },
        und: undefined,
        nul: null,
        func: null,
        prm: undefined,
      },
    });
  });
});
