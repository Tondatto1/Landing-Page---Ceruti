import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('WhatsAppWidget support and checkout presentation', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/components/WhatsAppWidget.tsx'), 'utf8').replace(/\r\n/g, '\n');

  it('uses one normalized support number and keeps it in the WhatsApp CTA', () => {
    expect(source).toContain("export const WHATSAPP_SUPPORT_NUMBER = '5567999034874';");
    expect(source).toContain('https://wa.me/${WHATSAPP_SUPPORT_NUMBER}?text=');
    expect(source).not.toContain('5567981246558');
  });

  it('identifies checkout by pathname instead of page text or DOM queries', () => {
    expect(source).toContain("pathname === '/checkout' || pathname.startsWith('/checkout/')");
    expect(source).toContain('const isCheckout = isCheckoutPathname(location.pathname);');
    expect(source).not.toContain('document.querySelector');
    expect(source).not.toContain('innerText.includes');
  });

  it('removes continuous attention effects only from the checkout variant', () => {
    expect(source).toContain('{showBalloon && !isOpen && !isCheckout && (');
    expect(source).toContain('{!isOpen && !isCheckout && (');
    expect(source).toContain('isTestOption && !isCheckout');
    expect(source).toContain("isCheckout ? undefined : { filter: \"url(#glow-border)\" }");
    expect(source).toContain("isCheckout ? 'w-12 h-12 sm:w-14 sm:h-14");
    expect(source).toContain("isCheckout ? 'bottom-[calc(1rem+env(safe-area-inset-bottom))]");
  });

  it('preserves keyboard/click access with an accessible support button', () => {
    expect(source).toContain('id="whatsapp_floating_button"');
    expect(source).toContain('aria-label="Falar com o suporte pelo WhatsApp"');
    expect(source).toContain('onClick={toggleWidget}');
    expect(source).toContain('cursor-pointer');
  });
});
