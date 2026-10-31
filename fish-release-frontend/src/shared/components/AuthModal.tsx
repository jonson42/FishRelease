import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { axiosClient } from '../../core/api/axiosClient';
import { ENDPOINTS } from '../../core/api/endpoints';
import { AuthResponse } from '../../core/entities/user';
import { X, Lock, User as UserIcon, Mail, Sparkles, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { setAuth } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (isLogin) {
        const res = await axiosClient.post<any, AuthResponse>(ENDPOINTS.AUTH.LOGIN, {
          username,
          password,
        });
        setAuth(res);
      } else {
        const res = await axiosClient.post<any, AuthResponse>(ENDPOINTS.AUTH.REGISTER, {
          username,
          password,
          fullName,
          email,
        });
        setAuth(res);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Đã xảy ra lỗi đăng nhập/đăng ký.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-2xl border border-cyan-500/30 overflow-hidden">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 pb-3 mb-4">
          <button
            onClick={() => {
              setIsLogin(true);
              setErrorMsg(null);
            }}
            className={`flex-1 py-1 text-sm font-bold border-b-2 transition ${
              isLogin ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setErrorMsg(null);
            }}
            className={`flex-1 py-1 text-sm font-bold border-b-2 transition ${
              !isLogin ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Đăng Ký
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Họ và tên</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Tên đăng nhập</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-cyan-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-cyan-400 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 
                     text-white shadow-lg shadow-cyan-500/25 active:scale-95 transition flex items-center justify-center gap-1.5"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản & Nhận 50 Xu'}</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            Tài khoản Admin thử nghiệm: <b className="text-cyan-300">admin</b> / <b className="text-cyan-300">Admin@123</b>
          </p>
        </div>
      </div>
    </div>
  );
};
