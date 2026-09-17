import rawData from "@/data/countryBorders.json";

export type CountryCode = string;

export interface CountryInfo {
  name: string;
  formalName: string;
  aliases: string[];
  flag: string;
  borders: CountryCode[];
}

export const countryData: Record<CountryCode, CountryInfo> = rawData;

export function getCountry(code: CountryCode): CountryInfo | undefined {
  return countryData[code];
}
