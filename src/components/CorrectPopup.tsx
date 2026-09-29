"use client";

import type { CountryCode, CountryMap } from "@/lib/countryData";

interface CorrectPopupProps {
  countries: CountryMap;
  fromCode: CountryCode;
  toCode: CountryCode;
  onDismiss: () => void;
}

export function CorrectPopup({
  countries,
  fromCode,
  toCode,
  onDismiss,
}: CorrectPopupProps) {
  const from = countries[fromCode];
  const to = countries[toCode];

  return (
    <div className="absolute inset-0 z-30" onClick={onDismiss}>
      <div className="absolute inset-0 bg-black/15" />
      <div className="absolute inset-0 flex items-center justify-center px-10">
        <div className="bg-white rounded-2xl shadow-xs px-8 py-9 text-center w-full animate-pop-in">
          <span className="text-6xl block mb-4">{to?.flag}</span>
          <p className="text-black text-xl font-medium mb-1.5">正解！</p>
          <p className="text-neutral-400 text-xs tracking-wide">
            {from?.name} と {to?.name} は国境を接しています
          </p>
        </div>
      </div>
    </div>
  );
}
