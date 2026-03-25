import { UserPublic } from './auction.models';

export interface BidResponse {
    id: string;
    auctionId: string;
    userId: string;
    amount: number;
    bidTime: string;
    user: UserPublic;
}

export interface PlaceBidRequest {
    auctionId: string;
    amount: number;
}
