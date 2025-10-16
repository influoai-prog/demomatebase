import crypto from 'node:crypto';

export function createOrderId() {
  return `order-${crypto.randomBytes(4).toString('hex')}`;
}

export type CheckoutPreparation = {
  orderId: string;
  subAccountId: string;
  permissionId: string;
  payload: {
    to: `0x${string}`;
    amountWei: string;
    tokenAddress: `0x${string}`;
    validUntil: string;
  };
};
