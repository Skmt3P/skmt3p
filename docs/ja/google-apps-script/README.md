# Google Sheets / Forms automation

このディレクトリは、履歴書・職務経歴書の内容をGoogle Sheets / Google Formsへ流し込むための補助ファイルです。

## Files

- `create-career-sheet.gs`: 職務経歴管理スプレッドシートを作成するGoogle Apps Script
- `create-career-form.gs`: 応募用Googleフォームを作成するGoogle Apps Script
- `atlas-prompt.md`: Atlas Agentへ渡すプロンプト例

## Atlasで試す手順

1. Google Driveで新しいGoogle Apps Scriptプロジェクトを開く
2. `create-career-sheet.gs` または `create-career-form.gs` の内容を貼り付ける
3. 実行関数として `createCareerSheet` または `createCareerForm` を選ぶ
4. 実行前に、Atlasへ「共有設定や送信は変更しないで」と明示する
5. 作成されたURLを確認し、公開・共有・送信は人間が確認してから行う

## 注意

公開Resumeにない個人情報・学歴は空欄にしています。Apps Script実行後、提出先に合わせて必ず追記・確認してください。
