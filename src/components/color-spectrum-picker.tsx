'use client';

import React, { useRef } from 'react';
import { Check, Pipette } from 'lucide-react';

export const POPULAR_VEHICLE_COLORS = [
  { name: 'Electric Blue', hex: '#0071e3' },
  { name: 'Ferrari Crimson', hex: '#ff3b30' },
  { name: 'Emerald Green', hex: '#34c759' },
  { name: 'Sunset Amber', hex: '#ff9500' },
  { name: 'Vision Purple', hex: '#af52de' },
  { name: 'Cyber Yellow', hex: '#ffd60a' },
  { name: 'Alpine Pearl White', hex: '#f8fafc' },
  { name: 'Onyx Black', hex: '#1c1c1e' }
];

interface ColorSpectrumPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  surpriseUnlocked?: boolean;
}

export function ColorSpectrumPicker({
  selectedColor,
  onColorChange
}: ColorSpectrumPickerProps) {
  const colorInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="p-4 rounded-2xl apple-glass border border-black/10 dark:border-white/10 space-y-3">
      {/* Subtle, modern Apple title */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold daylight-text-main uppercase tracking-wider block">
            Vehicle Color
          </label>
          <p className="text-[11px] daylight-text-muted mt-0.5">
            Your vehicle color is your app color
          </p>
        </div>

        {/* Live Swatch Pill */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold daylight-text-sub uppercase tracking-wider hidden sm:inline">
            {selectedColor}
          </span>
          <div
            className="h-6 w-6 rounded-full border-2 border-white shadow-md transition-transform scale-110 shrink-0"
            style={{ backgroundColor: selectedColor }}
          />
        </div>
      </div>

      {/* Single Unified Line: Curated Colors + Spectrum Eyedropper on the same line */}
      <div className="flex items-center gap-2">
        {/* Curated Swatches Grid */}
        <div className="flex-1 grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2">
          {POPULAR_VEHICLE_COLORS.map((p) => {
            const isSelected = selectedColor.toLowerCase() === p.hex.toLowerCase();
            const isLightColor = p.hex === '#f8fafc' || p.hex === '#ffd60a';
            return (
              <button
                key={p.hex}
                type="button"
                onClick={() => onColorChange(p.hex)}
                className={`h-9 w-full rounded-xl transition-all duration-300 flex items-center justify-center border cursor-pointer relative ${
                  isSelected
                    ? 'scale-105 shadow-md ring-2 ring-blue-500 z-10 border-white'
                    : 'border-black/10 dark:border-white/15 hover:scale-102 opacity-85 hover:opacity-100'
                }`}
                style={{ backgroundColor: p.hex }}
                title={p.name}
              >
                {isSelected && (
                  <Check
                    className={`h-3.5 w-3.5 drop-shadow-md ${
                      isLightColor ? 'text-black' : 'text-white'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Integrated Spectrum Button on the Same Line */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => colorInputRef.current?.click()}
            className="h-9 px-3 rounded-xl apple-glass border border-black/10 dark:border-white/15 flex items-center gap-1.5 cursor-pointer shadow-xs hover:scale-102 active:scale-98 transition-all overflow-hidden relative group"
            title="Choose exact custom spectrum color"
          >
            {/* Subtle rainbow edge accent */}
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
              style={{
                background:
                  'conic-gradient(from 0deg, #ff0000, #ff7f00, #ffff00, #00ff00, #00ffff, #0000ff, #8b00ff, #ff00ff, #ff0000)'
              }}
            />
            <Pipette className="h-3.5 w-3.5 daylight-text-sub" />
            <span className="text-xs font-bold daylight-text-main hidden sm:inline">Spectrum</span>

            <input
              ref={colorInputRef}
              type="color"
              value={selectedColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
