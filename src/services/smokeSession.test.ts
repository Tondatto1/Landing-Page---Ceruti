import { describe, expect, it, vi } from 'vitest';

describe('smoke session memory boundary', () => {
  it('takes the bootstrap token from memory once and removes the browser global', async () => {
    vi.resetModules();
    const browser = { __CERUTI_SMOKE_SESSION__: 'opaque-smoke-session-1234' };
    vi.stubGlobal('window', browser);
    const { consumeCapturedSmokeSession } = await import('./smokeSession');

    expect(consumeCapturedSmokeSession()).toBe('opaque-smoke-session-1234');
    expect(browser).not.toHaveProperty('__CERUTI_SMOKE_SESSION__');
    expect(consumeCapturedSmokeSession()).toBe('opaque-smoke-session-1234');
    expect('localStorage' in browser).toBe(false);
    expect('sessionStorage' in browser).toBe(false);
    vi.unstubAllGlobals();
  });

  it('replaces HMR-preserved state when a newly captured session exists', async () => {
    vi.resetModules();
    const browser = { __CERUTI_SMOKE_SESSION__: 'old-session-token-1234' };
    vi.stubGlobal('window', browser);
    const { consumeCapturedSmokeSession } = await import('./smokeSession');
    expect(consumeCapturedSmokeSession()).toBe('old-session-token-1234');

    browser.__CERUTI_SMOKE_SESSION__ = 'new+session.signature/with=padding';
    expect(consumeCapturedSmokeSession()).toBe('new+session.signature/with=padding');
    expect(browser).not.toHaveProperty('__CERUTI_SMOKE_SESSION__');
    vi.unstubAllGlobals();
  });
});
