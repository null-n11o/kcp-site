# Design Overhaul — Swiss Modernist Dark

**Date:** 2026-04-26
**Scope:** KCP コーポレートサイト全ページのUI/レイアウト変更（コンテンツ・i18n・機能は変更なし）

---

## 1. デザイン方針

### トーン＆マナー
スイス・モダニスト（International Typographic Style）× ダーク統一。グリッド・タイポグラフィ・水平ルールを構造の軸とし、装飾に頼らない力強さを目指す。

### カラーシステム
| 用途 | 値 |
|---|---|
| 背景（全セクション統一） | `#0a0a0a` / `#0e0e0e`（交互も可） |
| メインテキスト | `#f0f0f0` |
| サブテキスト | `#a0a0b0` |
| ミュートテキスト | `#606070` |
| アクセント（ブルー） | `#4a9eff`（ラベル・番号・細ボーダーに限定使用） |
| ボーダー | `#2a2a3e`（通常）/ `#1e1e2e`（サブ） |
| 背景サブ | `#141414` |

アクセントブルーは「グロー・発光」用途から「ラベル・番号・細線アクセント」用途に転換する。

### タイポグラフィ
- フォントファミリー: 変更なし（`Noto Sans JP` / `Inter`）
- 見出し: `font-black`（900）を積極使用、`letter-spacing: -0.02em`
- ラベル類: `text-transform: uppercase` + `letter-spacing: 0.12〜0.15em` + `text-xs`
- 番号類: `font-family: monospace`、`font-black`、アクセントブルー
- セクション番号フォーマット: `01 — Service`、`02 — About` 等

---

## 2. 除去する要素（現在の「AIっぽさ」の原因）

| 要素 | 対応 |
|---|---|
| `radial-gradient` / グリッドオーバーレイ | 完全除去。背景は単色のみ |
| `backdrop-blur-md` | 除去。Headerは `background-color: rgba(10,10,10,0.95)` のみ |
| `animate-pulse` | 除去 |
| `hover:-translate-y-1` | 除去（hover は color transition のみに留める） |
| `rounded-xl` / `rounded-2xl` | `rounded-none`（シャープボーダー）に統一 |
| `border-accent/30` 系のグロー | `border-[#2a2a3e]` に統一 |
| SectionHeading の装飾的アンダーライン | 除去。番号ラベル + 水平ルールに置換 |
| Hero の eyebrow バッジ（pulsing dot） | 除去。セクション番号ラベルに置換 |
| スクロールインジケーター（縦グラデーション線） | 除去 |

---

## 3. 追加する要素（スイス感の源泉）

| 要素 | 実装方針 |
|---|---|
| セクション番号ラベル | 各セクション冒頭に `<p class="label">01 — Service</p>` |
| 水平ルール | セクションヘッダー下・行間に `border-b border-[#2a2a3e]` |
| 太いボトムルール | Hero・Contact の締めに `border-t-2 border-white` |
| テーブル行形式 | Service / Strength / Blog / Company で統一 |
| モノスペース番号 | `<span class="font-mono font-black text-accent/40">01</span>` |

---

## 4. セクション別レイアウト仕様

### Header
変更: backdrop-blur 除去、border-b を `border-[#2a2a3e]` に統一。構造・ナビ項目はそのまま。

### Hero
**レイアウト:** フルワイド・ビッグタイポグラフィ

```
┌─────────────────────────────────┐
│ 01 — Corporation        2026 —  │  ← 上部：ラベル左右配置
│                                 │
│ [超大見出し 32px+ font-black]    │  ← 全幅、letter-spacing tight
│ AIで、ビジネスを                  │
│ もっとシンプルに。                │
│                                 │
├─────────────────────────────────┤  ← border-t-2 border-white
│ [説明文]              [CTA btn] │  ← 左右配置
└─────────────────────────────────┘
```

- 背景: `#0a0a0a` 単色（グラデーション・グリッドオーバーレイなし）
- CTA: `bg-white text-black font-bold` プライマリ、アウトライン `border border-[#333]` セカンダリ
- スクロールインジケーター: 除去

### Service
**レイアウト:** 3列横ルール行テーブル

```
02 — Service
─────────────────────────────────────
01  SNS運用代行        企画・投稿・分析を…
─────────────────────────────────────
02  CS代行            AI9割・人間1割の…
─────────────────────────────────────
03  受託開発DIR        技術とビジネスを…
─────────────────────────────────────
04  AI導入支援         現場に合ったAI活用で…
─────────────────────────────────────
```

- グリッド: `grid-cols-[2rem_1fr_2fr]`
- 番号: `font-mono font-black text-accent opacity-40`
- タイトル: `font-bold text-white`
- 説明: `text-text-secondary text-sm`
- emoji アイコン: 除去

### MVV（Mission / Vision / Values）
**レイアウト:** 大引用 + インライン Vision + 番号Valuesリスト

