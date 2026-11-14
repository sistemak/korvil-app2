/* Geração de PIX BR Code (Copia e Cola) válido conforme especificação BACEN.
   Chave PIX: korvilloja@gmail.com (Neon) */

const PIX_KEY = 'korvilloja@gmail.com';
const MERCHANT_NAME = 'KORVIL LOJA';
const MERCHANT_CITY = 'SAO PAULO';

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function field(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

export function generatePixCode(amount: number): string {
  const amountStr = amount.toFixed(2);

  const gui = field('00', 'BR.GOV.BCB.PIX');
  const key = field('01', PIX_KEY);
  const merchantAccount = field('26', gui + key);
  const payloadFormat = field('00', '01');
  const merchantCategoryCode = field('52', '0000');
  const transactionCurrency = field('53', '986');
  const transactionAmount = field('54', amountStr);
  const countryCode = field('58', 'BR');
  const merchantName = field('59', MERCHANT_NAME);
  const merchantCity = field('60', MERCHANT_CITY);
  const additionalData = field('62', field('05', '***'));

  const payload =
    payloadFormat +
    merchantAccount +
    merchantCategoryCode +
    transactionCurrency +
    transactionAmount +
    countryCode +
    merchantName +
    merchantCity +
    additionalData +
    '6304';

  const crc = crc16(payload);
  return payload + crc;
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return Promise.resolve(true);
  } catch {
    return Promise.resolve(false);
  }
}

export { PIX_KEY };
