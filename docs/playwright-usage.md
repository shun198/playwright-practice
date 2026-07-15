# Playwright usage

学習用途では Docker 必須ではないため、まずローカル実行を基本にします。  
テスト対象として、リポジトリ直下の `app/` に Next.js (TypeScript/React) の問い合わせフォーム、ログイン画面、会員ホームを用意しています。

## 前提

- Node.js 20 以上
- pnpm `11.10.0`（`package.json` の `packageManager` に合わせる）

## セットアップ (ローカル)

リポジトリ root で実行します。

```bash
pnpm install
pnpm exec playwright install --with-deps chromium
```

## テスト実行 (ローカル)

```bash
pnpm test
```

特定ファイルだけ実行する場合:

```bash
pnpm exec playwright test tests/form.spec.ts
```

上記は `playwright.config.js` の `webServer` 設定により、以下を自動で行います。

- Next.js アプリを `http://127.0.0.1:3000` で起動
- `tests/` 配下の Playwright テストを実行
- 完了後にサーバーを終了

## 便利コマンド

### Headed 実行

```bash
pnpm test:headed
```

### UI モード

```bash
pnpm test:ui
```

実行後、`http://localhost:9323` で UI を確認できます。

### レポート表示

```bash
pnpm report
```

## Playwright でできるテスト (具体例)

- フォーム入力/送信: `fill`、`click`、`selectOption` を使ったユーザー操作の再現
- バリデーション: 必須・形式不正・エラーメッセージ表示などの検証
- 画面遷移: `goto`、リンククリック、URL/タイトル検証
- API連携: `page.route` で API をモックしてフロント単体で検証
- 認証あり画面: `storageState` を使ったログイン済み状態の再利用
- ファイル操作: アップロード/ダウンロードの検証
- デバイス差分: モバイルエミュレーションや viewport 切り替え
- ビジュアル回帰: `toHaveScreenshot` で見た目差分チェック
- 回帰調査: trace/screenshot/video 収集で失敗原因を追跡

このリポジトリの `tests/form.spec.ts` では、次の観点を実際にテストしています。

- 初期表示時に完了メッセージが存在しないこと
- 正常入力で送信完了メッセージが表示されること
- 必須項目未入力で送信されないこと
- メール形式不正で送信されないこと
- 連続送信時に最新入力で表示が更新されること

## デバッグ実行

- `pnpm test -- --debug`
- `pnpm exec playwright test tests/form.spec.ts --debug`
- `.vscode/launch.json` の `Playwright: Debug all tests` を使う

## GitHub Pages にテスト結果を公開

`main` ブランチへ push、または Actions の手動実行で、Playwright の HTML レポートを GitHub Pages に公開できます。  
ワークフローは `.github/workflows/playwright-report-pages.yml` です。

### 最初に必要な設定

1. GitHub リポジトリの `Settings` -> `Pages` を開く
2. `Build and deployment` の `Source` は `GitHub Actions` を選択
3. `Actions` の実行権限が有効であることを確認

### 運用イメージ

- テスト成功時: レポートを Pages に公開（最新結果を確認可能）
- テスト失敗時: ワークフローは失敗扱いだが、失敗時点までのレポートは公開
- 公開URL: Actions の `deploy` ジョブ出力 `page_url` から確認

## アプリ構成

- `app/page.tsx`: 練習用フォーム画面
- `app/login/page.tsx`: 認証フロー練習用のログイン画面
- `app/member/home/page.tsx`: ログイン後の会員ホーム
- `app/layout.tsx`: ルートレイアウト
- `tests/form.spec.ts`: フォーム送信の E2E テスト
- `tests/login.spec.ts`: ログインから会員ホームへのE2Eテスト

## 学習の進め方

1. `app/page.tsx` に入力項目やバリデーションを追加する
2. 正常系だけでなく異常系（未入力・形式不正）もテストにする
3. APIモック (`page.route`) のケースを追加する
4. 必要なら `pnpm codegen` でセレクタを確認する
5. 失敗時は `test-results/` と `playwright-report/` を見る
