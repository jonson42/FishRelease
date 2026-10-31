import { create } from 'zustand';
import { TikTokTask, StartTaskSessionResponse, ClaimRewardResponse } from '../core/entities/tiktokTask';
import { axiosClient } from '../core/api/axiosClient';
import { ENDPOINTS } from '../core/api/endpoints';
import { useFishStore } from './useFishStore';

interface TaskState {
  tasks: TikTokTask[];
  activeTask: TikTokTask | null;
  sessionToken: string | null;
  countdown: number;
  canClaim: boolean;
  isLoading: boolean;
  error: string | null;

  fetchTasks: () => Promise<void>;
  startTask: (task: TikTokTask) => Promise<void>;
  claimReward: () => Promise<ClaimRewardResponse>;
  tickCountdown: () => void;
  resetActiveTask: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  activeTask: null,
  sessionToken: null,
  countdown: 0,
  canClaim: false,
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    try {
      set({ isLoading: true });
      const data = await axiosClient.get<any, TikTokTask[]>(ENDPOINTS.TIKTOK.AVAILABLE_TASKS);
      set({ tasks: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  startTask: async (task: TikTokTask) => {
    try {
      set({ isLoading: true, error: null });
      const res = await axiosClient.post<any, StartTaskSessionResponse>(ENDPOINTS.TIKTOK.START, {
        taskId: task.id
      });
      set({
        activeTask: task,
        sessionToken: res.sessionToken,
        countdown: res.requiredWatchSeconds,
        canClaim: false,
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  claimReward: async () => {
    const { activeTask, sessionToken } = get();
    if (!activeTask || !sessionToken) {
      throw new Error('Chưa có phiên xem video hợp lệ.');
    }

    try {
      set({ isLoading: true, error: null });
      const res = await axiosClient.post<any, ClaimRewardResponse>(ENDPOINTS.TIKTOK.CLAIM, {
        taskId: activeTask.id,
        watchSessionToken: sessionToken
      });

      // Đánh dấu nhiệm vụ đã nhận và refresh kho cá
      set((state) => ({
        tasks: state.tasks.map(t => t.id === activeTask.id ? { ...t, isClaimed: true, claimCount: t.claimCount + 1 } : t),
        isLoading: false
      }));

      // Cập nhật lại kho cá của user
      useFishStore.getState().fetchInventory();

      return res;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  tickCountdown: () => {
    const { countdown } = get();
    if (countdown > 1) {
      set({ countdown: countdown - 1 });
    } else if (countdown === 1) {
      set({ countdown: 0, canClaim: true });
    }
  },

  resetActiveTask: () => {
    set({
      activeTask: null,
      sessionToken: null,
      countdown: 0,
      canClaim: false,
      error: null
    });
  }
}));
