import React, { useState } from 'react';
import { useFishStore } from '../../../store/useFishStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { X, Sparkles, Navigation } from 'lucide-react';

export const CatchFishPopup: React.FC = () => {
  const { selectedFish, setSelectedFish, catchFish } = useFishStore();
  const { isAuthenticated } = useAuthStore();
  const [isCatching, setIsCatching] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!selectedFish) return null;

  const handleCatch = async () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để có thể vớt cá vào giỏ!');
      return;
    }

    try {
      setIsCatching(true);
      const res = await catchFish(selectedFish.id);
      setSuccessMsg(res.message);
      setTimeout(() => {
        setSuccessMsg(null);
        setSelectedFish(null);
      }, 2500);
    } catch (err: any) {
      alert(err.message || 'Không thể bắt chú cá này.');
    } finally {
      setIsCatching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-2xl border border-cyan-500/30 overflow-hidden">
        {/* Nút đóng */}
        <button
          onClick={() => setSelectedFish(null)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {successMsg ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-emerald-400">Vớt Cá Thành Công!</h3>
            <p className="text-sm text-slate-300 leading-relaxed px-2">{successMsg}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header thông tin loài cá */}
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-cyan-400/50 shadow-md flex-shrink-0">
                <img
                  src={selectedFish.imageUrl}
                  alt={selectedFish.fishSpeciesName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <span className="inline-block text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 mb-1">
                  Độ hiếm: {selectedFish.rarity}
                </span>
                <h3 className="text-xl font-bold text-white leading-tight">
                  {selectedFish.fishSpeciesName}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Người phóng sinh: <span className="text-slate-200 font-medium">{selectedFish.releasedByUserName}</span>
                </p>
              </div>
            </div>

            {/* Lời chúc / Nguyện ước */}
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 space-y-1">
              <p className="text-[11px] uppercase tracking-wider text-cyan-400 font-semibold">
                Lời nguyện ước gửi gắm
              </p>
              <p className="text-sm text-slate-200 italic leading-relaxed">
                "{selectedFish.wishMessage}"
              </p>
            </div>

            {/* Thông tin tọa độ */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tọa độ: {selectedFish.latitude.toFixed(4)}, {selectedFish.longitude.toFixed(4)}</span>
            </div>

            {/* Action buttons */}
            <div className="pt-2">
              <button
                onClick={handleCatch}
                disabled={isCatching}
                className="w-full py-3.5 px-4 rounded-2xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 
                         text-white shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCatching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang vớt cá vào giỏ...</span>
                  </>
                ) : (
                  <>
                    <span>🎣</span>
                    <span>Bắt cá đem đi thả nơi khác</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-slate-400 mt-2">
                Cá sẽ được đưa vào giỏ của bạn để mang đến vùng nước mới thả tiếp tục gieo duyên lành.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
