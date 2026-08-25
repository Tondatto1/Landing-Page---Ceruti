import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('resume URL bootstrap', () => {
  it('captures and removes resume before the Meta Pixel loads', () => {
    const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
    const capture = html.indexOf('__CERUTI_CHECKOUT_RESUME_TOKEN__');
    const pixel = html.indexOf('Meta Pixel Code');
    expect(capture).toBeGreaterThan(-1);
    expect(capture).toBeLessThan(pixel);
    expect(html).toContain("params.delete('resume')");
    expect(html).toContain('window.history.replaceState');
  });

  it('blocks a supplied malformed resume value instead of falling back to normal checkout', () => {
    const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
    const script = html.match(/<script>\s*\/\/ A resume token[\s\S]*?<\/script>/)?.[0]
      .replace(/^<script>\s*|<\/script>$/g, '');
    expect(script).toBeTruthy();

    const url = new URL('https://lp.example.test/checkout?resume=not-a-valid-token');
    const browser = {
      location: { pathname: url.pathname, search: url.search, hash: url.hash },
      history: {
        state: null,
        replaceState: (_state: unknown, _title: string, next: string) => {
          const replaced = new URL(next, url.origin);
          browser.location.pathname = replaced.pathname;
          browser.location.search = replaced.search;
          browser.location.hash = replaced.hash;
        },
      },
    } as { location: { pathname: string; search: string; hash: string }; history: { state: null; replaceState: (_state: unknown, _title: string, next: string) => void }; __CERUTI_CHECKOUT_RESUME_REQUESTED__?: boolean; __CERUTI_CHECKOUT_RESUME_TOKEN__?: string };
    new Function('window', 'document', 'URLSearchParams', script!)(browser, { title: 'Checkout' }, URLSearchParams);

    expect(browser.location).toEqual({ pathname: '/checkout', search: '', hash: '' });
    expect(browser.__CERUTI_CHECKOUT_RESUME_REQUESTED__).toBe(true);
    expect(browser.__CERUTI_CHECKOUT_RESUME_TOKEN__).toBe('not-a-valid-token');
  });

  it('captures smoke_session and removes the entire sensitive hash before the Meta Pixel loads', () => {
    const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
    const capture = html.indexOf('__CERUTI_SMOKE_SESSION__');
    const pixel = html.indexOf('Meta Pixel Code');
    expect(capture).toBeGreaterThan(-1);
    expect(capture).toBeLessThan(pixel);
    expect(html).toContain("query.get('smoke') !== '1'");
    expect(html).toContain('smoke_session=([^&]*)');
    expect(html).toContain('window.location.pathname + window.location.search');
  });

  it('keeps the smoke query while removing smoke_session at runtime', () => {
    const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
    const script = html.match(/<script>\s*\/\/ Smoke sessions[\s\S]*?<\/script>/)?.[0]
      .replace(/^<script>\s*|<\/script>$/g, '');
    expect(script).toBeTruthy();

    const token = 'payload+segment.signature/with=padding';
    const url = new URL(`https://lp.example.test/checkout?agent=campo&smoke=1#smoke_session=${token}`);
    const browser = {
      location: { pathname: url.pathname, search: url.search, hash: url.hash },
      history: {
        state: null,
        replaceState: (_state: unknown, _title: string, next: string) => {
          const replaced = new URL(next, url.origin);
          browser.location.pathname = replaced.pathname;
          browser.location.search = replaced.search;
          browser.location.hash = replaced.hash;
        },
      },
    };
    new Function('window', 'document', 'URLSearchParams', script!)(browser, { title: 'Checkout' }, URLSearchParams);

    expect(browser.location).toEqual({ pathname: '/checkout', search: '?agent=campo&smoke=1', hash: '' });
    expect(browser).toMatchObject({ __CERUTI_SMOKE_SESSION__: token });
  });
});
