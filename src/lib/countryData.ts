import rawData from "@/data/countryBorders.json";

export type CountryCode = string;

export interface CountryInfo {
  name: string;
  formalName: string;
  aliases: string[];
  flag: string;
  borders: CountryCode[];
}

export type CountryMap = Record<CountryCode, CountryInfo>;

/** 設定を適用する前のベースデータ（常にオンの国境だけを持つ） */
export const baseCountryData: CountryMap = rawData;
