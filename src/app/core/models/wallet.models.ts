import { UserPublicDTO } from './catalog.models';

export interface WalletResponse {
    user: UserPublicDTO;
    availableBalance: number;
    reservedBalance: number;
    createdAt: string;
    updatedAt: string;
}

export interface WalletRechargeRequest {
    amount: number;
}
