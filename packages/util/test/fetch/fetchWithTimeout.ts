import http from 'node:http';
import { AddressInfo } from 'node:net';
import { expect } from 'chai';
import { fetchWithTimeout } from '../../src';

describe('fetchWithTimeout', () => {
  let server: http.Server;
  let base_url: string;

  before(async () => {
    server = http.createServer((req, res) => {
      const delay = Number(new URL(req.url ?? '/', 'http://localhost').searchParams.get('delay') ?? 0);
      setTimeout(() => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ method: req.method }));
      }, delay);
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    base_url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  after(async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  });

  it('timeout 이 없으면 그대로 요청한다', async () => {
    const response = await fetchWithTimeout(`${base_url}/`, { method: 'POST' });
    expect(response.ok).to.eql(true);
    expect(await response.json()).to.eql({ method: 'POST' });
  });

  it('timeout 안에 응답하면 성공한다', async () => {
    const response = await fetchWithTimeout(`${base_url}/?delay=10`, { timeout: 1000 });
    expect(await response.json()).to.eql({ method: 'GET' });
  });

  it('timeout 을 넘기면 AbortError 로 실패한다', async () => {
    try {
      await fetchWithTimeout(`${base_url}/?delay=500`, { timeout: 50 });
      expect.fail('should be rejected');
    } catch (error: any) {
      expect(error.name).to.eql('AbortError');
    }
  });

  it('호출하는 쪽의 signal 도 함께 적용한다', async () => {
    const abort = new AbortController();
    setTimeout(() => {
      abort.abort();
    }, 50);
    try {
      await fetchWithTimeout(`${base_url}/?delay=500`, { timeout: 1000, signal: abort.signal });
      expect.fail('should be rejected');
    } catch (error: any) {
      expect(error.name).to.eql('AbortError');
    }
  });

  it('Request 의 signal 이 이미 abort 됐으면 실패한다', async () => {
    const abort = new AbortController();
    abort.abort();
    try {
      await fetchWithTimeout(new Request(`${base_url}/`, { signal: abort.signal }), { timeout: 1000 });
      expect.fail('should be rejected');
    } catch (error: any) {
      expect(error.name).to.eql('AbortError');
    }
  });

  it('Request 의 signal 로 나중에 취소할 수 있다', async () => {
    const abort = new AbortController();
    setTimeout(() => {
      abort.abort();
    }, 50);
    try {
      await fetchWithTimeout(new Request(`${base_url}/?delay=500`, { signal: abort.signal }), { timeout: 1000 });
      expect.fail('should be rejected');
    } catch (error: any) {
      expect(error.name).to.eql('AbortError');
    }
  });

  it('Request 를 넘겨도 timeout 이 적용된다', async () => {
    try {
      await fetchWithTimeout(new Request(`${base_url}/?delay=500`), { timeout: 50 });
      expect.fail('should be rejected');
    } catch (error: any) {
      expect(error.name).to.eql('AbortError');
    }
  });
});
