export interface TikTokTask {
  id: string;
  title: string;
  videoUrl: string;
  description?: string;
  rewardFishSpeciesId: string;
  rewardFishSpeciesName: string;
  imageUrl: string;
  rewardQuantity: number;
  requiredWatchSeconds: number;
  isClaimed: boolean;
  viewCount: number;
  claimCount: number;
}

export interface StartTaskSessionResponse {
  sessionToken: string;
  requiredWatchSeconds: number;
  startedAt: string;
}

export interface ClaimRewardResponse {
  fishSpeciesId: string;
  fishSpeciesName: string;
  quantityAdded: number;
  message: string;
}
