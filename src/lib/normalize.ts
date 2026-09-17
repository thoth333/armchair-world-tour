function hiraganaToKatakana(str: string): string {
  return str.replace(/[ぁ-ゖ]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60)
  );
}

/**
 * 表記ゆれ（ひらがな/カタカナ・全角半角・空白・中黒・長音符）を吸収するための正規化。
 */
export function normalize(str: string): string {
  if (!str) return "";
  return hiraganaToKatakana(str)
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, "")
    .replace(/[・･]/g, "")
    .replace(/[ー－―]/g, "ー");
}
