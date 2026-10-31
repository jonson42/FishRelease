import React, { useEffect, useState } from 'react';
import { useTaskStore } from '../../../store/useTaskStore';
import { X, Clock, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

export const TikTokEmbedPlayer: React.FC = () => {
  const {
    activeTask,
    countdown,
    canClaim,
    tickCountdown,
    claimReward,
    resetActiveTask,
    isLoading,
  } = useTaskStore();

  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Timer interval
  useEffect(() => {
    if (!activeTask) return;

    const timer = setInterval(() => {
      tickCountdown();
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTask, tickCountdown]);

  if (!activeTask) return null;

  // Lấy video ID từ TikTok URL nếu có
  const extractTikTokId = (url: string) => {
    const match = url.match(/\/video\/(\d+)/);
    return match ? match[1] : null;
  };

  const videoId = extractTikTokId(activeTask.videoUrl);

  const handleClaim = async () => {
    try {
      setErrorMsg(null);
      const res = await claimReward();
      setClaimSuccess(res.message);
      setTimeout(() => {
        setClaimSuccess(null);
        resetActiveTask();
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể nhận thưởng.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-2xl border border-cyan-500/30 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎵</span>
            <div>
              <h3 className="text-sm font-bold text-white truncate max-w-xs">{activeTask.title}</h3>
              <p className="text-[11px] text-slate-400">Nhiệm vụ xem video TikTok nhận cá</p>
            </div>
          </div>
          <button
            onClick={resetActiveTask}
            className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="my-3 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {claimSuccess ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-emerald-400">Nhận Thưởng Thành Công!</h3>
            <p className="text-sm text-slate-300 px-4">{claimSuccess}</p>
          </div>
        ) : (
          <div className="my-3 flex-1 flex flex-col items-center justify-center space-y-4">
            {/* TikTok Video Player / Responsive Frame */}
            <div className="w-full aspect-[9/14] max-h-[420px] rounded-2xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center relative shadow-inner">
              {videoId ? (
                <iframe
                  src={`https://www.tiktok.com/player/v1/${videoId}?autoplay=1`}
                  title="TikTok Video"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="p-6 text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-3xl animate-pulse">
                    🎬
                  </div>
                  <p className="text-sm font-semibold text-slate-200">Đang phát nội dung TikTok</p>
                  <a
                    href={activeTask.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-cyan-400 hover:underline block"
                  >
                    Mở xem trực tiếp trên ứng dụng TikTok ↗
                  </a>
                </div>
              )}

              {/* Huy hiệu phần thưởng nổi */}
              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-cyan-500/40 flex items-center gap-2 text-xs">
                <img
                  src={activeTask.imageUrl}
                  alt={activeTask.rewardFishSpeciesName}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="font-bold text-cyan-300">
                  +{activeTask.rewardQuantity} {activeTask.rewardFishSpeciesName}
                </span>
              </div>
            </div>

            {/* Bộ đếm ngược thời gian xem */}
            <div className="w-full p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300">Thời gian xem yêu cầu</p>
                  <p className="text-[11px] text-slate-400">Không tua để hệ thống xác thực chống gian lận</p>
                </div>
              </div>

              <div className="text-right">
                {countdown > 0 ? (
                  <span className="font-mono text-2xl font-black text-amber-400">
                    {countdown}s
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                    Đã hoàn thành!
                  </span>
                )}
              </div>
            </div>

            {/* Nút Nhận Cá Miễn Phí */}
            <button
              onClick={handleClaim}
              disabled={!canClaim || isLoading}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm shadow-xl active:scale-[0.98] transition flex items-center justify-center gap-2 ${
                canClaim
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white shadow-emerald-500/30 ring-2 ring-emerald-400/50 animate-pulse'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang xác thực phần thưởng...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {canClaim ? 'Nhận Cá Miễn Phí Vào Giỏ Ngay' : `Đang xem... (${countdown}s còn lại)`}
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
