// «Tu pedido está pagado»: plain data in, strings out, so it can be tested
// without Stripe, Supabase or Resend.

export interface OrderPaidEmailInput {
  orderNumber: string;
  firstName: string | null;
  items: { name: string; size: string | null; priceMxn: number; image: string | null }[];
  subtotalMxn: number;
  shippingMxn: number;
  totalMxn: number;
  /** «tarjeta», «OXXO» or «transferencia (SPEI)». */
  paymentLabel: string;
  delivery:
    | { kind: 'pickup'; name: string; address: string | null; hours: string | null }
    | { kind: 'home'; address: string | null };
  /** Absolute link to the order page; works without an account. */
  orderUrl: string;
  siteUrl: string;
  brandName: string;
  supportEmail: string;
}

const INK = '#111111';
const MUTED = '#6B6B66';
const LINE = '#E4E2DC';
const CARTON = '#F3F2EE';
const ACCENT = '#1F2BFF';

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatMxn(amount: number): string {
  return `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function absolute(url: string | null, siteUrl: string): string | null {
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  return `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function buildOrderPaidEmail(input: OrderPaidEmailInput): { subject: string; html: string; text: string } {
  const e = escapeHtml;
  const greeting = input.firstName?.trim() ? `Listo, ${input.firstName.trim()}.` : 'Listo.';
  const subject = `Tu pedido ${input.orderNumber} está pagado`;

  const delivery = (
    input.delivery.kind === 'pickup'
      ? [
          `Recoges en ${input.delivery.name}`,
          input.delivery.address,
          input.delivery.hours,
          'Te avisamos cuando esté lista. Lleva tu número de pedido.',
        ]
      : ['Envío a domicilio', input.delivery.address, 'Te avisamos cuando salga.']
  ).filter((line): line is string => Boolean(line));

  const itemRows = input.items
    .map((item) => {
      const img = absolute(item.image, input.siteUrl);
      const thumb = img
        ? `<img src="${e(img)}" width="48" height="64" alt="" style="display:block;width:48px;height:64px;object-fit:cover;background:${CARTON}">`
        : `<div style="width:48px;height:64px;background:${CARTON}"></div>`;
      return `
        <tr>
          <td width="60" style="padding:10px 12px 10px 0;vertical-align:middle">${thumb}</td>
          <td style="padding:10px 0;vertical-align:middle;font-size:14px;color:${INK}">
            <div style="font-weight:600">${e(item.name)}</div>
            ${item.size ? `<div style="font-size:12.5px;color:${MUTED}">Talla ${e(item.size)}</div>` : ''}
          </td>
          <td align="right" style="padding:10px 0 10px 12px;vertical-align:middle;font-size:14px;font-weight:600;color:${INK};white-space:nowrap">${formatMxn(item.priceMxn)}</td>
        </tr>`;
    })
    .join('');

  const totalRow = (label: string, value: string, strong = false) => `
        <tr>
          <td style="padding:3px 0;font-size:${strong ? 15 : 14}px;color:${INK};${strong ? 'font-weight:700' : ''}">${label}</td>
          <td align="right" style="padding:3px 0;font-size:${strong ? 15 : 14}px;color:${INK};${strong ? 'font-weight:700' : ''}">${value}</td>
        </tr>`;
  const shipping = input.shippingMxn > 0 ? formatMxn(input.shippingMxn) : 'Sin costo';

  const html = `<!doctype html>
<html lang="es">
<body style="margin:0;padding:0;background:#ffffff;font-family:Inter,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:${INK}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff">
    <tr><td align="center" style="padding:24px 16px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
        <tr><td style="font-size:24px;font-weight:800;letter-spacing:-0.03em;padding-bottom:24px">${e(input.brandName.toLowerCase())}</td></tr>
        <tr><td style="font-size:12px;color:${MUTED};padding-bottom:4px">Pedido ${e(input.orderNumber)}</td></tr>
        <tr><td style="font-size:22px;font-weight:700;letter-spacing:-0.015em;padding-bottom:8px">${e(greeting)} Tu pedido está pagado.</td></tr>
        <tr><td style="font-size:14px;line-height:1.5;padding-bottom:20px">Pagaste con ${e(input.paymentLabel)}. Cada pieza es única y ya es tuya.</td></tr>
        <tr><td style="background:${CARTON};padding:14px 16px;font-size:13.5px;line-height:1.5">
          ${delivery.map((line, i) => `<div style="${i === 0 ? 'font-weight:600' : `color:${MUTED}`}">${e(line)}</div>`).join('')}
        </td></tr>
        <tr><td style="padding-top:12px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px solid ${LINE}">${itemRows}</table>
        </td></tr>
        <tr><td style="padding-top:12px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${totalRow('Piezas', formatMxn(input.subtotalMxn))}
            ${totalRow('Entrega', shipping)}
            ${totalRow('Total pagado', formatMxn(input.totalMxn), true)}
          </table>
        </td></tr>
        <tr><td style="padding:24px 0">
          <a href="${e(input.orderUrl)}" style="display:block;background:${ACCENT};color:#ffffff;text-decoration:none;text-align:center;font-size:14px;font-weight:600;line-height:48px;border-radius:3px">Ver tu pedido</a>
        </td></tr>
        <tr><td style="font-size:12.5px;line-height:1.5;color:${MUTED};border-top:1px solid ${LINE};padding-top:16px">
          ¿Algo no está bien? Escríbenos a <a href="mailto:${e(input.supportEmail)}" style="color:${INK}">${e(input.supportEmail)}</a> con tu número de pedido.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    `${greeting} Tu pedido ${input.orderNumber} está pagado.`,
    `Pagaste con ${input.paymentLabel}.`,
    '',
    ...delivery,
    '',
    ...input.items.map((item) => `- ${item.name}${item.size ? ` (talla ${item.size})` : ''}: ${formatMxn(item.priceMxn)}`),
    '',
    `Piezas: ${formatMxn(input.subtotalMxn)}`,
    `Entrega: ${shipping}`,
    `Total pagado: ${formatMxn(input.totalMxn)}`,
    '',
    `Ver tu pedido: ${input.orderUrl}`,
    `¿Algo no está bien? Escríbenos a ${input.supportEmail} con tu número de pedido.`,
  ].join('\n');

  return { subject, html, text };
}
