import React, { useState, useEffect } from 'react';
import { useFishStore } from '../../../store/useFishStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { axiosClient } from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';
import { FishSpecies } from '../../../core/entities/fish';
import { X, ShoppingBag, QrCode, Coins, CheckCircle2, RefreshCw } from 'lucide-react';

export const FishShopModal: React.FC = () => {
  const { isShopOpen, setShopOpen, species, fetchSpecies, buyFish } = useFishStore();
  const { user, isAuthenticated, fetchCurrentUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'shop' | 'topup'>('shop');

  // State cho mua cá
  const [selectedSpecies, setSelectedSpecies] = useState<FishSpecies | null>(null);
  const [buyQuantity, setBuyQuantity] = useState<number>(1);
  const [isBuying, setIsBuying] = useState<boolean>(false);
  const [buySuccess, setBuySuccess] = useState<string | null>(null);

  // State cho nạp tiền VietQR
  const [topUpAmount, setTopUpAmount] = useState<number>(50000);
  const [qrData, setQrData] = useState<{
    qrImageUrl: string;
    transactionCode: string;
    amountVnd: number;
    coinsToReceive: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
  } | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState<boolean>(false);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState<boolean>(false);

  useEffect(() => {
    if (isShopOpen) {
      fetchSpecies();
    }
  }, [isShopOpen, fetchSpecies]);

  if (!isShopOpen) return null;

  const handleBuyFish = async (sp: FishSpecies) => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để mua cá!');
      return;
    }

    const totalCost = sp.priceCoins * buyQuantity;
    if ((user?.walletBalance || 0) < totalCost) {
      alert(`Số dư xu không đủ! Cần ${totalCost.toLocaleString()} xu. Vui lòng sang tab Nạp Tiền.`);
      setActiveTab('topup');
      return;
    }

    try {
      setIsBuying(true);
      await buyFish(sp.id, buyQuantity);
      await fetchCurrentUser();
      setBuySuccess(`Đã mua thành công ${buyQuantity} chú ${sp.name} vào giỏ!`);
      setTimeout(() => {
        setBuySuccess(null);
        setSelectedSpecies(null);
        setBuyQuantity(1);
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi mua cá.');
    } finally {
      setIsBuying(false);
    }
  };

  const handleGenerateQr = async (amount: number) => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để tạo mã nạp tiền!');
      return;
    }

    try {
      setIsGeneratingQr(true);
      const res = await axiosClient.post<any, any>(ENDPOINTS.WALLET.CREATE_TOPUP, {
        amountVnd: amount
      });
      setQrData(res);
    } catch (err: any) {
      alert(err.message || 'Không thể tạo mã VietQR.');
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const handleRefreshBalance = async () => {
    setIsRefreshingBalance(true);
    await fetchCurrentUser();
    setTimeout(() => setIsRefreshingBalance(false), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-2xl border border-cyan-500/30 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header with Tabs */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('shop')}
              className={`px-4 py-2 rounded-2xl text-sm font-bold flex items-center gap-2 transition ${
                activeTab === 'shop'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cửa Hàng Cá Quý</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('topup');
                if (!qrData) handleGenerateQr(topUpAmount);
              }}
              className={`px-4 py-2 rounded-2xl text-sm font-bold flex items-center gap-2 transition ${
                activeTab === 'topup'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Nạp Tiền VietQR</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Số dư xu hiện tại */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-amber-500/30 flex items-center gap-1.5 text-xs">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-amber-400">
                {user?.walletBalance.toLocaleString() || 0}
              </span>
              <span className="text-slate-400">xu</span>
            </div>

            <button
              onClick={() => setShopOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Cửa hàng cá */}
        {activeTab === 'shop' && (
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {buySuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>{buySuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {species.map((sp) => (
                <div
                  key={sp.id}
                  className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-cyan-500/40 flex flex-col justify-between transition-all group"
                >
                  <div className="flex gap-3">
                    <img
                      src={sp.imageUrl}
                      alt={sp.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-cyan-500/30 flex-shrink-0 group-hover:scale-105 transition"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-white truncate">{sp.name}</h4>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                          {sp.rarity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {sp.fengShuiMeaning || sp.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400 font-black text-sm">
                      <Coins className="w-4 h-4" />
                      <span>{sp.priceCoins === 0 ? 'Miễn phí hàng ngày' : `${sp.priceCoins.toLocaleString()} xu`}</span>
                    </div>

                    {sp.priceCoins > 0 ? (
                      <button
                        onClick={() => handleBuyFish(sp)}
                        disabled={isBuying}
                        className="py-1.5 px-3 rounded-xl text-xs font-bold bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-white border border-cyan-500/40 transition active:scale-95"
                      >
                        Mua 1 con
                      </button>
                    ) : (
                      <span className="text-[11px] text-cyan-400 italic">Có sẵn trong kho</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Nạp tiền VietQR */}
        {activeTab === 'topup' && (
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            <div className="p-3.5 rounded-2xl bg-cyan-900/30 border border-cyan-500/30 text-xs text-slate-300 flex items-center justify-between">
              <span>Tỷ lệ quy đổi: <b className="text-amber-400">10,000 VNĐ = 100 Xu</b>. Quét mã QR để được cộng xu tự động sau 5-10 giây!</span>
              <button
                onClick={handleRefreshBalance}
                className="p-1 text-cyan-400 hover:text-white flex items-center gap-1 text-xs"
                title="Kiểm tra số dư mới"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingBalance ? 'animate-spin' : ''}`} />
                <span>Cập nhật</span>
              </button>
            </div>

            {/* Các gói nạp nhanh */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Chọn mệnh giá nạp
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[20000, 50000, 100000, 200000, 500000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      setTopUpAmount(amt);
                      handleGenerateQr(amt);
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                      topUpAmount === amt
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {amt.toLocaleString()}đ
                  </button>
                ))}
              </div>
            </div>

            {/* Hiển thị QR Code VietQR */}
            {qrData && (
              <div className="mt-4 p-5 rounded-3xl bg-slate-800/60 border border-amber-500/30 flex flex-col md:flex-row items-center gap-6">
                <div className="p-3 bg-white rounded-2xl shadow-xl flex-shrink-0">
                  <img
                    src={qrData.qrImageUrl}
                    alt="VietQR Code"
                    className="w-44 h-44 object-contain"
                  />
                </div>

                <div className="space-y-2.5 text-xs text-slate-300 flex-1">
                  <div className="flex justify-between py-1 border-b border-slate-700">
                    <span className="text-slate-400">Ngân hàng:</span>
                    <span className="font-bold text-white">{qrData.bankName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-700">
                    <span className="text-slate-400">Số tài khoản:</span>
                    <span className="font-mono font-bold text-amber-400 text-sm">{qrData.accountNumber}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-700">
                    <span className="text-slate-400">Tên chủ tài khoản:</span>
                    <span className="font-bold text-white">{qrData.accountName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-700">
                    <span className="text-slate-400">Số tiền:</span>
                    <span className="font-bold text-emerald-400 text-sm">{qrData.amountVnd.toLocaleString()} VNĐ</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-700">
                    <span className="text-slate-400">Nội dung chuyển khoản (bắt buộc):</span>
                    <span className="font-mono font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/40">
                      {qrData.transactionCode}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Xu nhận được:</span>
                    <span className="font-bold text-amber-400">+{qrData.coinsToReceive} xu</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
