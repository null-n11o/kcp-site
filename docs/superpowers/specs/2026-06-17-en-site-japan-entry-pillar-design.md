# 英語版サイト再設計：日本進出支援を柱とした構成

作成日: 2026-06-17
ブランチ: `feat/en-japan-entry-pillar`

## 背景と目的

英語版ページが日本語版と「整合していない」状態にある。ただし日本語版と
サービス内容を1:1で揃えるのではなく、**英語市場向けには「日本進出支援
(Japan Entry Support)」を唯一の柱とし、SNS運用・AI研修・受託開発などは
すべてその中に内包される能力として見せる**、という方針で再設計する。

現状の課題:

- EN トップの Service セクションが日本語版同様のフラットな複数サービス
  一覧（SNS / Global Business / Contract Development / AI Training の4項目）で、
  主力である日本進出支援が2番目に埋もれている。
- EN に `it-support`（丸投げIT担当）相当ページは不要だが、未コミットの
  `en/services/sns.astro`・`en/services/ai-training.astro` が中途半端に存在。
- EN Hero の文言が「SNS・受託開発・AI導入支援」並列で、柱の位置づけと矛盾。
- 言語切替ボタンが現在パスを1:1変換するだけのため、片方の言語にしか
  存在しないページ（JA `it-support` / EN `japan-entry` など）で切り替えると
  404 になる。

## スコープ

含む:

1. EN トップの Service セクションを「柱＋内包能力」の新レイアウトに再設計
2. EN Hero の文言調整（ブランドタグライン統一＋subtext を日本進出支援文脈へ）
3. 不要な EN サービスページの削除
4. LangSwitch の 404 フォールバック実装
5. `Service.astro` のハードコード文言（「詳しく見る →」）の整理

含まない:

- 日本語版サービス構成の変更
- 新規 EN サービス詳細ページの追加（japan-entry に内包するため不要）
- ブログ記事そのものの多言語1:1対応

## 設計詳細

### 1. EN トップ Service セクション（柱＋内包）

新規コンポーネント `src/components/sections/ServicePillar.astro` を作成し、
`src/pages/en/index.astro` でのみ使用する。日本語トップは従来どおり
`Service.astro` を使う（共有しない）。

レイアウト:

```
SERVICE / 02
────────────────────────────
JAPAN ENTRY SUPPORT
Your dedicated local representative in Japan.

<1段落の説明>

Everything entering Japan requires, under one retainer:
  — Business Development / Sales Representation
  — Company Setup (registration, banking, permits)
  — SNS & Communications
  — AI & Development support

        [ Learn more → ]   → /en/services/japan-entry/
```

- 見出しは既存 `SectionHeading`（sectionNumber="02", sectionLabel="Service"）を流用。
- 柱タイトル・タグライン・説明・内包能力リスト・CTA ラベルを props で受け取る。
- 内包能力には個別リンクを設けない（すべて japan-entry に集約）。
- 既存の `FadeIn` でアニメーション、配色・余白は既存サービスページに合わせる
  （`#0e0e0e` 背景、`border-[#1e1e2e]`、`text-accent` 等）。

データ: `src/i18n/en.ts` に新フィールド `servicePillar` を追加。

```ts
servicePillar: {
  title: 'Japan Entry Support',
  tagline: 'Your dedicated local representative in Japan.',
  description: '<日本進出に必要なものをひとつのリテーナーで包括的に提供する旨>',
  capabilities: [
    'Business Development / Sales Representation',
    'Company Setup (registration, banking, permits)',
    'SNS & Communications',
    'AI & Development support',
  ],
  ctaLabel: 'Learn more',
  ctaHref: '/en/services/japan-entry/',
}
```

型: `src/i18n/types.ts` の `Translations` に `servicePillar?` を **optional** で
追加する（日本語版は持たないため）。既存の `service` フィールドは型互換のため
残す（EN では未使用になるが害はない）。

