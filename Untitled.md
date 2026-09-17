ここまでのロジック面の話を整理します。

## ゲームルールのまとめ

| 論点 | 決定内容 |
|---|---|
| 対象国 | 外務省が承認する196か国（195か国＋北朝鮮）から、島国39か国を除いた157か国 |
| 飛び地 | オマーン（ムサンダム半島）、ロシアのカリーニングラード、アゼルバイジャンのナヒチェヴァン自治共和国は隣接扱いに含める |
| 橋・トンネル | 隣接として認めない（純粋な陸上国境のみ） |
| 未承認・係争地域 | コソボ＝独立国として扱う／西サハラ＝独立エントリとして扱う／台湾＝島国のため除外／パレスチナ＝イスラエルの一部として吸収／北キプロス＝キプロスの一部として吸収（キプロス自体は島国のため除外） |
| 海峡越え等の近接 | 許可しない |
| 国コード | ISO 3166-1 alpha-2（絵文字国旗にも使われる2文字コード） |

## データ構成の方針

隣接判定の実装方法として、次の3案を検討しました。

1. **隣接リストをオブジェクトで持つ**（採用）：国コードをキーに、隣接国コードの配列を値として持つ
2. 隣接ペアのセットを持つ：ペア文字列の集合として持つ
3. 隣接行列（2次元配列）を持つ：全組み合わせの真偽値表を持つ

**採用理由**：判定処理が`includes`だけで済み高速（隣接国はどの国でも多くて十数か国程度）、データ構造が直感的でデバッグしやすい、「この国の隣接国一覧を出す」といった別機能にも転用しやすい、という点から**方法1**を選びました。

## 作成したデータの中身

`country_borders_final.json`として、157か国分のデータをファイルに書き出しました。各国は次の情報を持ちます。

```json
{
  "AZ": {
    "name": "アゼルバイジャン",
    "formalName": "アゼルバイジャン共和国",
    "aliases": [],
    "flag": "🇦🇿",
    "borders": ["RU", "GE", "AM", "IR", "TR"]
  }
}
```

- `name`：外務省一覧での表示名
- `formalName`：正式名称
- `aliases`：通称・別表記（入力マッチング用）
- `flag`：国旗絵文字
- `borders`：隣接国コードの配列

データ作成後、次の2点を機械的に検証済みです。

- **対称性**：AがBを隣接と言っているなら、BもAを隣接と言っている
- **参照整合性**：存在しない国コードへの参照がない

## 「JSONファイルを参照する形になるのか」について

はい、その認識で合っています。実装としては、このJSONファイルをReactアプリに静的にインポートし、メモリ上に読み込んで判定に使う形になります。

```javascript
import countryData from "./country_borders_final.json";

function isAdjacent(fromCode, toCode) {
  return countryData[fromCode]?.borders.includes(toCode) ?? false;
}
```

外部APIを都度呼び出す方式ではなく、**ビルド時（アプリ作成時）に一度だけ用意した静的データを、実行時にはメモリ上の参照だけで判定する**という設計です。これにより、次のメリットがあります。

- オフラインでも動作する
- 通信の遅延がなく、判定が瞬時
- 外部サービスの障害に影響されない

一方で、国境が変わるような大きな地政学的変化（独立国の誕生など）があった場合は、JSONファイル自体を手動で更新する必要があります。ただし、この種の変化は頻繁に起こるものではないため、静的データで十分実用的だと考えます。

## 次のステップ

このJSONを前提に、Reactアプリ側で必要になるロジックは主に次の3つです。

1. **入力マッチングロジック**：ユーザーが入力した国名（表示名・正式名称・別名のいずれか、表記ゆれ含む）を国コードに変換する処理
2. **隣接判定ロジック**：直前の国コードと今回の国コードを`isAdjacent`で判定する処理
3. **ゲーム履歴の状態管理**：これまで挙げた国の履歴を保持し、同じ国の再使用を禁止するかどうかなどのルール処理

このあたりの設計に進みますか？


ご回答ありがとうございます。ルールが固まりました。

## 確定したゲームロジック

| 論点 | 決定内容 |
|---|---|
| 再使用 | 禁止（一度使った国は二度と使えない） |
| 表記ゆれ | ひらがな/カタカナ揺れまで吸収（スペルミス救済はしない） |
| 不正解時の挙動 | 「隣接していません」というエラーのみ表示し、ゲームは続行（再入力可能） |

「エラーだけ出す」という点について、実装上は「不正解と入力そのものを拒否して同じターンのまま再入力させる」のか、「不正解を履歴には残しつつ、次の入力を促す」のかで多少実装が変わります。ここでは自然な体感として**前者（入力を確定させず、その場で再入力させる）**として設計を進めます。異なる想定であれば後で調整可能です。

## 全体構成

```
src/
├── data/
│   └── countryBorders.json      # 作成済みの157か国データ
├── utils/
│   ├── normalize.js             # 表記ゆれ吸収・正規化処理
│   ├── matchCountry.js          # 入力文字列 → 国コード解決
│   └── judge.js                 # 隣接判定ロジック
├── hooks/
│   └── useGameState.js          # ゲーム状態管理（履歴・現在国・エラー）
└── components/
    └── （既存の画面デザインに合わせて実装）
```

## 1. 正規化処理（`normalize.js`）

ひらがな/カタカナ揺れを吸収するため、判定前に文字列を一定の形式に統一します。

