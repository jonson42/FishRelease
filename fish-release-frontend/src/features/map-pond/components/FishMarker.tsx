import React from 'react';
import { ReleasedFish } from '../../../core/entities/fish';
import { Sparkles } from 'lucide-react';

interface FishMarkerProps {
  fish: ReleasedFish;
  onClick: (fish: ReleasedFish) => void;
}

const RARITY_COLORS: Record<string, string> = {
  Common: 'from-amber-400 to-orange-500 border-amber-300 shadow-amber-500/50',
  Rare: 'from-blue-400 to-cyan-500 border-blue-300 shadow-blue-500/50',
  Epic: 'from-purple-500 to-pink-500 border-purple-300 shadow-purple-500/50',
  Legendary: 'from-yellow-300 via-amber-400 to-yellow-600 border-yellow-200 shadow-yellow-400/80',
};

export const FishMarker: React.FC<FishMarkerProps> = ({ fish, onClick }) => {
  const gradientClass = RARITY_COLORS[fish.rarity] || RARITY_COLORS.Common;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick(fish);
      }}
      className="group relative cursor-pointer select-none -translate-x-1/2 -translate-y-1/2"
      title={`${fish.fishSpeciesName} - ${fish.releasedByUserName}`}
    >
      {/* Hiệu ứng gợn sóng nước (Water ripple animation) */}
      <div className="absolute inset-0 -m-3 rounded-full bg-cyan-400/20 animate-ripple pointer-events-none" />
      <div className="absolute inset-0 -m-1.5 rounded-full bg-cyan-300/30 animate-pulse pointer-events-none" />

      {/* Marker chính với ảnh cá đang bơi */}
      <div
        className={`relative w-12 h-12 rounded-full p-0.5 bg-gradient-to-br ${gradientClass} shadow-lg border-2 
                   transition-all duration-300 transform group-hover:scale-125 group-hover:z-30 animate-swim flex items-center justify-center`}
      >
        <img
          src={fish.imageUrl}
          alt={fish.fishSpeciesName}
          className="w-full h-full object-cover rounded-full pointer-events-none"
        />

        {fish.rarity === 'Legendary' && (
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-spin" />
        )}
      </div>

      {/* Bong bóng lời chúc (Wish tooltip) */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-40 pointer-events-none">
        <div className="bg-slate-900/95 backdrop-blur-md text-white text-xs px-3 py-2 rounded-xl shadow-2xl border border-cyan-500/30 whitespace-nowrap max-w-xs">
          <p className="font-semibold text-cyan-300 flex items-center gap-1">
            <span>🐟</span> {fish.fishSpeciesName}
          </p>
          <p className="text-slate-300 italic text-[11px] truncate max-w-[200px]">
            "{fish.wishMessage}"
          </p>
          <p className="text-slate-400 text-[10px] mt-0.5">
            Bởi: <span className="text-slate-200 font-medium">{fish.releasedByUserName}</span>
          </p>
        </div>
        <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-cyan-500/30" />
      </div>
    </div>
  );
};
