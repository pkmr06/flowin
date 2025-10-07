# AGENTS.md

AI Agent（Claude、Cursor、その他のAIツール）がこのリポジトリで作業する際のガイダンス

## 重要な指示

- タスクを実行する際は、実行内容を `@todos` 配下の `todo_*.md` に記録し、実装完了時にチェックを入れてください
- todoはアジャイルの原則に則り、エピック、ユーザーストーリー、タスクに分解して管理してください
- 常に `@todos` 配下の `todo_*.md` の指示に従ってください
- タスクの実装が完了したら、必ずチェックを入れてください
- 利用可能な場合はセマンティック検索やプロジェクト理解ツールを効果的に使用してください

## プロジェクト仕様書

実装前に必ず以下の仕様書を参照してください：

- **PRD（プロダクト要求仕様書）**: `specs/prd.md` - ビジネス目標、ユーザーストーリー、機能要件、UX設計
- **デザインシステム**: `specs/design-system.md` - カラーパレット、タイポグラフィ、コンポーネント設計
- **データモデル**: `specs/data-model.md` - データベーススキーマ、エンティティ関係、検証ルール

### 仕様書参照の重要性

1. **実装前の確認**: 新機能を実装する前に、必ず対応する仕様書のセクションを参照
2. **デザインの一貫性**: `specs/design-system.md` のカラー、フォント、スペーシング定義に厳密に従う
3. **データ整合性**: `specs/data-model.md` の検証ルールと状態遷移を遵守
4. **UX要件**: `specs/prd.md` のユーザーエクスペリエンス要件を満たす

## プロジェクト概要

Flowinは、カレンダーとタスクを一画面で統合し、1日単位で"やるべき仕事だけ"を計画・実行・振り返るためのデイリープランナーです。Google/Outlookカレンダーと双方向同期し、時間ブロッキング（タイムボクシング）を前提に設計されています。

**詳細は `specs/prd.md` を参照してください。**

### コア機能

- **仕事を"今日"に落とす**: 日単位での集中的なプランニング
- **タスク×カレンダー統合**: タスクをドラッグ＆ドロップで日程化。予定に合わせて所要時間を割り当て、カレンダーイベントを自動生成
- **フォーカスモード＋タイマー**: 目の前の1タスクだけを表示、進行タイマーとフローティングの「Focus Bar」で集中を維持。Slackステータス自動連携で"今は手が離せない"を可視化
- **デイリー／ウィークリーの儀式（ガイド付き）**: 朝のプランニング、日中の実行、終業時の「シャットダウン」までをガイド。過剰アサインを避ける設計（既定で計画作業6時間を超えると警告）
- **振り返りと改善**: 日次・週次の振り返りを促進。実績と計画の乖離を可視化し、自己改善を支援
- **AIアシスタント**: 自然言語でタスク追加、スケジュール調整、振り返りをサポート
- **クロスプラットフォーム**: Web、iOS、Android、Mac/Windowsアプリで利用可能

## 開発方針

### 役割と専門知識

Kent Beckのテスト駆動開発（TDD）とTidy First原則を遵守するシニアソフトウェアエンジニアとして、これらの方法論に正確に従って開発を導きます。

### コア開発原則

- 常にTDDサイクルに従う：**レッド → グリーン → リファクタリング**
- 最も単純な失敗テストを最初に記述
- テストをパスするために必要な最小限のコードを実装
- テストがパスした後にのみリファクタリング
- Beckの「Tidy First」アプローチに従い、構造変更と動作変更を分離
- 開発全体を通して高いコード品質を維持

#### TDD方法論ガイダンス

- 機能の小さな増分を定義する失敗するテストから始める
- 動作を表す意味のあるテスト名を使用（例：`shouldSumTwoPositiveNumbers`）
- テストの失敗は明確かつ情報提供的に
- テストをパスするために必要なコードのみを記述
- テストがパスしたらリファクタリングを検討
- 新機能についても同様のサイクルを繰り返し
- 不具合修正時は、まずAPIレベルの失敗するテストを記述し、問題を再現する最小限のテストを記述して両方をパス

#### TIDY FIRSTアプローチ

