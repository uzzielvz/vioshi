import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildOrderPaidEmail, escapeHtml, formatMxn, type OrderPaidEmailInput } from '../lib/email/orderPaid';

const base: OrderPaidEmailInput = {
  orderNumber: 'VIO-2026-0042',
  firstName: 'Mariana',
  items: [
    { name: 'Chamarra de nylon', size: 'L', priceMxn: 700, image: '/products/chamarra.png' },
    { name: 'Playera corona', size: null, priceMxn: 1200, image: 'https://cdn.example.com/p.jpg' },
  ],
  subtotalMxn: 1900,
  shippingMxn: 10,
  totalMxn: 1910,
  paymentLabel: 'tarjeta',
  delivery: { kind: 'pickup', name: 'Rectoría — Maneki', address: 'Instituto Literario 305, Toluca', hours: 'Lun–Dom 10:00–18:00' },
  orderUrl: 'https://rail.example/es/checkout/success/VIO-2026-0042?t=abc',
  siteUrl: 'https://rail.example',
  brandName: 'rail',
  supportEmail: 'soporte@rail.example',
};

test('subject and greeting name the order and the person', () => {
  const email = buildOrderPaidEmail(base);
  assert.equal(email.subject, 'Tu pedido VIO-2026-0042 está pagado');
  assert.match(email.html, /Listo, Mariana\. Tu pedido está pagado\./);
  assert.match(email.text, /^Listo, Mariana\. Tu pedido VIO-2026-0042 está pagado\./);
});

test('totals, delivery point and the order link are in both versions', () => {
  const email = buildOrderPaidEmail(base);
  for (const body of [email.html, email.text]) {
    assert.ok(body.includes('$1,910'), 'total');
    assert.ok(body.includes('$1,200'), 'thousands separator');
    assert.ok(body.includes('Recoges en Rectoría — Maneki'));
    assert.ok(body.includes('Talla L') || body.includes('talla L'));
  }
  assert.ok(email.html.includes('href="https://rail.example/es/checkout/success/VIO-2026-0042?t=abc"'));
});

test('relative product images become absolute; absolute ones stay', () => {
  const { html } = buildOrderPaidEmail(base);
  assert.ok(html.includes('src="https://rail.example/products/chamarra.png"'));
  assert.ok(html.includes('src="https://cdn.example.com/p.jpg"'));
});

test('names and notes cannot inject markup', () => {
  const { html } = buildOrderPaidEmail({
    ...base,
    firstName: '<script>x</script>',
    items: [{ name: 'Gorra "Supreme" <b>', size: null, priceMxn: 500, image: null }],
  });
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('Gorra &quot;Supreme&quot; &lt;b&gt;'));
});

test('home delivery, free shipping and no name', () => {
  const email = buildOrderPaidEmail({
    ...base,
    firstName: null,
    shippingMxn: 0,
    delivery: { kind: 'home', address: 'Av. Hidalgo 120, Centro, Toluca, 50000' },
  });
  assert.match(email.text, /^Listo\. Tu pedido/);
  assert.ok(email.text.includes('Envío a domicilio'));
  assert.ok(email.text.includes('Entrega: Sin costo'));
});

test('helpers', () => {
  assert.equal(escapeHtml(`a&b<'"`), 'a&amp;b&lt;&#39;&quot;');
  assert.equal(formatMxn(910), '$910');
  assert.equal(formatMxn(99.5), '$99.5');
});
