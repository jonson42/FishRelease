import React, { useEffect } from 'react';
import { useFishStore } from '../../../store/useFishStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { X, Coins, Gift, ShoppingBag, ArrowRight } from 'lucide-react';

export const FishInventoryDrawer: React.FC = () => {
  const {
    isInventoryOpen,
    setInventoryOpen,
    inventory,
    freeFishRemaining,
    freeFishQuotaToday,
    fetchInventory,
    setShopOpen,
  } = useFishStore();

  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isInventoryOpen && isAuthenticated) {
      fetchInventory();
    }
  }, [isInventoryOpen, isAuthenticated, fetchInventory]);

  if (!isInventoryOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in flex justify-end">
      <div className="relative w-full max-w-md h-full bg-slate-900 border-l border-cyan-500/30 text-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400">
              <span>🎒</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Giỏ Cá Của Bạn</h3>
              <p className="text-xs text-slate-400">Kho cá phong thủy & phóng sinh số</p>
            </div>
          </div>
          <button
            onClick={() => setInventoryOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quota & Wallet banner */}
        <div className="p-6 space-y-3 bg-gradient-to-b from-slate-800/40 to-transparent">
          {/* Lượt thả cá miễn phí hàng ngày */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-400/20 text-cyan-300">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">Cá Miễn Phí Hôm Nay</p>
                <p className="text-[11px] text-cyan-300">Tự động cấp 10 con lúc 00:00</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-cyan-400">
                {freeFishRemaining}
              </span>
              <span className="text-xs text-slate-400 font-medium">/{freeFishQuotaToday}</span>
            </div>
          </div>

          {/* Số dư xu ví */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-400/20 text-amber-400">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">Số Dư Xu</p>
                <p className="text-[11px] text-slate-400">Dùng mua các loài cá quý hiếm</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-amber-400">
                {user?.walletBalance.toLocaleString() || 0}
              </span>
              <span className="text-xs text-amber-300/80 ml-1">xu</span>
            </div>
          </div>
        </div>

        {/* Danh sách cá trong giỏ */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Cá đang sở hữu ({inventory.reduce((sum, i) => sum + i.quantity, 0)} con)
          </p>

          {inventory.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 text-slate-500 flex items-center justify-center text-2xl">
                🐟
              </div>
              <p className="text-sm text-slate-400">Giỏ cá chưa có chú cá nào.</p>
              <p className="text-xs text-slate-500 px-6">
                Bạn có thể vớt cá của người khác trên bản đồ, làm nhiệm vụ TikTok hoặc ghé Cửa Hàng Cá.
              </p>
            </div>
          ) : (
            inventory.map((item) => (
              <div
                key={item.fishSpeciesId}
                className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between hover:border-cyan-500/40 transition"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.imageUrl}
                    alt={item.fishSpeciesName}
                    className="w-12 h-12 rounded-xl object-cover border border-cyan-500/30"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.fishSpeciesName}</h4>
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-cyan-400">
                      {item.rarity}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 font-bold text-sm border border-cyan-500/30">
                    x{item.quantity}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer CTA */}
        <div className="p-6 border-t border-slate-800">
          <button
            onClick={() => {
              setInventoryOpen(false);
              setShopOpen(true);
            }}
            className="w-full py-3 px-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 
                     text-slate-950 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Mở Cửa Hàng Cá & Nạp Tiền</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
