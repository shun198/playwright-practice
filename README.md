# playwright-practice

Next.js の問い合わせフォーム、ログイン画面、会員ホームを対象に、Playwright で E2E テストを学ぶためのリポジトリです。

## 前提

- Node.js `24.14.0`（`package.json` の `engines` / `volta` に合わせる）
- pnpm `11.10.0`（`package.json` の `packageManager` に合わせる）

## セットアップ

```bash
pnpm install
pnpm exec playwright install --with-deps chromium
```

## テスト実行方法

### 全テストを実行

```bash
pnpm test
```

### 特定ファイルのみ実行

```bash
pnpm exec playwright test tests/form.spec.ts
```

### Headed 実行（ブラウザを表示）

```bash
pnpm test:headed
```

### UI Mode で実行

```bash
pnpm test:ui
```

- UI は `http://localhost:9323` で開けます
- 左ペインでテストを選んで個別実行できます
- 失敗時はステップごとのログ、スクリーンショット、トレースを確認できます
- 要素セレクタやアサーションの調整をしながら再実行できるので、学習用途に便利です

### HTML レポート表示

```bash
pnpm report
```

## 失敗サンプルテスト（`tests/failing.spec.ts`）

意図的に失敗させる学習用テストです。失敗時の証跡（スクリーンショット / 動画 / 注釈付き画像 / APIエラーログ）を確認できます。

```bash
pnpm exec playwright test tests/failing.spec.ts
```

- `tests/helpers/annotated-screenshot.ts`: 赤枠とコメントを重ねた注釈付きスクリーンショットを添付
- `tests/helpers/api-error-collector.ts`: `/api/*` の 4xx/5xx と request failed を JSON 添付
- 通常の CI で使う場合は、`failing.spec.ts` を除外して運用する想定です

## 現在あるテスト（`tests/form.spec.ts`）

1. ログイン画面へ遷移できる
2. 初期表示では完了メッセージが出ていない
3. フォーム送信後に完了メッセージが表示される
4. 必須項目（名前）が空だと送信されない
5. メール形式が不正だと送信されない
6. 連続送信すると最新の名前でメッセージが更新される
7. 利用規約の同意チェックが未選択だと送信されない
8. お問い合わせ種別（ラジオボタン）が未選択だと送信されない

## ログイン導線のテスト（`tests/login.spec.ts`）

1. 有効な認証情報で会員ホームへ遷移できる
2. 無効な認証情報ではエラーを表示してログイン画面に留まる

ログイン画面のテスト用アカウントは `member@example.com` / `playwright` です。ログインAPIとHTTP-only Cookieを使った認証フローの学習用実装であり、実運用の認証には使用しないでください。
セッションの署名鍵は単一プロセスのメモリ上で管理するため、サーバー再起動時にログイン状態は失効します。

## 追加したテスト（`tests/error.spec.ts`）

1. エラーメッセージが表示される
2. エラーページからフォームページに戻れる

## API テスト（`tests/api-contact.spec.ts`）

1. 必須項目不足で `400` を返す
2. 不正メール形式で `400` を返す
3. サーバーエラー時に `500` を返す

## ログインAPIテスト（`tests/api-login.spec.ts`）

1. 有効な認証情報でセッションCookieを発行する
2. 無効な認証情報では `401` を返し、セッションCookieを発行しない

## プロジェクト構成（主要ファイル）

- `app/page.tsx`: フォーム画面
- `app/login/page.tsx`: ログイン画面
- `app/member/home/page.tsx`: ログイン後の会員ホーム
- `app/error/page.tsx`: エラー画面
- `app/api/contact/route.ts`: 問い合わせAPI（400/500検証用）
- `tests/form.spec.ts`: フォームの E2E テスト
- `tests/login.spec.ts`: ログイン導線の E2E テスト
- `tests/error.spec.ts`: エラー画面の E2E テスト
- `tests/api-contact.spec.ts`: API ステータス検証テスト
- `tests/api-login.spec.ts`: ログインAPIの認証・Cookie検証テスト
- `tests/failing.spec.ts`: 失敗時証跡のサンプルテスト（意図的に失敗）
- `tests/helpers/annotated-screenshot.ts`: 注釈付きスクリーンショットヘルパー
- `tests/helpers/api-error-collector.ts`: APIエラー収集ヘルパー
- `playwright.config.js`: Playwright 設定（`webServer` 含む）