### 2. EN Hero の文言調整

`src/i18n/en.ts` の `hero` を変更:

- headline をブランドタグライン **"We Make Business Simple."** に統一
  （日本語版と同一）。
  - `headlinePre: 'We Make'`
  - `headlineAccent: 'Business'`
  - `headlinePost: 'Simple.'`
- `subtext` を日本進出支援を柱とする文脈に書き換え
  （例: KCP が現地代理人として営業・会社設立・コミュニケーションまで
  ひとつのリテーナーで引き受ける旨）。

`mvv.mission` 等その他の文言は変更しない。

### 3. 不要 EN ページの削除

- `src/pages/en/services/ai-training.astro` を削除（未コミット）
- `src/pages/en/services/sns.astro` を削除（未コミット）
- EN サービス詳細は `src/pages/en/services/japan-entry.astro` のみ残す。

### 4. LangSwitch の 404 フォールバック

`src/components/layout/LangSwitch.astro` を、現在パスの1:1変換から
**明示プロップ＋フォールバック方式**に変更する。

- `PageLayout` → `Header` → `LangSwitch` に optional プロップ
  `localeSwitchHref?: string` を通す。
- 各ページが対応する相手言語ページの URL を明示的に渡せる。
- 未指定時のデフォルトは **相手言語のホーム**（現在 JA なら `/en/`、
  現在 EN なら `/`）にフォールバックする。

明示指定するページ（1:1対応が確実なもの）:

| ページ | localeSwitchHref |
|---|---|
| `/`（JA home） | `/en/` |
| `/en/`（EN home） | `/` |
| `/blog/`（JA blog index） | `/en/blog/` |
| `/en/blog/`（EN blog index） | `/blog/` |
| `/blog/[slug]`（JA 記事） | `/en/blog/`（相手言語のブログ一覧） |
| `/en/blog/[slug]`（EN 記事） | `/blog/` |

明示指定しない（＝相手言語ホームへフォールバック）ページ:

- JA `/services/it-support/`・`/services/sns/`・`/services/ai-training/` → `/en/`
- EN `/en/services/japan-entry/` → `/`
- JA `/press/*`・`/author/*`・`/blog/tags/*` 等 → `/en/`

これにより、どのページから言語切替しても 404 にならない。

### 5. Service.astro のハードコード文言整理

`src/components/sections/Service.astro` の `詳しく見る →` は日本語固定。
再設計後は EN がこのコンポーネントを使わなくなるため実害は消えるが、
リンクラベルを optional prop（デフォルト「詳しく見る →」）として
受け取れるよう整理しておく（軽微・任意）。

## コンポーネント境界

- `ServicePillar.astro`: EN トップ専用の柱セクション。props（title /
  tagline / description / capabilities[] / ctaLabel / ctaHref）のみに依存し、
  i18n データから値を受け取る。内部実装を変えても消費側に影響しない。
- `LangSwitch.astro`: `locale`・`label`・`localeSwitchHref?` を受け取り、
  リンク先 URL を決定するだけの単機能。フォールバックロジックを内包。
- 既存 `Service.astro`・`Hero.astro` のインターフェースは原則維持
  （Service はラベル prop を追加するのみ）。

## テスト方針

- `.astro` コンポーネントはプロジェクト方針によりユニットテスト対象外。
  手動確認（`npm run dev` / `npm run build`）で代替する。
- `src/utils/` のピュア関数を新設する場合のみ Vitest を追加（本設計では
  純粋関数の新設は想定なし）。
- 確認項目:
  - `npm run build` が成功する（型エラーなし）。
  - EN トップに柱レイアウトが表示され、CTA が japan-entry に飛ぶ。
  - EN Hero が "We Make Business Simple." になっている。
  - 言語切替で 404 が出ない（JA it-support → /en/、EN japan-entry → / 等）。
  - 不要 EN ページが削除されている。
