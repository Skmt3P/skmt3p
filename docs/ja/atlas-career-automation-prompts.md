# Atlas Career Automation Prompts

このファイルは、`bun run resume:ja` で生成した履歴書・職務経歴書データを使い、AtlasでGoogle Sheets / Google Forms作成を補助させるためのプロンプト集です。

## 前提

- 生成コマンド: `bun run resume:ja`
- 生成先: `layers/skmt3p/dist/career-docs/ja/`
- Apps Script:
  - `layers/skmt3p/dist/career-docs/ja/google-apps-script/create-career-sheet.gs`
  - `layers/skmt3p/dist/career-docs/ja/google-apps-script/create-career-form.gs`
- GitHub参照用Apps Script:
  - `layers/skmt3p/docs/ja/google-apps-script/create-career-sheet.gs`
  - `layers/skmt3p/docs/ja/google-apps-script/create-career-form.gs`
- Raw URL:
  - `https://raw.githubusercontent.com/Skmt3P/skmt3p-monorepo/develop/layers/skmt3p/docs/ja/google-apps-script/create-career-sheet.gs`
  - `https://raw.githubusercontent.com/Skmt3P/skmt3p-monorepo/develop/layers/skmt3p/docs/ja/google-apps-script/create-career-form.gs`
- 共有設定、公開設定、回答受付、外部送信は必ず人間が確認する。

## Google Sheetsを作る

```text
このGitHub Raw URLのApps Scriptを使って、
https://raw.githubusercontent.com/Skmt3P/skmt3p-monorepo/develop/layers/skmt3p/docs/ja/google-apps-script/create-career-sheet.gs

Google Apps Scriptで職務経歴管理スプレッドシートを作ってください。

実行前に、作成されるシート構成を確認してください。
共有設定、公開設定、外部送信は変更しないでください。
Google Apps Scriptの実行許可が必要な場合は、何に許可するのかを説明してから止まってください。
```

## Google Formsを作る

```text
このGitHub Raw URLのApps Scriptを使って、
https://raw.githubusercontent.com/Skmt3P/skmt3p-monorepo/develop/layers/skmt3p/docs/ja/google-apps-script/create-career-form.gs

応募用の職務経歴入力フォームを作ってください。

実行前に、フォーム項目、必須項目、説明文を確認してください。
フォームの公開、回答受付、共有設定、メール収集設定は変更しないでください。
Google Apps Scriptの実行許可が必要な場合は、何に許可するのかを説明してから止まってください。
```

## 応募先向けに職務経歴を調整する

```text
求人票の内容を読み、職務経歴シートの経験・スキルから関連度が高いものを抽出してください。

履歴書・職務経歴書の原文を直接上書きせず、提案欄に追記案だけ作ってください。
応募先に合わせて強調すべき経験、弱い箇所、追加確認が必要な情報を分けて整理してください。
個人情報、共有設定、フォーム送信、外部公開は変更しないでください。
```

## 既存シートをレビューする

```text
開いている職務経歴管理スプレッドシートを確認し、提出前に不足している情報を洗い出してください。

公開Resumeにない個人情報や学歴は推測せず、空欄または確認事項として残してください。
変更案は直接上書きせず、提案として別セルまたはコメント相当の欄にまとめてください。
共有設定、公開設定、外部送信は変更しないでください。
```
