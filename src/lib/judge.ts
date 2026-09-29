import type { CountryCode, CountryMap } from "@/lib/countryData";

export type JudgeResult = "OK" | "NOT_ADJACENT" | "ALREADY_USED";

/**
 * fromCode（現在地）から toCode（入力された国）への移動が正当かを判定する。
 *
 * 「そもそも国名として認識できない」場合は、呼び出し側
 * （matchCountryがnullを返した時点）で別のエラーとして扱うため、
 * ここでは toCode は解決済みの国コードのみを受け取る。
 */
export function judgeMove(
  countries: CountryMap,
  fromCode: CountryCode,
  toCode: CountryCode,
  usedCodes: Set<CountryCode>
): JudgeResult {
  if (usedCodes.has(toCode)) {
    return "ALREADY_USED";
  }
  const isAdjacent = countries[fromCode]?.borders.includes(toCode) ?? false;
  if (!isAdjacent) {
    return "NOT_ADJACENT";
  }
  return "OK";
}
