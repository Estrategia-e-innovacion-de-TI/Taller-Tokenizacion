/** Stub for optional Privy peers (Stripe onramp) that Vite otherwise fails to resolve. */
export function loadStripe(): Promise<null> {
  return Promise.resolve(null);
}

export default { loadStripe };
