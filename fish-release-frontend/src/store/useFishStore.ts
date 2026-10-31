import { create } from 'zustand';
import { FishSpecies, ReleasedFish, UserInventoryItem, UserFishSummary } from '../core/entities/fish';
import { axiosClient } from '../core/api/axiosClient';
import { ENDPOINTS } from '../core/api/endpoints';

interface FishState {
  fishes: ReleasedFish[];
  species: FishSpecies[];
  inventory: UserInventoryItem[];
  freeFishRemaining: number;
  freeFishQuotaToday: number;
  isLoading: boolean;
  selectedFish: ReleasedFish | null;
  pendingReleaseLocation: { lat: number; lng: number } | null;
  isReleaseModalOpen: boolean;
  isInventoryOpen: boolean;
  isShopOpen: boolean;
  isTopUpOpen: boolean;
  isTikTokModalOpen: boolean;
  isAdminOpen: boolean;

  fetchFishesInBoundingBox: (minLat: number, maxLat: number, minLng: number, maxLng: number) => Promise<void>;
  fetchSpecies: () => Promise<void>;
  fetchInventory: () => Promise<void>;
  releaseFish: (speciesId: string, lat: number, lng: number, wish: string) => Promise<ReleasedFish>;
  catchFish: (releasedFishId: string) => Promise<{ message: string }>;
  buyFish: (speciesId: string, quantity: number) => Promise<any>;

  setSelectedFish: (fish: ReleasedFish | null) => void;
  setPendingReleaseLocation: (loc: { lat: number; lng: number } | null) => void;
  setReleaseModalOpen: (open: boolean) => void;
  setInventoryOpen: (open: boolean) => void;
  setShopOpen: (open: boolean) => void;
  setTopUpOpen: (open: boolean) => void;
  setTikTokModalOpen: (open: boolean) => void;
  setAdminOpen: (open: boolean) => void;

  addRealtimeFish: (fish: ReleasedFish) => void;
  removeRealtimeFish: (fishId: string) => void;
}

export const useFishStore = create<FishState>((set, get) => ({
  fishes: [],
  species: [],
  inventory: [],
  freeFishRemaining: 10,
  freeFishQuotaToday: 10,
  isLoading: false,
  selectedFish: null,
  pendingReleaseLocation: null,
  isReleaseModalOpen: false,
  isInventoryOpen: false,
  isShopOpen: false,
  isTopUpOpen: false,
  isTikTokModalOpen: false,
  isAdminOpen: false,

  fetchFishesInBoundingBox: async (minLat, maxLat, minLng, maxLng) => {
    try {
      const data = await axiosClient.get<any, ReleasedFish[]>(ENDPOINTS.FISH_MAP.BOUNDING_BOX, {
        params: { minLat, maxLat, minLng, maxLng }
      });
      set({ fishes: data });
    } catch (err) {
      console.error('Lỗi tải danh sách cá:', err);
    }
  },

  fetchSpecies: async () => {
    try {
      const data = await axiosClient.get<any, FishSpecies[]>(ENDPOINTS.FISH_MAP.SPECIES);
      set({ species: data });
    } catch (err) {
      console.error('Lỗi tải danh mục loài cá:', err);
    }
  },

  fetchInventory: async () => {
    try {
      const data = await axiosClient.get<any, UserFishSummary>(ENDPOINTS.FISH_MAP.INVENTORY);
      set({
        inventory: data.inventory,
        freeFishRemaining: data.freeFishRemaining,
        freeFishQuotaToday: data.freeFishQuotaToday
      });
    } catch (err) {
      console.error('Lỗi tải giỏ cá:', err);
    }
  },

  releaseFish: async (speciesId, lat, lng, wish) => {
    const res = await axiosClient.post<any, ReleasedFish>(ENDPOINTS.FISH_MAP.RELEASE, {
      fishSpeciesId: speciesId,
      latitude: lat,
      longitude: lng,
      wishMessage: wish
    });
    // Cập nhật giỏ cá sau khi thả
    get().fetchInventory();
    return res;
  },

  catchFish: async (releasedFishId) => {
    const res = await axiosClient.post<any, { message: string }>(ENDPOINTS.FISH_MAP.CATCH, {
      releasedFishId
    });
    // Xóa cá khỏi map và cập nhật giỏ
    get().removeRealtimeFish(releasedFishId);
    get().fetchInventory();
    return res;
  },

  buyFish: async (speciesId, quantity) => {
    const res = await axiosClient.post<any, any>(ENDPOINTS.FISH_MAP.BUY, {
      fishSpeciesId: speciesId,
      quantity
    });
    get().fetchInventory();
    return res;
  },

  setSelectedFish: (fish) => set({ selectedFish: fish }),
  setPendingReleaseLocation: (loc) => set({ pendingReleaseLocation: loc }),
  setReleaseModalOpen: (open) => set({ isReleaseModalOpen: open }),
  setInventoryOpen: (open) => set({ isInventoryOpen: open }),
  setShopOpen: (open) => set({ isShopOpen: open }),
  setTopUpOpen: (open) => set({ isTopUpOpen: open }),
  setTikTokModalOpen: (open) => set({ isTikTokModalOpen: open }),
  setAdminOpen: (open) => set({ isAdminOpen: open }),

  addRealtimeFish: (fish) => {
    set((state) => {
      if (state.fishes.some(f => f.id === fish.id)) return state;
      return { fishes: [fish, ...state.fishes] };
    });
  },

  removeRealtimeFish: (fishId) => {
    set((state) => ({
      fishes: state.fishes.filter(f => f.id !== fishId),
      selectedFish: state.selectedFish?.id === fishId ? null : state.selectedFish
    }));
  }
}));
