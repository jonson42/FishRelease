# Web Thả Cá Online (Phóng Sinh Số / Geo-Fishing trên Google Maps) 🐟

Hệ thống kết hợp tương tác bản đồ số thời gian thực (Google Maps / GIS), cơ chế trò chơi hóa (Gamification - Xem TikTok nhận cá miễn phí chống gian lận) và cổng nạp xu tự động (VietQR/SePay).

---

## 🏗️ 1. Cấu trúc Dự Án

```
FishRelease/
├── FishRelease.Backend/                     # Backend .NET 8 (Clean Architecture)
│   ├── FishRelease.sln
│   └── src/
│       ├── FishRelease.Domain/              # Entities, Enums, ValueObjects
│       ├── FishRelease.Application/         # CQRS (MediatR), Behaviors, DTOs, Validators
│       ├── FishRelease.Infrastructure/      # EF Core, Spatial Index, Background Jobs, VietQR, TikTok oEmbed
│       └── FishRelease.WebApi/              # Controllers, SignalR Hub (/hubs/map), JWT Auth, Swagger
│
└── fish-release-frontend/                   # Frontend ReactJS + TypeScript + TailwindCSS
    └── src/
        ├── core/                            # Axios client, Endpoints, TypeScript Interfaces, SignalR Service
        ├── features/
        │   ├── map-pond/                    # Google Maps Container, FishMarker, CatchFishPopup, ReleaseFishModal
        │   ├── fish-shop/                   # FishInventoryDrawer, FishShopModal, TopUpWalletModal
        │   ├── tiktok-tasks/                # TikTokEmbedPlayer, TaskRewardList (Anti-cheat verification)
        │   └── admin-portal/                # AdminDashboard (CRUD TikTok tasks, CRUD loài cá, Thống kê)
        ├── shared/                          # HeaderNavbar, AuthModal
        └── store/                           # Zustand Stores (useAuthStore, useFishStore, useTaskStore)
```

---

## ⚡ 2. Hướng Dẫn Chạy Nhanh (Quick Start)

### Backend (.NET 8 Web API)
```powershell
cd FishRelease.Backend
dotnet run --project src/FishRelease.WebApi/FishRelease.WebApi.csproj
```
- Swagger UI: `http://localhost:5011/swagger`
- Mặc định hệ thống tự khởi tạo In-Memory Database và Seeding sẵn:
  - 5 loài cá phong thủy (Cá Chép Đỏ - Free hàng ngày, Cá Koi Tam Thể, Cá Heo Xanh, Rùa Kim Quy, Cá Rồng Hoàng Kim).
  - Tài khoản Admin mặc định: `admin` / `Admin@123`.
  - Để dùng SQL Server: chỉ cần điền ConnectionString `DefaultConnection` trong `appsettings.json`.

### Frontend (React 19 + TypeScript + TailwindCSS)
```powershell
cd fish-release-frontend
npm install
npm run dev
```
- Mở trình duyệt tại: `http://localhost:5173`

---

## 🛡️ 3. Các Giải Pháp Kỹ Thuật Trọng Tâm

1. **Spatial Bounding Box Query**:
   - Sử dụng Index đa cột `IX_ReleasedFishes_Status_Latitude_Longitude` trên bảng `ReleasedFish`.
   - Query `GetFishesInBoundingBoxQuery` lọc siêu tốc các con cá đang bơi (`Status == Swimming`) trong phạm vi 4 góc màn hình của bản đồ.
2. **Chống gian lận nhiệm vụ TikTok (Anti-Cheat Mechanism)**:
   - Khi user bấm "Xem ngay", Backend tạo `WatchSessionToken` độc nhất và ghi nhận `StartedAt = DateTime.UtcNow`.
   - Khi gọi `ClaimTikTokRewardCommand`, Backend kiểm tra `DateTime.UtcNow - StartedAt >= RequiredWatchSeconds` (cho phép dung sai 1s). Nếu user tua hoặc gọi API sớm, request bị từ chối ngay lập tức.
   - Mỗi link TikTok chỉ nhận thưởng 1 lần nhờ khóa duy nhất `(UserId, TikTokTaskId)` trong `UserTaskHistory`.
3. **Reset cá miễn phí 00:00 hàng ngày**:
   - `DailyFreeFishResetJob` là một `IHostedService` chạy nền, tính toán thời gian đến 00:00 UTC tiếp theo và tự động cấp 10 con cá miễn phí cho người dùng.
   - Ngoài ra, hệ thống tự động kiểm tra `LastFreeFishClaimDate < Today` mỗi khi user đăng nhập hoặc vào kho cá để đảm bảo quyền lợi ngay cả khi worker bảo trì.
4. **Nạp tiền tự động qua VietQR**:
   - Tạo mã giao dịch duy nhất dạng `FISH{USER}{RANDOM}`.
   - Nhúng mã vào nội dung chuyển khoản VietQR tự động.
   - API Webhook phân tích nội dung giao dịch qua Regex và cộng xu ngay lập tức với cơ chế Idempotency chống lặp tiền.
