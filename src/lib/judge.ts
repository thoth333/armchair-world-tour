import { countryData, type CountryCode } from "@/lib/countryData";

export type JudgeResult = "OK" | "NOT_ADJACENT" | "ALREADY_USED";

/**
 * fromCode（現在地）から toCode（入力された国）への移動が正当かを判定する。
 *
 * 「隣接していない」と「そもそも国名として認識できない」は、呼び出し側
 * （matchCountryがnullを返した時点）で同一のエラー扱いにするため、
 * ここでは toCode は解決済みの国コードのみを受け取る。
 */
export function judgeMove(
  fromCode: CountryCode,
  toCode: CountryCode,
  usedCodes: Set<CountryCode>
): JudgeResult {
  if (usedCodes.has(toCode)) {
    return "ALREADY_USED";
  }
  const isAdjacent = countryData[fromCode]?.borders.includes(toCode) ?? false;
  if (!isAdjacent) {
    return "NOT_ADJACENT";
  }
  return "OK";
}