すべての変更を2つの異なる種類に分類：

1. **構造変更**: 動作を変更せずにコードを再配置（名前変更、メソッド抽出、コード移動）
2. **動作変更**: 実際の機能追加または変更

**重要な原則:**
- 同じコミットに構造変更と動作変更を混在させない
- 両方が必要な場合は、必ず構造変更を先に実行
- 前後にテストを実行し、構造変更が動作に影響しないことを検証

#### コミット規律

以下の場合にのみコミット：
1. すべてのテストがパス
2. すべてのコンパイラ/リンター警告が解決
3. 変更が単一の論理的な作業単位を表現
4. コミットメッセージに構造変更と動作変更のどちらかが明確に記載

大規模で頻度の低いコミットではなく、**小規模で頻度の高いコミット**を採用。

#### コード品質基準

- 重複を徹底的に排除
- 明確な命名と構造
- 依存関係を明示的に
- メソッドを小さく、単一責任に集中
- 状態と副作用を最小限に抑制
- 可能な限りシンプルなソリューションを使用

## 技術アーキテクチャ

**Better-T-Stack** をベースとしたTurborepoモノレポ構成のフルスタックTypeScriptアプリケーション

### プライマリスタック (TypeScript)
- **Web アプリ**: React + TanStack Router + TailwindCSS + shadcn/ui (ポート 3001)
- **モバイルアプリ**: React Native + Expo + NativeWind
- **サーバー**: Hono + tRPC + Better-Auth + Drizzle ORM (ポート 3000)
- **データベース**: SQLite/Cloudflare D1 with Drizzle ORM
- **デプロイ**: Cloudflare Workers via Wrangler
- **デスクトップ**: Tauri サポート

**パッケージマネージャー**: Bun (bun@1.2.10)

### セカンダリスタック (Python - 実験的)
- **API**: FastAPI + SQLModel + SQLite (`backend/`)
- **Python環境**: uvパッケージマネージャーと仮想環境

### デザインシステム
- **基準**: shadcn/uiベースの淡いニュートラルデザイン
- **ベースカラー**: Neutral 100 (`#f5f5f5`) - 淡く落ち着いた配色
- **ブランドカラー**: Blue 500 (`#3b82f6`) - 落ち着いたブルー
- **フォント**: Inter Variable + Noto Sans JP（日本語最適化）
- **仕様書**: `specs/design-system.md`
- **必須遵守**: すべてのUI/UX実装は上記デザインシステムに厳密に従う

## 開発コマンド

### メインコマンド (ルートから実行)
```bash
bun dev          # 全アプリケーションを同時起動
bun build        # 全アプリケーションをビルド
bun check-types  # 全アプリのTypeScriptタイプチェック
```

### アプリ別コマンド
```bash
bun dev:web      # Webアプリのみ起動 (Vite dev server)
bun dev:server   # サーバーのみ起動 (Wrangler dev)
bun dev:native   # React Native/Expo dev server起動
```

### データベースコマンド
```bash
bun db:push      # スキーマ変更をデータベースにプッシュ
bun db:studio    # Drizzle Studio データベースUI起動
bun db:generate  # データベースマイグレーション生成
bun db:migrate   # データベースマイグレーション実行
```

### プラットフォーム固有コマンド

**Web (`apps/web`)**:
```bash
cd apps/web && bun desktop:dev    # Tauri デスクトップアプリ開発モード
cd apps/web && bun desktop:build  # Tauri デスクトップアプリビルド
cd apps/web && bun deploy         # Cloudflare Pages にデプロイ
```

**Server (`apps/server`)**:
```bash
cd apps/server && bun deploy      # Cloudflare Workers にデプロイ
cd apps/server && bun cf-typegen  # Cloudflare bindings types 生成
```

**Native (`apps/native`)**:
```bash
cd apps/native && bun android     # Android で実行
cd apps/native && bun ios         # iOS で実行
```

## プロジェクト構造

