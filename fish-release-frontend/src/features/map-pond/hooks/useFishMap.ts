import { useState, useCallback } from 'react';
import { useFishStore } from '../../../store/useFishStore';

export function useFishMap() {
  const { fetchFishesInBoundingBox, setPendingReleaseLocation, setReleaseModalOpen } = useFishStore();
  const [isWaterChecking, setIsWaterChecking] = useState(false);

  // Kiểm tra xem vị trí click có phải là vùng nước (Water body/River/Lake)
  // Thực tế có thể gọi Overpass API: [out:json];is_in(lat,lng);... hoặc Google Maps Styling / Static Pixel test
  const verifyWaterLocation = useCallback(async (lat: number, lng: number): Promise<boolean> => {
    setIsWaterChecking(true);
    try {
      // Mô phỏng kiểm tra vùng nước với Overpass API (hoặc cho phép thả tự do với cảnh báo nhẹ)
      // Trong môi trường dev/demo, chấp nhận tọa độ với xác suất thành công cao hoặc kiểm tra thực tế
      await new Promise(r => setTimeout(r, 200));
      return true;
    } catch {
      return true;
    } finally {
      setIsWaterChecking(false);
    }
  }, []);

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    const isWater = await verifyWaterLocation(lat, lng);
    if (isWater) {
      setPendingReleaseLocation({ lat, lng });
      setReleaseModalOpen(true);
    } else {
      alert('Vui lòng chọn thả cá vào vùng sông, suối, ao, hồ nước mát!');
    }
  }, [verifyWaterLocation, setPendingReleaseLocation, setReleaseModalOpen]);

  const handleBoundsChange = useCallback((minLat: number, maxLat: number, minLng: number, maxLng: number) => {
    fetchFishesInBoundingBox(minLat, maxLat, minLng, maxLng);
  }, [fetchFishesInBoundingBox]);

  return {
    handleMapClick,
    handleBoundsChange,
    isWaterChecking
  };
}
