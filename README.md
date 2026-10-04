# CardDock

支払い管理用アプリ。

kakeibo-appのVue画面を独立させたクレカ管理SPAです。Vue 3 / TypeScript / Viteで構成し、LaravelのBladeやPHPを使わずにビルドできます。元画面のデザインを引き継ぎ、サンプルデータを共通Laravel APIへの通信に置き換えています。

## ローカル

次のコマンドで取得し、`household-env/src/credit-card-front` に配置します。

```bash
# household-env から
git clone --branch develop https://github.com/yuuki-sakurai/CardDock.git src/credit-card-front
```

バックエンドは `src/kakeibo`、家計簿画面は `src/kanntan-kakeibo` です。

```bash
# household-env から
docker compose up -d --build
docker compose exec kakeibo-app php artisan migrate --force
```

http://localhost:5175 で開き、家計簿と同じメールアドレス・パスワードでログインします。未登録なら新規登録できます。別ホストで配信したSPA間の自動SSOは行いません。

標準構成はビルド済みの `dist/` をnginxで配信し、ソースをbind mountしません。変更を反映する場合は `household-env` で次を実行します。起動中のnginxコンテナ内ではnpmコマンドを実行できません。

```bash
docker compose build credit-card-front
docker compose up -d --no-deps credit-card-front
```

ホットリロードとコンテナ内での検証には、Node/Viteを使う開発構成へ切り替えます。

```bash
# household-env から
docker compose -f compose.dev.yml up -d --build --remove-orphans
docker compose -f compose.dev.yml exec kakeibo-app composer install
# 未適用のマイグレーションがある場合
docker compose -f compose.dev.yml exec kakeibo-app php artisan migrate
docker compose -f compose.dev.yml exec credit-card-front npm run build

# 標準構成へ戻す
docker compose up -d --build --remove-orphans
```

標準・開発構成は同じDBボリュームを使います。既存のAPP_KEY・DBを維持し、`down -v` や `migrate:fresh` は実行しません。詳細は [環境リポジトリのREADME](https://github.com/yuuki-sakurai/household-env/blob/develop/README.md) を参照してください。

フロント単体で起動する場合:

```bash
npm ci
npm run dev
```

`/api/` は既定で `http://localhost:8080` へプロキシします。変更時は `API_PROXY_TARGET=http://... npm run dev` を使用してください。APIのベースパスは `VITE_API_BASE_URL`（既定 `/api/v1`）で指定します。Viteサーバーは0.0.0.0:5175で待ち受けるため、同じLANのスマホからも接続できます。

## 機能

- 共通アカウントでのログイン・新規登録・ログアウト
- カード・銀行口座の作成と更新（残高は手動入力）
- CSV共通テンプレートの取込、履歴、同一ファイル再送の重複防止
- 月別集計・カテゴリ別集計・利用カレンダー・支払予定
- 利用日・カード・店舗による明細検索、50件ごとのページ切り替え

先にカードを登録し、画面からCSVテンプレートをダウンロードしてください。カード会社固有のCSV形式は未対応です。カテゴリは家計簿と共通で、カテゴリ名は登録済みのものか空欄にします。未登録カテゴリがある場合は全件エラーになり、家計簿CSVのような承認付きカテゴリ追加はありません。家計簿への自動転記・銀行連携・残高の自動引落し、明細の手入力・編集・削除は未対応です。カード番号や口座番号は入力しません。

データとマイグレーションはすべてkakeibo-appにあります。API仕様はそちらの `docs/credit-card-api.md` を参照してください。

## 検証・ビルド

```bash
npm run typecheck
npm run build
```

成果物は `dist/`。画面遷移は `#/home`、`#/transactions`、`#/imports`、`#/cards` のハッシュルーティングで、直接アクセス・再読み込み・戻る操作に対応します。ブラウザーのストレージにパスワードやアクセストークンは保存しません。

## Railwayへの追加（まだデプロイしていません）

このリポジトリのDockerfileで新しいフロントサービスを作り、`BACKEND_HOST` に既存Laravelの公開HTTPSホスト名（スキーム・パスなし）を設定してください。PORTはRailwayが指定する値を使います。nginxが `/api/` をHTTPSでプロキシし、セッションCookieとCSRFを使います。バックエンドのDBとAPP_KEYは既存環境を維持し、新規マイグレーションを実行します。

ローカルComposeはnginx設定だけ差し替え、Dockerネットワーク内でHTTP接続します。リモートリポジトリは [yuuki-sakurai/CardDock](https://github.com/yuuki-sakurai/CardDock) です。

初回分離時の検証: Laravelの全43テスト（421 assertions）、SPAの型チェック・本番ビルド、Dockerの標準／開発用イメージ、両SPAのAPIプロキシ、ブラウザーでログイン・口座／カード保存・CSV取込・明細／集計／履歴・ログアウト、390px幅の表示を確認しました。検証データは削除済みです。

## 文字の共通設定

フォント・サイズ・太さ・行間は `src/typography.css` で定義しています。両SPAで同じ定義を維持してください。[共通タイポグラフィ](docs/typography.md)を参照してください。

## ブランチ運用

- `main`: リリース用の基準ブランチ。
- `develop`: 開発内容の統合先。初回はmainから作成。
- `feature/*`: developから作成する作業ブランチ。今後の変更は作業ブランチで行い、develop宛てにPRを作成します。

不具合修正は `fix/*` など目的に応じた作業ブランチを使い、PRの統合先は同じく `develop` にします。

```bash
git switch develop
git pull --ff-only origin develop
git switch -c feature/<作業名>
```

バックエンドはkakeibo-appのクレカAPIと追加マイグレーションが必要です。フロントエンドのpushだけでは、バックエンドやDBに変更は反映されません。