### モノレポ構造
```
apps/
├── web/         # React フロントエンド (TanStack Router, shadcn/ui)
├── server/      # Hono バックエンド (tRPC API, Better-Auth, Drizzle)
└── native/      # React Native モバイルアプリ (Expo)

specs/           # プロジェクト仕様書
├── prd.md              # プロダクト要求仕様書（PRD）
├── design-system.md    # デザインシステム仕様
└── data-model.md       # データモデル仕様
```

### 主要技術
- **型安全性**: tRPCによるフルスタックTypeScript型安全性
- **認証**: Better-Auth によるセッション管理
- **データベース**: ローカル開発用SQLite、本番用Cloudflare D1
- **状態管理**: TanStack Query によるデータフェッチング/キャッシング
- **スタイリング**: TailwindCSS (web), NativeWind (mobile)
- **ビルドシステム**: Turborepo によるモノレポ管理

### 重要ファイル
- `turbo.json` - Turborepo タスク設定
- `bts.jsonc` - Better-T-Stack 設定
- `apps/server/src/index.ts` - サーバーエントリーポイント
- `apps/web/src/main.tsx` - Webアプリエントリーポイント
- `apps/server/src/db/schema/` - データベーススキーマ定義
- `apps/web/src/routes/` - TanStack Router によるファイルベースルーティング

### 開発ノート
- データベースはD1互換性のためWrangler経由でローカル実行
- 全アプリで共有tRPC型を使用してAPI通信
- Better-AuthによるWebとモバイル間の認証処理
- Turborepoが依存関係順にビルドキャッシュとタスク実行を管理

## 重要な指示

### デザインシステム遵守
- **厳格遵守**: `specs/design-system.md` の仕様に厳密に従う
- **カラーパレット**:
  - ベースカラー: Neutral 100 (`#f5f5f5`) メインベース
  - プライマリ: Blue 500 (`#3b82f6`) ブランドカラー
  - セカンダリ: Neutral 100 (`#f5f5f5`)
  - セマンティック: Success/Warning/Destructive/Info（`specs/design-system.md` 参照）
- **タイポグラフィ**:
  - フォント: Inter Variable + Noto Sans JP
  - タイプスケール: 12px〜48px（`specs/design-system.md` 参照）
  - 行間: 1.5（relaxed）をデフォルト
- **スペーシング**: 4pxベースのスペーシングスケール（0/4/8/12/16/24/32/40/48/64/80/96px）
- **ボーダー半径**: sm(2px)/md(6px)/lg(8px)/xl(12px)/2xl(16px)
- **アニメーション**: duration (150ms/250ms/350ms) と easing (in/out/in-out/spring)

### デザイン原則（`specs/design-system.md` より）
1. **Simplicity at Scale**: クリーンで雑音のないインターフェース
2. **可読性優先**: 日本語と英語の混在テキストでも読みやすい
3. **集中をサポート**: 淡いニュートラルカラーで視覚的ストレスを軽減
4. **一貫性**: すべてのコンポーネントで統一されたスタイル

### ファイル作成について
- **作成禁止**: 絶対に必要でない限り新しいファイルを作成しない
- **編集優先**: 既存ファイルの編集を常に優先する
- **ドキュメント**: プロアクティブにREADMEやドキュメントファイル（*.md）を作成しない。ユーザーから明示的に要求された場合のみ作成

### 実行内容
- 要求されたこと以上でも以下でもなく、正確に実行する
- 不要な追加機能や改善提案は行わない
- シンプルで直接的なソリューションを提供する

## AIツール別の推奨事項

### Claude Code / Claude
- `/sc:load` でプロジェクトコンテキストをロード
- `/sc:save` で作業状態を保存
- Serena MCP を活用したセマンティック検索
- Sequential Thinking MCP で複雑な問題を段階的に分析

### Cursor
- `@specs/` でファイルを参照
- Composer モードで複数ファイルの同時編集
- `.cursorrules` ファイルがある場合はそれに従う

### GitHub Copilot
- インラインサジェストでコード補完
- チャットで仕様書の内容を確認
- `@workspace` で全体コンテキストを参照

### その他のAIツール
- プロジェクト仕様書（`specs/` ディレクトリ）を必ず参照
- TDD原則とTidy Firstアプローチを遵守
- デザインシステムに厳密に従う
