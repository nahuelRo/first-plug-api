export const ORDER_STATUSES = [
    "Order confirmed",
    "Order canceled",
    "Confirmation pending",
    "Payment pending",
  ] as const;
  
  export type OrderStatus = (typeof ORDER_STATUSES)[number];