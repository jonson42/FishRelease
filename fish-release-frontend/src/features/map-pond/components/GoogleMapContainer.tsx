import React, { useEffect, useRef, useState } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { useFishStore } from '../../../store/useFishStore';
import { FishMarker } from './FishMarker';
import { CatchFishPopup } from './CatchFishPopup';
import { ReleaseFishModal } from './ReleaseFishModal';
import { Waves, PlusCircle } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Vị trí mặc định: Hồ Tây / Hồ Hoàn Kiếm, Hà Nội
const DEFAULT_CENTER = { lat: 21.0285, lng: 105.8542 };
const DEFAULT_ZOOM = 15;

export const GoogleMapContainer: React.FC = () => {
  const {
    fishes,
    fetchFishesInBoundingBox,
    setSelectedFish,
    setPendingReleaseLocation,
    setReleaseModalOpen,
  } = useFishStore();

  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);

  // Initial load bounding box
  useEffect(() => {
    fetchFishesInBoundingBox(
      DEFAULT_CENTER.lat - 0.05,
      DEFAULT_CENTER.lat + 0.05,
      DEFAULT_CENTER.lng - 0.05,
      DEFAULT_CENTER.lng + 0.05
    );
  }, [fetchFishesInBoundingBox]);

  const handleMapClick = (lat: number, lng: number) => {
    setPendingReleaseLocation({ lat, lng });
    setReleaseModalOpen(true);
  };

  // Nếu người dùng đã cài đặt API Key Google Maps
  if (GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY') {
    return (
      <div className="relative w-full h-full overflow-hidden">
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <Map
            defaultCenter={mapCenter}
            defaultZoom={zoomLevel}
            mapId="FISH_RELEASE_MAP_ID"
            disableDefaultUI={false}
            gestureHandling="greedy"
            className="w-full h-full"
            onClick={(e) => {
              if (e.detail.latLng) {
                handleMapClick(e.detail.latLng.lat, e.detail.latLng.lng);
              }
            }}
            onCameraChanged={(ev) => {
              const bounds = ev.detail.bounds;
              if (bounds) {
                fetchFishesInBoundingBox(
                  bounds.south,
                  bounds.north,
                  bounds.west,
                  bounds.east
                );
              }
            }}
          >
            {fishes.map((fish) => (
              <AdvancedMarker
                key={fish.id}
                position={{ lat: fish.latitude, lng: fish.longitude }}
              >
                <FishMarker fish={fish} onClick={setSelectedFish} />
              </AdvancedMarker>
            ))}
          </Map>
        </APIProvider>

        <CatchFishPopup />
        <ReleaseFishModal />
      </div>
    );
  }

  // Chế độ mô phỏng Hồ Thủy Sinh Tương Tác (Interactive GIS Lake Canvas)
  // Cho phép trải nghiệm thả/bắt cá ngay cả khi chưa nạp Google Maps API Key
  return <SimulatedInteractiveLakeContainer />;
};

/**
 * Trình mô phỏng Hồ Phóng Sinh Số tương tác cao (Fallback khi chưa có Google Maps Key)
 */
const SimulatedInteractiveLakeContainer: React.FC = () => {
  const {
    fishes,
    setSelectedFish,
    setPendingReleaseLocation,
    setReleaseModalOpen,
  } = useFishStore();

  const containerRef = useRef<HTMLDivElement>(null);

  const handleLakeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Chuyển đổi tọa độ pixel thành tọa độ Địa lý (Lat, Lng) quanh Hồ Tây
    const normX = x / rect.width;
    const normY = y / rect.height;

    const lat = 21.05 + (0.5 - normY) * 0.04;
    const lng = 105.82 + (normX - 0.5) * 0.04;

    setPendingReleaseLocation({ lat, lng });
    setReleaseModalOpen(true);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleLakeClick}
      className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#0a2540] via-[#0d3b66] to-[#041a30] cursor-crosshair select-none"
    >
      {/* Nền hiệu ứng nước và dòng chảy sóng nước */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#00f2fe_1px,transparent_1px)] [background-size:32px_32px]" />
      
      {/* Các đảo thực vật thủy sinh mô phỏng cảnh quan hồ */}
      <div className="absolute top-1/4 left-1/3 w-72 h-44 rounded-full bg-emerald-900/30 blur-2xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-56 rounded-full bg-cyan-900/40 blur-3xl pointer-events-none" />

      {/* Thông tin vùng hồ */}
      <div className="absolute top-20 left-6 z-10 pointer-events-none">
        <div className="p-3.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 text-white shadow-xl max-w-xs">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Waves className="w-4 h-4 animate-pulse" />
            <span>Hồ Thủy Sinh Phóng Sinh Số</span>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Click bất kỳ điểm nào trên mặt nước để chọn loại cá trong giỏ và phóng sinh kèm lời chúc.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 mt-2 font-medium">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Đang có {fishes.length} chú cá đang tung tăng bơi lội</span>
          </div>
        </div>
      </div>

      {/* Render các con cá đang bơi */}
      {fishes.map((fish, index) => {
        // Ánh xạ tọa độ sang phần trăm vị trí trên hồ
        const leftPercent = Math.min(Math.max(((fish.longitude - 105.80) / 0.08) * 100, 8), 92);
        const topPercent = Math.min(Math.max(((21.07 - fish.latitude) / 0.08) * 100, 12), 88);

        return (
          <div
            key={fish.id || index}
            style={{
              position: 'absolute',
              left: `${leftPercent}%`,
              top: `${topPercent}%`,
            }}
          >
            <FishMarker fish={fish} onClick={setSelectedFish} />
          </div>
        );
      })}

      {/* Popups */}
      <CatchFishPopup />
      <ReleaseFishModal />
    </div>
  );
};