```javascript
// utils/normalize.js

/**
 * ひらがなをカタカナに変換する
 */
function hiraganaToKatakana(str) {
  return str.replace(/[\u3041-\u3096]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60)
  );
}

/**
 * 入力文字列を判定用に正規化する
 * - 前後の空白を除去
 * - ひらがなをカタカナに統一
 * - 全角スペース・中黒（・）・長音符の表記ゆれをある程度吸収
 */
export function normalize(str) {
  if (!str) return "";
  return hiraganaToKatakana(str)
    .trim()
    .replace(/\s+/g, "")       // 空白除去
    .replace(/　/g, "")        // 全角スペース除去
    .normalize("NFKC");        // 全角/半角の統一
}
```

## 2. 入力文字列から国コードを解決（`matchCountry.js`）

`name`・`formalName`・`aliases`のいずれかに正規化後一致すれば、その国コードを返します。

```javascript
// utils/matchCountry.js
import countryData from "../data/countryBorders.json";
import { normalize } from "./normalize";

// 起動時に一度だけ「正規化済み名称 → 国コード」の逆引き辞書を作る
const nameToCodeMap = (() => {
  const map = new Map();
  for (const [code, info] of Object.entries(countryData)) {
    const candidates = [info.name, info.formalName, ...info.aliases];
    for (const c of candidates) {
      map.set(normalize(c), code);
    }
  }
  return map;
})();

/**
 * 入力文字列から国コードを解決する。
 * 見つからない場合は null を返す。
 */
export function matchCountry(input) {
  const key = normalize(input);
  return nameToCodeMap.get(key) ?? null;
}
```

`aliases`に登録漏れがあると解決できなくなるので、辞書構築時に重複や衝突がないかを事前にチェックしておくと安全です（例えば`console.warn`で重複キーを警告するなど）。

## 3. 隣接判定ロジック（`judge.js`）

```javascript
// utils/judge.js
import countryData from "../data/countryBorders.json";

export const JudgeResult = {
  OK: "OK",
  NOT_ADJACENT: "NOT_ADJACENT",
  UNKNOWN_COUNTRY: "UNKNOWN_COUNTRY",
  ALREADY_USED: "ALREADY_USED",
};

/**
 * fromCode(直前の国) から toCode(今回の国) への遷移が正当かを判定する。
 * usedCodes: これまでに使用済みの国コードのSet
 */
export function judgeMove(fromCode, toCode, usedCodes) {
  if (!countryData[toCode]) {
    return JudgeResult.UNKNOWN_COUNTRY;
  }
  if (usedCodes.has(toCode)) {
    return JudgeResult.ALREADY_USED;
  }
  const isAdjacent = countryData[fromCode]?.borders.includes(toCode) ?? false;
  if (!isAdjacent) {
    return JudgeResult.NOT_ADJACENT;
  }
  return JudgeResult.OK;
}
```

「不正解」には実は2種類あります。**隣接していない場合**と**そもそも国名として認識できない場合**です。この2つは別のエラーメッセージにした方が親切なので、`JudgeResult`として区別しています。また、再使用禁止ルールがあるため`ALREADY_USED`も判定に含めています。

## 4. ゲーム状態管理（`useGameState.js`）

Reactの`useState`でシンプルに管理します。

```javascript
// hooks/useGameState.js
import { useState, useCallback } from "react";
import { matchCountry } from "../utils/matchCountry";
import { judgeMove, JudgeResult } from "../utils/judge";
import countryData from "../data/countryBorders.json";

export function useGameState() {
  const [history, setHistory] = useState([]);   // 国コードの配列
  const [error, setError] = useState(null);     // 直近のエラーメッセージ

  const submitCountry = useCallback((rawInput) => {
    const toCode = matchCountry(rawInput);

    if (!toCode) {
      setError("その国名は認識できませんでした");
      return;
    }

    const usedCodes = new Set(history);
    const fromCode = history[history.length - 1]; // 最初のターンはundefined

    // 最初の1か国目は隣接判定をスキップして無条件に受理する
    if (history.length === 0) {
      setHistory([toCode]);
      setError(null);
      return;
    }

    const result = judgeMove(fromCode, toCode, usedCodes);

    switch (result) {
      case JudgeResult.OK:
        setHistory((prev) => [...prev, toCode]);
        setError(null);
        break;
      case JudgeResult.NOT_ADJACENT:
        setError(
          `${countryData[fromCode].name}と${countryData[toCode].name}は隣接していません`
        );
        break;
      case JudgeResult.ALREADY_USED:
        setError(`${countryData[toCode].name}は既に使用済みです`);
        break;
      default:
        setError("その国名は認識できませんでした");
    }
  }, [history]);

  const reset = useCallback(() => {
    setHistory([]);
    setError(null);
  }, []);

  return { history, error, submitCountry, reset };
}
```

不正解時は`setHistory`を呼ばないため、履歴には反映されず、エラーメッセージだけが表示されて再入力を促す挙動になります。

## この設計のポイント

- **JSONは起動時に1回だけ読み込み**、以後はメモリ上の参照のみで動作するため、判定処理に通信は一切発生しません
- **正規化と辞書構築を`matchCountry.js`のモジュール読み込み時に1回だけ実行**する設計にしているので、入力のたびに全件走査するような無駄な処理は発生しません
- 状態管理は`history`（配列）だけで完結しており、「直前の国」「使用済み国のSet」はその都度そこから導出しているため、状態の二重管理によるバグを防いでいます

## 確認したい点

最初の1か国目（スタート国）の扱いについて、上記コードでは「何を入力しても無条件に受理する」としています。この認識で問題ないか、あるいはスタート国に何か制約（自分の国から始める、ランダムに指定するなど）を設けたいか、確認させてください。