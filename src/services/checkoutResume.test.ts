import { describe, expect, it, vi } from 'vitest';
import { getCheckoutResumeContext } from './checkoutResume';

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
        customer: { name: 'Ana Teste', email: 'ana@example.test', phone: '67999999999' },
        offer: {
          allowedFrequencies: ['monthly', 'annual'],
          defaultFrequency: 'annual',
          maxAccessQuantity: 3,
          defaultAccessQuantity: 2,
        },
      },
    }));

    await expect(getCheckoutResumeContext(token, undefined, fetcher)).resolves.toMatchObject({
      agentType: 'campo',
      defaultFrequency: 'annual',
      defaultAccessQuantity: 2,
    });
    expect(fetcher).toHaveBeenCalledWith(expect.stringContaining('token='), expect.objectContaining({
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
    }));
  });

  it.each([
    [404, 'RESUME_NOT_FOUND'],
    [410, 'RESUME_EXPIRED'],
    [409, 'RESUME_TRIAL_STILL_ACTIVE'],
    [409, 'RESUME_ALREADY_CONVERTED'],
    [409, 'RESUME_ALREADY_USED'],
  ] as const)('maps %s %s without exposing response details', async (status, code) => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response({ ok: false, error: { code } }, status));
    await expect(getCheckoutResumeContext(token, undefined, fetcher)).rejects.toMatchObject({
      code,
      status,
    });
  });
});
