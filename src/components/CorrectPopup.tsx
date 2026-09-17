"use client";

import { countryData, type CountryCode } from "@/lib/countryData";

interface CorrectPopupProps {
  fromCode: CountryCode;
  toCode: CountryCode;
}

export function CorrectPopup({ fromCode, toCode }: CorrectPopupProps) {
  const from = countryData[fromCode];
  const to = countryData[toCode];

  return (
    <div className="absolute inset-0 z-30">
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 flex items-center justify-center px-10">
        <div className="bg-white rounded-3xl shadow-2xl px-8 py-9 text-center w-full animate-pop-in">
          <span className="text-6xl block mb-4">{to?.flag}</span>
          <p className="text-black text-xl font-black mb-1.5">隣接しています！</p>
          <p className="text-neutral-400 text-xs nsd tracking-wide">
            {from?.name} と {to?.name} は国境を接しています
          </p>
        </div>
      </div>
    </div>
  );
}
