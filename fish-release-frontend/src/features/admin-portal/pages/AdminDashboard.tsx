import React, { useState, useEffect } from 'react';
import { useFishStore } from '../../../store/useFishStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { axiosClient } from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';
import { X, ShieldCheck, Plus } from 'lucide-react';

interface SystemStats {
  totalUsers: number;
  totalSwimmingFishes: number;
  totalCaughtFishes: number;
  totalCompletedTasks: number;
  totalTopUpCoins: number;
}

export const AdminDashboard: React.FC = () => {
  const { isAdminOpen, setAdminOpen, species, fetchSpecies } = useFishStore();
  const { isAdmin } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'tiktok' | 'species'>('tiktok');
  const [stats, setStats] = useState<SystemStats | null>(null);

  // TikTok Tasks State
  const [tasks, setTasks] = useState<any[]>([]);
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [rewardSpeciesId, setRewardSpeciesId] = useState('');
  const [rewardQty, setRewardQty] = useState(1);
  const [watchSeconds, setWatchSeconds] = useState(15);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // Species State
  const [speciesName, setSpeciesName] = useState('');
  const [speciesDesc, setSpeciesDesc] = useState('');
  const [speciesImg, setSpeciesImg] = useState('');
  const [speciesPrice, setSpeciesPrice] = useState(50);
  const [speciesRarity, setSpeciesRarity] = useState('Rare');
  const [speciesFengShui, setSpeciesFengShui] = useState('');
  const [isSubmittingSpecies, setIsSubmittingSpecies] = useState(false);

  const fetchAdminData = async () => {
    try {
      const [statsRes, tasksRes] = await Promise.all([
        axiosClient.get<any, SystemStats>(ENDPOINTS.ADMIN.STATS),
        axiosClient.get<any, any[]>(ENDPOINTS.ADMIN.TIKTOK_TASKS),
      ]);
      setStats(statsRes);
      setTasks(tasksRes);
      fetchSpecies();
    } catch (err) {
      console.error('Lỗi tải dữ liệu quản trị:', err);
    }
  };

  useEffect(() => {
    if (isAdminOpen && isAdmin) {
      fetchAdminData();
    }
  }, [isAdminOpen, isAdmin]);

  if (!isAdminOpen || !isAdmin) return null;

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardSpeciesId && species.length > 0) {
      setRewardSpeciesId(species[0].id);
    }
    const finalSpeciesId = rewardSpeciesId || (species.length > 0 ? species[0].id : '');

    try {
      setIsSubmittingTask(true);
      await axiosClient.post(ENDPOINTS.ADMIN.TIKTOK_TASK, {
        title: taskTitle,
        videoUrl: tiktokUrl,
        description: taskDesc,
        rewardFishSpeciesId: finalSpeciesId,
        rewardQuantity: rewardQty,
        requiredWatchSeconds: watchSeconds,
      });
      alert('Đã thêm nhiệm vụ video TikTok thành công!');
      setTaskTitle('');
      setTiktokUrl('');
      setTaskDesc('');
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo nhiệm vụ.');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleToggleTask = async (id: string) => {
    try {
      await axiosClient.patch(ENDPOINTS.ADMIN.TOGGLE_TASK(id));
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái.');
    }
  };

  const handleCreateSpecies = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingSpecies(true);
      await axiosClient.post(ENDPOINTS.ADMIN.FISH_SPECIES, {
        name: speciesName,
        description: speciesDesc,
        imageUrl: speciesImg,
        priceCoins: speciesPrice,
        rarity: speciesRarity === 'Common' ? 1 : speciesRarity === 'Rare' ? 2 : speciesRarity === 'Epic' ? 3 : 4,
        fengShuiMeaning: speciesFengShui,
        isActive: true,
        isDefaultFreeSpecies: false,
      });
      alert('Thêm loài cá mới thành công!');
      setSpeciesName('');
      setSpeciesDesc('');
      setSpeciesImg('');
      setSpeciesFengShui('');
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi thêm loài cá.');
    } finally {
      setIsSubmittingSpecies(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-2xl border border-cyan-500/40 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Bảng Quản Trị Hệ Thống (Admin Portal)</h3>
              <p className="text-xs text-slate-400">Quản lý nhiệm vụ TikTok, danh mục loài cá và chỉ số vận hành</p>
            </div>
          </div>
          <button
            onClick={() => setAdminOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thống kê nhanh */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-4">
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Người Dùng</p>
              <p className="text-lg font-black text-cyan-400 mt-0.5">{stats.totalUsers}</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Cá Đang Bơi</p>
              <p className="text-lg font-black text-blue-400 mt-0.5">{stats.totalSwimmingFishes}</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Cá Đã Vớt</p>
              <p className="text-lg font-black text-emerald-400 mt-0.5">{stats.totalCaughtFishes}</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Nhiệm Vụ Đã Làm</p>
              <p className="text-lg font-black text-purple-400 mt-0.5">{stats.totalCompletedTasks}</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center col-span-2 sm:col-span-1">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Tổng Xu Đã Nạp</p>
              <p className="text-lg font-black text-amber-400 mt-0.5">{stats.totalTopUpCoins.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Tabs navigation */}
        <div className="flex gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('tiktok')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'tiktok'
                ? 'bg-cyan-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Quản Lý Video TikTok
          </button>
          <button
            onClick={() => setActiveTab('species')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'species'
                ? 'bg-cyan-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Quản Lý Loài Cá Phong Thủy
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {activeTab === 'tiktok' ? (
            <div className="space-y-6">
              {/* Form tạo nhiệm vụ */}
              <form onSubmit={handleCreateTask} className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700 space-y-3">
                <h4 className="text-sm font-bold text-cyan-300">Thêm Nhiệm Vụ TikTok Mới</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Tiêu đề nhiệm vụ..."
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    required
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                  <input
                    type="url"
                    placeholder="Link video TikTok (https://www.tiktok.com/...)..."
                    value={tiktokUrl}
                    onChange={(e) => setTiktokUrl(e.target.value)}
                    required
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                  <select
                    value={rewardSpeciesId}
                    onChange={(e) => setRewardSpeciesId(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    {species.map((s) => (
                      <option key={s.id} value={s.id}>
                        Thưởng: {s.name} ({s.rarity})
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Số lượng thưởng"
                      value={rewardQty}
                      min={1}
                      onChange={(e) => setRewardQty(Number(e.target.value))}
                      className="w-1/2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                    <input
                      type="number"
                      placeholder="Số giây xem"
                      value={watchSeconds}
                      min={5}
                      onChange={(e) => setWatchSeconds(Number(e.target.value))}
                      className="w-1/2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingTask}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-white flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Đăng Nhiệm Vụ</span>
                </button>
              </form>

              {/* Bảng danh sách nhiệm vụ */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Tiêu đề & Link</th>
                      <th className="p-3">Phần thưởng</th>
                      <th className="p-3">Thời lượng</th>
                      <th className="p-3">Lượt xem / Nhận</th>
                      <th className="p-3">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {tasks.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/30">
                        <td className="p-3 font-medium max-w-xs truncate">
                          <p className="text-white">{t.title}</p>
                          <a href={t.videoUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline text-[10px]">
                            {t.videoUrl}
                          </a>
                        </td>
                        <td className="p-3 text-cyan-300">
                          +{t.rewardQuantity} {t.rewardFishSpecies?.name || 'Cá'}
                        </td>
                        <td className="p-3 text-slate-300">{t.requiredWatchSeconds}s</td>
                        <td className="p-3 text-slate-300">
                          <span className="text-cyan-400 font-bold">{t.viewCount}</span> / <span className="text-emerald-400 font-bold">{t.claimCount}</span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleTask(t.id)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                              t.isActive
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}
                          >
                            {t.isActive ? 'Đang chạy' : 'Đã tắt'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Form thêm loài cá */}
              <form onSubmit={handleCreateSpecies} className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700 space-y-3">
                <h4 className="text-sm font-bold text-cyan-300">Thêm Loài Cá Mới</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Tên loài cá..."
                    value={speciesName}
                    onChange={(e) => setSpeciesName(e.target.value)}
                    required
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                  <input
                    type="url"
                    placeholder="URL ảnh cá..."
                    value={speciesImg}
                    onChange={(e) => setSpeciesImg(e.target.value)}
                    required
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                  <input
                    type="number"
                    placeholder="Giá mua bằng xu"
                    value={speciesPrice}
                    min={0}
                    onChange={(e) => setSpeciesPrice(Number(e.target.value))}
                    required
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                  <select
                    value={speciesRarity}
                    onChange={(e) => setSpeciesRarity(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="Common">Common (Phổ biến)</option>
                    <option value="Rare">Rare (Hiếm)</option>
                    <option value="Epic">Epic (Sử thi)</option>
                    <option value="Legendary">Legendary (Huyền thoại)</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Ý nghĩa phong thủy/phóng sinh..."
                    value={speciesFengShui}
                    onChange={(e) => setSpeciesFengShui(e.target.value)}
                    className="col-span-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingSpecies}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Lưu Loài Cá</span>
                </button>
              </form>

              {/* Danh sách loài cá */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {species.map((sp) => (
                  <div key={sp.id} className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center gap-3">
                    <img src={sp.imageUrl} alt={sp.name} className="w-12 h-12 rounded-xl object-cover border border-cyan-500/30" />
                    <div>
                      <p className="text-xs font-bold text-white">{sp.name}</p>
                      <p className="text-[10px] text-amber-400 font-semibold">{sp.priceCoins} xu - {sp.rarity}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{sp.fengShuiMeaning}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
