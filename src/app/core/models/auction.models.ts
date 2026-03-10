import { ProductResponseDTO } from './catalog.models';

export enum AuctionStatus {
    DRAFT = 'DRAFT',
    SCHEDULED = 'SCHEDULED',
    ACTIVE = 'ACTIVE',
    ENDED = 'ENDED',
    CANCELLED = 'CANCELLED'
}

export interface UserPublic {
    id: string;
    firstName?: string;
    lastName?: string;
    photo?: string;
}

export interface AuctionResponse {
    id: string;
    product: ProductResponseDTO;
    seller: UserPublic;
    winner?: UserPublic;
    status: AuctionStatus;
    startPrice: number;
    currentPrice: number;
    minIncrement: number;
    startsAt?: string;
    endsAt?: string;
    bidCount: number;
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAuctionRequest {
    productId: string;
    startPrice: number;
    minIncrement: number;
    startsAt?: string;
    endsAt: string;
}

export interface UpdateAuctionRequest {
    startPrice: number;
    minIncrement: number;
    startsAt?: string;
    endsAt: string;
}

export interface ScheduleAuctionRequest {
    startsAt: string;
    endsAt: string;
}
