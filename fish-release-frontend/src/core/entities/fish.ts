export interface FishSpecies {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  priceCoins: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  fengShuiMeaning: string;
  isDefaultFreeSpecies: boolean;
}

export interface ReleasedFish {
  id: string;
  fishSpeciesId: string;
  fishSpeciesName: string;
  imageUrl: string;
  rarity: string;
  releasedByUserId: string;
  releasedByUserName: string;
  latitude: number;
  longitude: number;
  wishMessage: string;
  releasedAt: string;
}

export interface UserInventoryItem {
  fishSpeciesId: string;
  fishSpeciesName: string;
  imageUrl: string;
  quantity: number;
  rarity: string;
  priceCoins: number;
}

export interface UserFishSummary {
  freeFishRemaining: number;
  freeFishQuotaToday: number;
  walletBalance: number;
  inventory: UserInventoryItem[];
}
