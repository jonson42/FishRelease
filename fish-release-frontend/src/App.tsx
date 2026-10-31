import React, { useEffect, useState } from 'react';
import { GoogleMapContainer } from './features/map-pond/components/GoogleMapContainer';
import { HeaderNavbar } from './shared/components/HeaderNavbar';
import { FishInventoryDrawer } from './features/fish-shop/components/FishInventoryDrawer';
import { FishShopModal } from './features/fish-shop/components/FishShopModal';
import { TaskRewardList } from './features/tiktok-tasks/components/TaskRewardList';
import { AdminDashboard } from './features/admin-portal/pages/AdminDashboard';
import { AuthModal } from './shared/components/AuthModal';
import { useAuthStore } from './store/useAuthStore';
import { useFishStore } from './store/useFishStore';
import { signalRService } from './core/services/signalrService';
import { Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const { fetchCurrentUser, isAuthenticated } = useAuthStore();
  const { fetchSpecies, fetchInventory, addRealtimeFish, removeRealtimeFish } = useFishStore();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [realtimeNotification, setRealtimeNotification] = useState<string | null>(null);

  // Khởi tạo ban đầu
  useEffect(() => {
    fetchSpecies();
    if (isAuthenticated) {
      fetchCurrentUser();
      fetchInventory();
    }
  }, [fetchSpecies, fetchCurrentUser, fetchInventory, isAuthenticated]);

  // Kết nối SignalR Realtime và lắng nghe các sự kiện
  useEffect(() => {
    signalRService.startConnection();

    const unsubReleased = signalRService.subscribeFishReleased((fish) => {
      addRealtimeFish(fish);
      setRealtimeNotification(`✨ ${fish.releasedByUserName} vừa phóng sinh 1 chú ${fish.fishSpeciesName} kèm tâm nguyện lành!`);
      setTimeout(() => setRealtimeNotification(null), 4000);
    });

    const unsubCaught = signalRService.subscribeFishCaught((data) => {
      removeRealtimeFish(data.fishId);
      setRealtimeNotification(`🎣 ${data.caughtBy} vừa vớt 1 chú ${data.speciesName} vào giỏ để đem đi hồ khác thả!`);
      setTimeout(() => setRealtimeNotification(null), 4000);
    });

    return () => {
      unsubReleased();
      unsubCaught();
      signalRService.stopConnection();
    };
  }, [addRealtimeFish, removeRealtimeFish]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* Thanh điều hướng Header */}
      <HeaderNavbar onOpenAuth={() => setIsAuthModalOpen(true)} />

      {/* Bản đồ Google Maps / Hồ Thủy Sinh Toàn Màn Hình */}
      <main className="w-full h-full">
        <GoogleMapContainer />
      </main>

      {/* Floating Real-time Notification Banner */}
      {realtimeNotification && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 animate-bounce pointer-events-none">
          <div className="px-4 py-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-cyan-400/40 text-cyan-300 text-xs font-semibold shadow-2xl flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>{realtimeNotification}</span>
          </div>
        </div>
      )}

      {/* Modals & Drawers */}
      <FishInventoryDrawer />
      <FishShopModal />
      <TaskRewardList />
      <AdminDashboard />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default App;
