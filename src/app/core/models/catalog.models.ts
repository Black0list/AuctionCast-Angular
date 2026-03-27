export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  IN_AUCTION = 'IN_AUCTION',
  SOLD = 'SOLD',
  UNSOLD = 'UNSOLD',
  ARCHIVED = 'ARCHIVED'
}

export enum ProductCondition {
  NEW = 'NEW',
  LIKE_NEW = 'LIKE_NEW',
  USED_GOOD = 'USED_GOOD',
  USED_FAIR = 'USED_FAIR',
  REFURBISHED = 'REFURBISHED'
}

export interface ProductImage {
  id?: string;
  imageUrl: string;
  cover?: boolean;
}

export interface UserPublicDTO {
  id?: string;
  firstName?: string;
  lastName?: string;
}

export interface ProductResponseDTO {
  id: string;
  title: string;
  description?: string;
  condition?: ProductCondition;
  status?: ProductStatus;
  categoryName?: string;
  user?: UserPublicDTO;
  imageUrls?: ProductImage[];
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryDTO {
  name: string;
  description: string;
}

export interface CategoryResponseDTO {
  id: string;
  name: string;
  description: string;
}
