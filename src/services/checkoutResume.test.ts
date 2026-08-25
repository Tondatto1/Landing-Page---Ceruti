import { describe, expect, it, vi } from 'vitest';
import { consumeCapturedCheckoutResumeRequest, getCapturedCheckoutResumeToken, getCheckoutResumeContext } from './checkoutResume';

const token = `rsm_${'a'.repeat(32)}`;

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('getCheckoutResumeContext', () => {
  it('loads only the valid Campo resume context with no-store transport options', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response({
      ok: true,
      resume: {
        agentType: 'campo',
        prefill: { name: 'Ana Teste', email: 'ana@example.test', phone: '+5567999999999' },
        offer: {
          allowedFrequencies: ['monthly', 'annual'],
          maxAccessQuantity: 3,
        },
      },
    }));

    await expect(getCheckoutResumeContext(token, undefined, fetcher)).resolves.toMatchObject({
      agentType: 'campo',
      prefill: { name: 'Ana Teste', email: 'ana@example.test', phone: '+5567999999999' },
      allowedFrequencies: ['monthly', 'annual'],
      maxAccessQuantity: 3,
    });
    expect(fetcher).toHaveBeenCalledWith(expect.stringContaining('token='), expect.objectContaining({
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
    }));
  });

  it.each([
    [400, 'RESUME_TOKEN_INVALID'],
    [404, 'RESUME_NOT_FOUND'],
    [410, 'RESUME_EXPIRED'],
    [409, 'RESUME_TRIAL_STILL_ACTIVE'],
    [409, 'RESUME_ALREADY_CONVERTED'],
    [409, 'RESUME_ALREADY_USED'],
    [409, 'RESUME_EVENT_NOT_ELIGIBLE'],
  ] as const)('maps %s %s without exposing response details', async (status, code) => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response({ ok: false, error: { code } }, status));
    await expect(getCheckoutResumeContext(token, undefined, fetcher)).rejects.toMatchObject({
      code,
      status,
    });
  });

  it('moves the captured bearer out of window after reading it', () => {
    vi.stubGlobal('window', { __CERUTI_CHECKOUT_RESUME_TOKEN__: token, __CERUTI_CHECKOUT_RESUME_REQUESTED__: true });
    expect(getCapturedCheckoutResumeToken()).toBe(token);
    expect((window as { __CERUTI_CHECKOUT_RESUME_TOKEN__?: string }).__CERUTI_CHECKOUT_RESUME_TOKEN__).toBeUndefined();
    expect(consumeCapturedCheckoutResumeRequest()).toBe(true);
    expect((window as { __CERUTI_CHECKOUT_RESUME_REQUESTED__?: boolean }).__CERUTI_CHECKOUT_RESUME_REQUESTED__).toBeUndefined();
    vi.unstubAllGlobals();
  });

  it('rejects a supplied malformed resume value instead of treating it as normal checkout', () => {
    vi.stubGlobal('window', { __CERUTI_CHECKOUT_RESUME_TOKEN__: 'not-a-valid-token', __CERUTI_CHECKOUT_RESUME_REQUESTED__: true });
    expect(getCapturedCheckoutResumeToken()).toBeNull();
    expect(consumeCapturedCheckoutResumeRequest()).toBe(true);
    vi.unstubAllGlobals();
  });
});
