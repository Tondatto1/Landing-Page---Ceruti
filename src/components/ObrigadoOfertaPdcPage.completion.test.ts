import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('/obrigado completion guard', () => {
  it('does not render restricted offer content before the existing completion cookie is validated', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/components/ObrigadoOfertaPdcPage.tsx'), 'utf8');
    expect(source).toContain('getBillingCompletion(controller.signal)');
    expect(source).toContain("completionState !== 'authorized'");
    expect(source).not.toContain('localStorage');
  });
});
