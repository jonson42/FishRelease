export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: 'User' | 'Admin';
  walletBalance: number;
  freeFishQuotaToday: number;
}

export interface AuthResponse {
  userId: string;
  username: string;
  fullName: string;
  email: string;
  role: 'User' | 'Admin';
  walletBalance: number;
  freeFishQuotaToday: number;
  token: string;
}
