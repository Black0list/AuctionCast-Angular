export enum OrderStatus {
    PENDING_SHIPMENT = 'PENDING_SHIPMENT',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    RETURNED = 'RETURNED'
}

export interface OrderResponse {
    id: string;
    auctionId: string;
    productId: string;
    sellerId: string;
    buyerId: string;
    amount: number;
    shippingFullName: string;
    shippingPhone: string;
    shippingAddressLine1: string;
    shippingAddressLine2?: string;
    shippingCity: string;
    shippingState?: string;
    shippingPostalCode: string;
    shippingCountry: string;
    carrier?: string;
    trackingNumber?: string;
    status: OrderStatus;
    createdAt: string;
}
