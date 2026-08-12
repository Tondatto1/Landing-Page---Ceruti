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
});
