# 会社案内資料請求フォーム 設置手順

会社案内ダウンロードページのURLを自動返信メールで送るための Google Form + Apps Script の設置手順。

## 1. Google Form の作成

1. https://docs.google.com/forms/ で新規フォームを作成。タイトル「会社案内資料のご請求 | 株式会社KCP」
2. 設定タブ → 回答 → 「メールアドレスを収集する」を **「確認済み」または「回答者からの入力」** に設定（必須）
3. 質問を追加（いずれも任意回答で可）:
   - 「会社名」（記述式）
   - 「お名前」（記述式）
4. 設定タブ → プレゼンテーション → 確認メッセージに以下を設定:

   > ご請求ありがとうございます。ご入力いただいたメールアドレス宛に、資料ダウンロードのご案内をお送りしました。数分経っても届かない場合は迷惑メールフォルダをご確認のうえ、お問い合わせフォームよりご連絡ください。

## 2. Apps Script の設置

1. フォーム編集画面右上の「︙」→「スクリプト エディタ」を開く
2. 以下のスクリプトを貼り付けて保存:

```js
const DOWNLOAD_URL = 'https://kcp.co.jp/download/company-profile-8acbfc84/';

function onFormSubmit(e) {
  const email = e.response.getRespondentEmail();
  if (!email) return;

  const subject = '【株式会社KCP】会社案内資料のご案内';
  const body = [
    'この度は株式会社KCPの会社案内資料をご請求いただき、誠にありがとうございます。',
    '',
    '以下のURLよりダウンロードいただけます。',
    DOWNLOAD_URL,
    '',
    'ご不明な点がございましたら、お気軽にお問い合わせください。',
    'https://kcp.co.jp/#contact',
    '',
    '――――――――――――――――',
    '株式会社KCP',
    'https://kcp.co.jp',
  ].join('\n');

  MailApp.sendEmail(email, subject, body, { name: '株式会社KCP' });
}
```

3. エディタ左メニュー「トリガー」→「トリガーを追加」:
   - 実行する関数: `onFormSubmit`
   - イベントのソース: 「フォームから」
   - イベントの種類: 「フォーム送信時」
4. 保存時に Google アカウントの承認を求められるので許可する

## 3. 動作確認

1. フォームのプレビューから自分のメールアドレスでテスト送信
2. 自動返信メールが届き、記載URLからPDFがダウンロードできることを確認
3. 迷惑メールフォルダに入る場合があるため、件名・本文を大きく変えないこと

## 4. サイトへの反映

フォームの「送信」→ リンクアイコンから公開URLを取得し、`src/pages/index.astro` の
`downloadFormUrl` に設定する（実装済みの場合は差し替え）。

## 運用メモ

- 登録されたメールアドレスはフォームに紐づくスプレッドシートに自動蓄積される（メルマガ等に利用可）
- PDF を差し替える場合は `public/documents/kcp-company-profile-8acbfc84.pdf` を同名で上書きすれば URL は変わらない
- LINE 登録者には `DOWNLOAD_URL` をそのまま送付すればよい