```
03 — Mission / Vision / Values
─────────────────────────────────────
│ Mission                           │  ← 左ボーダー 2px accent
│ "人と組織が本当にやるべきことに…"   │  ← font-black, 大きめ
─────────────────────────────────────
Vision  日本と世界、レガシーとモダンを…  ← ラベル左、テキスト右インライン
─────────────────────────────────────
Values
01  本質は不変、実行は最新
02  人間には人間にしかできない仕事を
03  全てを長期的視点で積み上げる
04  勝っても攻めるパラノイア
05  失敗の度、強くなる反脆弱性
```

- Mission 左ボーダー: `border-l-2 border-accent pl-4`
- Vision: `grid grid-cols-[4rem_1fr]` でラベルとテキストをインライン配置
- Values: 番号+タイトルのみ表示（説明文は非表示。ホバーやアコーディオンは実装しない）

### Strength
**レイアウト:** 3列横ルール行テーブル（Service と同形式）

```
04 — Strength
─────────────────────────────────────
01  AIエージェント活用    Claude Code等を駆使した…
─────────────────────────────────────
02  技術とビジネスの橋渡し  非技術者出身ならでは…
─────────────────────────────────────
03  英語対応・海外知見     海外コネクションを活かし…
─────────────────────────────────────
```

- Service と同一のグリッド・スタイル定義を共有

### Blog Preview
**レイアウト:** 日付・タイトル+説明・タグの横行リスト

```
05 — Blog                    すべて見る →
─────────────────────────────────────────
2026.03.23  AIエージェントを使い…  [AI]
─────────────────────────────────────────
2026.02.10  AI時代のビジネス運営   [DX]
─────────────────────────────────────────
2026.01.05  KCPへようこそ         [News]
─────────────────────────────────────────
```

- グリッド: `grid-cols-[5rem_1fr_auto]`
- 日付: `font-mono text-xs text-text-muted`
- タグ: `border border-accent/30 text-accent text-xs px-1`（丸み除去）
- `PostCard` に `variant="row"` prop を追加し、行形式レンダリングに対応させる。BlogPreview は `variant="row"` を渡す

### Company
**レイアウト:** 既存の `label: value` テーブル構造をそのまま活用。スタイルのみ統一。

- `rounded` 除去、`border-[#2a2a3e]` 統一
- セクションラベル `06 — Company` を追加

### Contact
**レイアウト:** フルワイド見出し + ボールドルール + 説明＆CTA

```
07 — Contact
─────────────────────────────────────
Let's Work Together.                  ← font-black, 大見出し
══════════════════════════════════════  ← border-t-2 border-white
[説明文]                    [CTA btn]  ← 左右配置
─────────────────────────────────────
```

- Hero と同一の視覚言語で、ページ冒頭と末尾が対になる
- CTA: `bg-white text-black font-bold text-sm uppercase tracking-wider`

### Footer
- `border-t border-[#2a2a3e]` で上部区切り
- 著作権テキスト + プレスリリースリンクのみ（現状維持、スタイル統一）

---

## 5. 共通コンポーネント変更

### SectionHeading
現在の装飾（アンダーライン等）を除去。`sectionNumber` prop（例: `"01"`）と `sectionLabel`（例: `"Service"`）を追加し、`01 — Service` 形式のラベルをコンポーネント内でレンダリングする。

### Button
- `rounded-lg` → `rounded-none`
- primary: `bg-white text-black hover:bg-gray-100`
- outline: `border border-[#333] text-white hover:border-white`

### TagBadge
- `rounded-full` → `rounded-none`
- `bg-accent/10 border-accent/30` のままだが丸みを除去

### tailwind.config.mjs
追加 utility:
```js
// section-label: 01 — Service スタイル用
```

特に変更なし。既存カラートークンをそのまま活用。

---

## 6. コンテンツ変更（例外）

- **Hero 見出しを英語化する（ja.ts のみ）**
  - `headlinePre` / `headlineAccent` / `headlinePost` を英語コピーに変更
  - 例: `"We Make Business Simple."` 相当のコピー
  - `subtext`（日本語説明文）は変更しない
  - en.ts は元々英語なので変更不要

## 7. 変更しないもの

- コンテンツ（Hero見出し以外の i18n テキスト）
- FadeIn アニメーション（IntersectionObserver ロジック維持）
- ToC・ブログレイアウト（`BlogLayout.astro`、`BlogHero.astro`）
- モバイルメニューのロジック
- `prose.css` の Typography スタイル
- テスト・ビルド設定

---

## 7. 実装スコープ（Approach C）

変更対象ファイル:
- `src/styles/global.css`
- `tailwind.config.mjs`（必要に応じて）
- `src/components/ui/Button.astro`
- `src/components/ui/SectionHeading.astro`
- `src/components/ui/TagBadge.astro`
- `src/components/layout/Header.astro`
- `src/components/layout/Footer.astro`
- `src/components/sections/Hero.astro`
- `src/components/sections/Service.astro`
- `src/components/sections/MVV.astro`
- `src/components/sections/Strength.astro`
- `src/components/sections/BlogPreview.astro`
- `src/components/sections/Contact.astro`
- `src/components/sections/Company.astro`
- `src/components/blog/PostCard.astro`（compact表示用も含む）
- `src/components/blog/TagBadge.astro`
