import React, { useState } from 'react';
import { useFishStore } from '../../../store/useFishStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { X, Heart, Sparkles, AlertCircle } from 'lucide-react';

export const ReleaseFishModal: React.FC = () => {
  const {
    isReleaseModalOpen,
    setReleaseModalOpen,
    pendingReleaseLocation,
    inventory,
    species,
    freeFishRemaining,
    freeFishQuotaToday,
    releaseFish,
  } = useFishStore();

  const { isAuthenticated } = useAuthStore();
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('');
  const [wishMessage, setWishMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isReleaseModalOpen || !pendingReleaseLocation) return null;

  // Lấy loài cá mặc định miễn phí (Cá Chép Đỏ)
  const defaultFreeSpecies = species.find(s => s.isDefaultFreeSpecies) || species[0];

  // Danh sách các loài cá user có thể chọn thả:
  // 1. Cá chép miễn phí (nếu còn lượt free > 0)
  // 2. Các con cá có trong inventory (> 0)
  const availableOptions: { id: string; name: string; imageUrl: string; quantityText: string; isFree: boolean }[] = [];

  if (defaultFreeSpecies && freeFishRemaining > 0) {
    availableOptions.push({
      id: defaultFreeSpecies.id,
      name: `${defaultFreeSpecies.name} (Miễn phí)`,
      imageUrl: defaultFreeSpecies.imageUrl,
      quantityText: `Còn ${freeFishRemaining}/${freeFishQuotaToday} lượt hôm nay`,
      isFree: true,
    });
  }

  inventory.forEach(item => {
    if (item.quantity > 0) {
      availableOptions.push({
        id: item.fishSpeciesId,
        name: item.fishSpeciesName,
        imageUrl: item.imageUrl,
        quantityText: `Trong giỏ: ${item.quantity} con`,
        isFree: false,
      });
    }
  });

  // Tự động chọn option đầu tiên nếu chưa chọn
  const activeSelectedId = selectedSpeciesId || (availableOptions.length > 0 ? availableOptions[0].id : '');

  const handleRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập tài khoản để thực hiện phóng sinh thả cá!');
      return;
    }

    if (!activeSelectedId) {
      setErrorMsg('Vui lòng chọn một chú cá để thả.');
      return;
    }

    if (!wishMessage.trim()) {
      setErrorMsg('Vui lòng viết lời chúc hoặc tâm nguyện gieo duyên lành.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await releaseFish(
        activeSelectedId,
        pendingReleaseLocation.lat,
        pendingReleaseLocation.lng,
        wishMessage.trim()
      );
      setReleaseModalOpen(false);
      setWishMessage('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể thả cá. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-2xl border border-cyan-500/30 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Heart className="w-5 h-5 fill-current" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-white">Phóng Sinh Cá Xuống Nước</h3>
              <p className="text-xs text-slate-400">
                Tọa độ: {pendingReleaseLocation.lat.toFixed(4)}, {pendingReleaseLocation.lng.toFixed(4)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setReleaseModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRelease} className="mt-4 space-y-4">
          {/* Lựa chọn loài cá */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Chọn loài cá trong giỏ
            </label>

            {availableOptions.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-amber-500/30 text-center space-y-2">
                <p className="text-xs text-amber-300 font-medium">
                  Bạn đã hết lượt cá miễn phí hôm nay và giỏ cá đang trống!
                </p>
                <p className="text-[11px] text-slate-400">
                  Hãy làm nhiệm vụ xem TikTok nhận cá miễn phí hoặc ghé Cửa hàng cá nhé!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                {availableOptions.map((opt) => (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setSelectedSpeciesId(opt.id)}
                    className={`p-3 rounded-2xl text-left border flex items-center gap-3 transition-all ${
                      activeSelectedId === opt.id
                        ? 'bg-cyan-500/20 border-cyan-400 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400'
                        : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
                    }`}
                  >
                    <img
                      src={opt.imageUrl}
                      alt={opt.name}
                      className="w-10 h-10 rounded-xl object-cover border border-cyan-500/30"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{opt.name}</p>
                      <p className="text-[10px] text-cyan-300 mt-0.5">{opt.quantityText}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nhập lời chúc nguyện ước */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Tâm nguyện & Lời chúc phúc
            </label>
            <textarea
              value={wishMessage}
              onChange={(e) => setWishMessage(e.target.value)}
              placeholder="Cầu cho gia đình bình an, tai qua nạn khỏi, công việc thuận lợi, vạn sự hanh thông..."
              rows={3}
              maxLength={300}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-800/70 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none text-sm text-white placeholder-slate-500 resize-none transition"
            />
            <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 px-1">
              <span>Lời chúc sẽ hiển thị khi người khác di chuột vào chú cá</span>
              <span>{wishMessage.length}/300</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || availableOptions.length === 0}
            className="w-full py-3 px-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 
                     text-white shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang thả cá xuống hồ...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Thả Cá Phóng Sinh Ngay</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
