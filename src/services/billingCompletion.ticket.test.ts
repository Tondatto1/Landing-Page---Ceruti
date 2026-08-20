import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  COMPLETION_API_URL,
  exchangeCompletionTicket,
  getBillingCompletion,
  getCompletionTicketFromHash,
} from './billingCompletion';

const ticket = `ct_${'a'.repeat(43)}`;
const completion = {
  firstName: 'Teste',
  agentType: 'campo',
  agentLabel: 'Campo',
  frequencyLabel: 'Mensal',
  paymentMethodLabel: 'Pix',
  activationStatus: 'activating',
  accessNumbers: [{ display: '11999999999', status: 'activating' }],
  paidAt: '2026-08-18T12:00:00.000Z',
};

afterEach(() => vi.unstubAllGlobals());

describe('Billing completion ticket boundary', () => {
  it('reads only a valid ticket from the fragment, never from query parameters', () => {
    expect(getCompletionTicketFromHash(`#ticket=${ticket}`)).toBe(ticket);
    expect(getCompletionTicketFromHash('ticket=invalid')).toBeNull();
    expect(getCompletionTicketFromHash('')).toBeNull();
  });

  it('exchanges then validates through the configured API origin with credentials included', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ ok: true, completion }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
    vi.stubGlobal('fetch', fetcher);

    await exchangeCompletionTicket(ticket);
    await getBillingCompletion();

    expect(fetcher).toHaveBeenNthCalledWith(1, `${COMPLETION_API_URL}/billing/completion/exchange`, expect.objectContaining({
      method: 'POST', credentials: 'include', body: JSON.stringify({ ticket }),
    }));
    expect(fetcher).toHaveBeenNthCalledWith(2, `${COMPLETION_API_URL}/billing/completion`, expect.objectContaining({
      method: 'GET', credentials: 'include',
    }));
  });
});
