import { countryData, type CountryCode } from "@/lib/countryData";
import { normalize } from "@/lib/normalize";

const nameToCodeMap: Map<string, CountryCode> = (() => {
  const map = new Map<string, CountryCode>();
  for (const [code, info] of Object.entries(countryData)) {
    const candidates = [info.name, info.formalName, ...info.aliases];
    for (const candidate of candidates) {
      map.set(normalize(candidate), code);
    }
  }
  return map;
})();

/**
 * 入力文字列から国コードを解決する。見つからない場合は null。
 */
export function matchCountry(input: string): CountryCode | null {
  const key = normalize(input);
  if (!key) return null;
  return nameToCodeMap.get(key) ?? null;
}
