import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useFishStore } from '../../store/useFishStore';
import { Gift, Coins, Shield, LogIn, LogOut, User as UserIcon } from 'lucide-react';

interface HeaderNavbarProps {
  onOpenAuth: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({ onOpenAuth }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const {
    freeFishRemaining,
    freeFishQuotaToday,
    setInventoryOpen,
    setShopOpen,
    setTikTokModalOpen,
    setAdminOpen,
  } = useFishStore();

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-30 p-4 pointer-events-none flex items-center justify-between">
      {/* Brand Logo */}
      <div className="pointer-events-auto flex items-center gap-3 p-2.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-cyan-500/30 text-white shadow-2xl">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xl shadow-lg shadow-cyan-500/30 animate-swim">
          🐟
        </div>
        <div>
          <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
            <span>Phóng Sinh Số</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Geo-Fishing
            </span>
          </h1>
          <p className="text-[11px] text-slate-400">Gieo duyên lành & Tích đức bình an</p>
        </div>
      </div>

      {/* Action Navigation Bar */}
      <div className="pointer-events-auto flex items-center gap-2">
        {/* Lượt thả cá miễn phí hôm nay */}
        <button
          onClick={() => setInventoryOpen(true)}
          className="px-3.5 py-2 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-cyan-500/30 text-white shadow-xl hover:border-cyan-400 transition flex items-center gap-2 group"
          title="Giỏ cá cá nhân & Lượt thả miễn phí"
        >
          <Gift className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
          <div className="text-left text-xs">
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Cá Hôm Nay</span>
            <span className="font-extrabold text-cyan-300">{freeFishRemaining}/{freeFishQuotaToday}</span>
          </div>
        </button>

        {/* Nhiệm vụ TikTok nhận cá */}
        <button
          onClick={() => setTikTokModalOpen(true)}
          className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-pink-600/90 to-purple-600/90 backdrop-blur-md border border-pink-400/40 text-white shadow-lg shadow-pink-500/20 hover:scale-105 active:scale-95 transition flex items-center gap-2"
        >
          <span className="text-base animate-bounce">🎵</span>
          <div className="text-left text-xs hidden sm:block">
            <span className="text-pink-200 block text-[9px] uppercase font-bold">Xem TikTok</span>
            <span className="font-extrabold text-white">Nhận Cá Free</span>
          </div>
        </button>

        {/* Số dư xu & Cửa hàng */}
        <button
          onClick={() => setShopOpen(true)}
          className="px-3.5 py-2 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-amber-500/30 text-white shadow-xl hover:border-amber-400 transition flex items-center gap-2 group"
        >
          <Coins className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition" />
          <div className="text-left text-xs">
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Ví Xu</span>
            <span className="font-extrabold text-amber-400">
              {user ? user.walletBalance.toLocaleString() : 0} xu
            </span>
          </div>
        </button>

        {/* Admin Portal Button */}
        {isAdmin && (
          <button
            onClick={() => setAdminOpen(true)}
            className="p-2.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-purple-500/40 text-purple-300 shadow-xl hover:bg-purple-950/50 hover:text-white transition"
            title="Trang quản trị Admin"
          >
            <Shield className="w-4 h-4" />
          </button>
        )}

        {/* User Account / Auth */}
        {isAuthenticated && user ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="p-2.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-700 hover:border-cyan-400 text-white shadow-xl transition flex items-center gap-2"
            >
              <UserIcon className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold hidden md:inline max-w-[100px] truncate">
                {user.fullName || user.username}
              </span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl p-2 text-xs space-y-1 z-50">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="font-bold text-white truncate">{user.fullName || user.username}</p>
                  <p className="text-[10px] text-slate-400 truncate">@{user.username}</p>
                </div>

                <button
                  onClick={() => {
                    setInventoryOpen(true);
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition"
                >
                  Kho cá của tôi
                </button>

                <button
                  onClick={() => {
                    setShopOpen(true);
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition"
                >
                  Nạp tiền VietQR
                </button>

                <button
                  onClick={() => {
                    logout();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-4 py-2.5 rounded-2xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 
                     text-white shadow-lg shadow-cyan-500/25 active:scale-95 transition flex items-center gap-1.5"
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng Nhập</span>
          </button>
        )}
      </div>
    </header>
  );
};
