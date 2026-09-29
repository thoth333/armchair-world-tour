import type { CountryCode, CountryMap } from "@/lib/countryData";
import { normalize } from "@/lib/normalize";

export type NameMap = Map<string, CountryCode>;

export function buildNameMap(countries: CountryMap): NameMap {
  const map: NameMap = new Map();
  for (const [code, info] of Object.entries(countries)) {
    const candidates = [info.name, info.formalName, ...info.aliases];
    for (const candidate of candidates) {
      map.set(normalize(candidate), code);
    }
  }
  return map;
}

/**
 * 入力文字列から国コードを解決する。見つからない場合は null。
 */
export function matchCountry(
  input: string,
  nameMap: NameMap
): CountryCode | null {
  const key = normalize(input);
  if (!key) return null;
  return nameMap.get(key) ?? null;
}
