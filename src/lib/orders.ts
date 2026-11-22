export interface OrderRecord {
  sessionId: string;
  status: "paid" | "pending" | "expired";
  customerEmail: string | null;
  customerName: string | null;
  amountTotalCents: number;
  currency: string;
  deliveryMode: string;
  promoCode: string | null;
  pfuTotalEur: string | null;
  itemsSummary: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Registro ordini lato server aggiornato dal webhook Stripe `/api/webhooks/stripe`.
 * Pronto per essere sostituito con Prisma / PostgreSQL in produzione.
 */
const globalForOrders = globalThis as unknown as {
  store101Orders?: Map<string, OrderRecord>;
};

const orderStore =
  globalForOrders.store101Orders ?? new Map<string, OrderRecord>();
globalForOrders.store101Orders = orderStore;

export function upsertOrder(order: OrderRecord): void {
  orderStore.set(order.sessionId, order);
}

export function getOrderBySessionId(
  sessionId: string
): OrderRecord | undefined {
  return orderStore.get(sessionId);
}
