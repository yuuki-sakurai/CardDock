# AGENTS.md

このリポジトリはクレカ管理SPAです。Vue 3 Composition APIとTypeScriptを使用してください。

- Laravel APIとDBマイグレーションはkakeibo-appに置く。画面に業務データや認証処理の代替を実装しない。
- API通信はsrc/api.ts、契約の型はsrc/typesへ集約する。
- 家計簿と共通の認証・カテゴリを使い、ユーザー別のデータ分離はバックエンドで必ず検証する。
- CreditCardTransactionとExpenseを自動統合しない。
- サンプルデータを実データとして表示しない。カード会社固有CSVへの対応を実装なしに表示しない。
- モバイル操作、キーボード操作、エラー表示、読み込み状態を維持する。
- 変更時はnpm run typecheckとnpm run buildを実行する。
- .env、秘密情報、node_modules、distはコミットしない。
- mainはリリース用、developは開発の統合先。以降の変更はdevelopから作成したfeature/*作業ブランチで行い、PRはdevelop宛てに作成する。初回登録後の作業ブランチはfeature/credit-card-spa。
- 明示的な依頼なしにpush・リモート作成・本番デプロイを行わない。
