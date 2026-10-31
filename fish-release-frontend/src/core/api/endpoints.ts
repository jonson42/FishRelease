export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
  },
  FISH_MAP: {
    BOUNDING_BOX: '/api/fishmap/bounding-box',
    RELEASE: '/api/fishmap/release',
    CATCH: '/api/fishmap/catch',
    BUY: '/api/fishmap/buy',
    INVENTORY: '/api/fishmap/my-inventory',
    SPECIES: '/api/fishmap/species',
  },
  TIKTOK: {
    AVAILABLE_TASKS: '/api/tiktoktask/available',
    START: '/api/tiktoktask/start',
    CLAIM: '/api/tiktoktask/claim',
  },
  WALLET: {
    CREATE_TOPUP: '/api/wallet/create-topup',
    WEBHOOK: '/api/wallet/webhook',
  },
  ADMIN: {
    TIKTOK_TASK: '/api/admin/tiktok-task',
    TIKTOK_TASKS: '/api/admin/tiktok-tasks',
    TOGGLE_TASK: (id: string) => `/api/admin/tiktok-task/${id}/toggle`,
    FISH_SPECIES: '/api/admin/fish-species',
    STATS: '/api/admin/stats',
  }
};
