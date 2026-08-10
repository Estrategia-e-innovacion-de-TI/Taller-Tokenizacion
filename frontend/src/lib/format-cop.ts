export function formatCop(amount: bigint, decimals = 2): string {
  const neg = amount < 0n;
  const abs = neg ? -amount : amount;
  const base = 10n ** BigInt(decimals);
  const whole = abs / base;
  const frac = abs % base;
  const wholeStr = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  if (decimals === 0) return `${neg ? "-" : ""}${wholeStr}`;
  const fracStr = frac.toString().padStart(decimals, "0");
  return `${neg ? "-" : ""}${wholeStr},${fracStr}`;
}

export function formatCopLabel(amount: bigint, decimals = 2): string {
  return `${formatCop(amount, decimals)} COP`;
}

export function truncateAddress(address: string, size = 4): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 2 + size)}…${address.slice(-size)}`;
}

export const PRICE_PER_RENT_COPW = 100_000n * 100n; // 100.000 COP, 2 decimals
export const FAUCET_AMOUNT_COPW = 5_000_000n * 100n;
export const PROPERTY_VALUE_COP = 5_000_000_000n;
export const MAX_SUPPLY_RENT = 50_000n;
