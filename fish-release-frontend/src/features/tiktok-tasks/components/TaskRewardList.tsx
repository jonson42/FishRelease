import React, { useEffect } from 'react';
import { useTaskStore } from '../../../store/useTaskStore';
import { useFishStore } from '../../../store/useFishStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { TikTokEmbedPlayer } from './TikTokEmbedPlayer';
import { TikTokTask } from '../../../core/entities/tiktokTask';
import { X, Play, CheckCircle, Clock, Gift, Sparkles } from 'lucide-react';

export const TaskRewardList: React.FC = () => {
  const { isTikTokModalOpen, setTikTokModalOpen } = useFishStore();
  const { tasks, fetchTasks, startTask, isLoading } = useTaskStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isTikTokModalOpen) {
      fetchTasks();
    }
  }, [isTikTokModalOpen, fetchTasks]);

  if (!isTikTokModalOpen) return null;

  const handleStartTask = async (task: TikTokTask) => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để làm nhiệm vụ và nhận cá vào giỏ!');
      return;
    }
    if (task.isClaimed) {
      alert('Bạn đã hoàn thành nhiệm vụ này và nhận cá rồi!');
      return;
    }

    try {
      await startTask(task);
    } catch (err: any) {
      alert(err.message || 'Không thể bắt đầu nhiệm vụ.');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="relative w-full max-w-xl bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-2xl border border-cyan-500/30 overflow-hidden max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Nhiệm Vụ Xem TikTok Nhận Cá</h3>
                <p className="text-xs text-slate-400">Xem video giải trí ngắn để gom thêm cá quý gieo duyên</p>
              </div>
            </div>
            <button
              onClick={() => setTikTokModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Task list */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {tasks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Hiện tại chưa có video nhiệm vụ mới. Vui lòng quay lại sau!
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    task.isClaimed
                      ? 'bg-slate-800/30 border-slate-800/80 opacity-70'
                      : 'bg-slate-800/50 border-slate-700/60 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={task.imageUrl}
                      alt={task.rewardFishSpeciesName}
                      className="w-14 h-14 rounded-2xl object-cover border border-cyan-500/30 flex-shrink-0"
                    />

                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{task.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {task.description || 'Xem video để nhận thưởng'}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-[11px]">
                        <span className="flex items-center gap-1 text-cyan-300 font-semibold">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>+{task.rewardQuantity} {task.rewardFishSpeciesName}</span>
                        </span>

                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{task.requiredWatchSeconds} giây</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0">
                    {task.isClaimed ? (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Đã nhận</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleStartTask(task)}
                        disabled={isLoading}
                        className="py-2 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 
                                 text-white shadow-md shadow-cyan-500/20 active:scale-95 transition flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Xem ngay</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Embed player overlay */}
      <TikTokEmbedPlayer />
    </>
  );
};
