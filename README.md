# playwright-practice

Next.js のシンプルな問い合わせフォームを対象に、Playwright で E2E テストを学ぶためのリポジトリです。

## 前提

- Node.js `24.14.0`（`package.json` の `engines` / `volta` に合わせる）
- npm

## セットアップ

```bash
npm install
npx playwright install --with-deps chromium
```

## テスト実行方法

### 全テストを実行

```bash
npm run test
```

### 特定ファイルのみ実行

```bash
npx playwright test tests/form.spec.ts
```

### Headed 実行（ブラウザを表示）

```bash
npm run test:headed
```

### UI Mode で実行

```bash
npm run test:ui
```

- UI は `http://localhost:9323` で開けます
- 左ペインでテストを選んで個別実行できます
- 失敗時はステップごとのログ、スクリーンショット、トレースを確認できます
- 要素セレクタやアサーションの調整をしながら再実行できるので、学習用途に便利です

### HTML レポート表示

```bash
npm run report
```

## 現在あるテスト（`tests/form.spec.ts`）

1. サンクスページへ遷移できる
2. 初期表示では完了メッセージが出ていない
3. フォーム送信後に完了メッセージが表示される
4. 必須項目（名前）が空だと送信されない
5. メール形式が不正だと送信されない
6. 連続送信すると最新の名前でメッセージが更新される
7. 利用規約の同意チェックが未選択だと送信されない
8. お問い合わせ種別（ラジオボタン）が未選択だと送信されない

## 追加したテスト（`tests/error.spec.ts`）

1. エラーメッセージが表示される
2. エラーページからフォームページに戻れる

## API テスト（`tests/api-contact.spec.ts`）

1. 必須項目不足で `400` を返す
2. 不正メール形式で `400` を返す
3. サーバーエラー時に `500` を返す

## プロジェクト構成（主要ファイル）

- `app/page.tsx`: フォーム画面
- `app/thanks/page.tsx`: ページ遷移確認用のサンクス画面
- `app/error/page.tsx`: エラー画面
- `app/api/contact/route.ts`: 問い合わせAPI（400/500検証用）
- `tests/form.spec.ts`: フォームの E2E テスト
- `tests/error.spec.ts`: エラー画面の E2E テスト
- `tests/api-contact.spec.ts`: API ステータス検証テスト
- `playwright.config.js`: Playwright 設定（`webServer` 含む）

