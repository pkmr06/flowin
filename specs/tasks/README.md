# Flowin MVP タスク詳細仕様

このディレクトリには、各エピックの実装タスク詳細が含まれています。

## 📋 タスク一覧

### Epic 1: ユーザーオンボーディング（8日）

| タスク | 説明 | 推定工数 |
|--------|------|----------|
| [Task 1.1](./epic-1/task-1.1-magic-link-auth.md) | マジックリンク認証実装 | 2日 |
| [Task 1.2](./epic-1/task-1.2-interactive-demo.md) | インタラクティブデモ実装 | 2日 |
| [Task 1.3](./epic-1/task-1.3-first-tasks-input.md) | 初回タスク入力実装 | 2日 |

**合計**: 3タスク / 6日

### Epic 2: タスク管理基盤（11日）

| タスク | 説明 | 推定工数 |
|--------|------|----------|
| [Task 2.1](./epic-2/task-2.1-task-data-model.md) | タスクデータモデル実装 | 2日 |
| [Task 2.2](./epic-2/task-2.2-task-crud-api.md) | タスクCRUD API実装 | 3日 |
| [Task 2.3](./epic-2/task-2.3-task-list-ui.md) | タスク一覧UI実装 | 2日 |
| [Task 2.4](./epic-2/task-2.4-task-create-edit.md) | タスク作成・編集UI実装 | 2日 |
| [Task 2.5](./epic-2/task-2.5-priority-dnd.md) | 優先度ドラッグ＆ドロップ実装 | 2日 |

**合計**: 5タスク / 11日

### Epic 3: デイリープランニング（12日）

| タスク | 説明 | 推定工数 |
|--------|------|----------|
| [Task 3.1](./epic-3/task-3.1-daily-plan-model.md) | デイリープランデータモデル実装 | 2日 |
| [Task 3.2](./epic-3/task-3.2-daily-plan-api.md) | デイリープランAPI実装 | 3日 |
| [Task 3.3](./epic-3/task-3.3-task-selection-ui.md) | タスク選択UI実装 | 3日 |
| [Task 3.4](./epic-3/task-3.4-plan-summary-warnings.md) | プランサマリーと警告UI実装 | 2日 |
| [Task 3.5](./epic-3/task-3.5-plan-finalize.md) | プラン確定と実行モード遷移実装 | 2日 |

**合計**: 5タスク / 12日

### Epic 4: フォーカス実行モード（12日）

| タスク | 説明 | 推定工数 |
|--------|------|----------|
| [Task 4.1](./epic-4/task-4.1-timer-implementation.md) | タイマー実装 | 3日 |
| [Task 4.2](./epic-4/task-4.2-focus-mode-ui.md) | フォーカスモードUI実装 | 3日 |
| [Task 4.3](./epic-4/task-4.3-pomodoro-timer.md) | ポモドーロタイマー実装 | 2日 |
| [Task 4.4](./epic-4/task-4.4-progress-tracking.md) | 進捗トラッキングUI実装 | 2日 |
| [Task 4.5](./epic-4/task-4.5-task-completion.md) | タスク完了機能実装 | 2日 |

**合計**: 5タスク / 12日

### Epic 5: デイリー振り返り（10日）

| タスク | 説明 | 推定工数 |
|--------|------|----------|
| [Task 5.1](./epic-5/task-5.1-reflection-model.md) | 振り返りデータモデル実装 | 2日 |
| [Task 5.2](./epic-5/task-5.2-reflection-api.md) | 振り返りAPI実装 | 2日 |
| [Task 5.3](./epic-5/task-5.3-reflection-ui.md) | 振り返りUI実装 | 3日 |
| [Task 5.4](./epic-5/task-5.4-shutdown-ritual.md) | シャットダウン儀式実装 | 3日 |

**合計**: 4タスク / 10日

### Epic 6: 分析とインサイト（11日 - Phase 1）

| タスク | 説明 | 推定工数 |
|--------|------|----------|
| [Task 6.1](./epic-6/task-6.1-weekly-summary.md) | 週次サマリー実装 | 3日 |
| [Task 6.2](./epic-6/task-6.2-completion-trend.md) | 完了率推移実装 | 3日 |
| [Task 6.3](./epic-6/task-6.3-time-allocation.md) | 時間配分分析実装 | 2日 |
| [Task 6.4](./epic-6/task-6.4-data-export.md) | データエクスポート実装 | 3日 |

**合計**: 4タスク / 11日

---

## 📊 全体サマリー

- **総タスク数**: 26タスク
- **総推定工数**: 64日
- **エピック数**: 6エピック

## 🎯 実装優先順位

### Phase 1: コア機能（MVP必須）

1. **Epic 2**: タスク管理基盤（11日）
2. **Epic 1**: ユーザーオンボーディング（8日）
3. **Epic 3**: デイリープランニング（12日）
4. **Epic 4**: フォーカス実行モード（12日）
5. **Epic 5**: デイリー振り返り（10日）

**Phase 1 合計**: 53日

### Phase 2: 分析機能

6. **Epic 6**: 分析とインサイト - Phase 1（11日）

**Phase 2 合計**: 11日

## 📝 タスク仕様の構成

各タスクファイルには以下の情報が含まれています：

- **概要**: タスクの目的と範囲
- **技術要件**: 具体的な実装仕様とコード例
- **受け入れ基準**: 完了の定義（チェックリスト形式）
- **依存関係**: 前提となるタスクやライブラリ
- **実装順序**: 推奨される実装ステップ
- **関連ドキュメント**: 参照すべき仕様書

## 🔧 技術スタック

### フロントエンド
- **Framework**: React + TanStack Router
- **UI**: TailwindCSS + shadcn/ui
- **State**: TanStack Query
- **Forms**: React Hook Form + Zod
- **DnD**: @dnd-kit
- **Charts**: Recharts

### バックエンド
- **Runtime**: Hono + Cloudflare Workers
- **API**: tRPC
- **Auth**: Better-Auth
- **ORM**: Drizzle ORM
- **DB**: SQLite/Cloudflare D1
- **Validation**: Zod

### 開発ツール
- **Package Manager**: Bun
- **Monorepo**: Turborepo
- **Testing**: Playwright (E2E), Vitest (Unit)
- **TypeScript**: Full stack type safety

## 📚 関連ドキュメント

- [PRD（プロダクト要求仕様書）](../prd.md)
- [デザインシステム](../design-system.md)
- [データモデル](../data-model.md)
- [エピック一覧](../epics/README.md)
- [CLAUDE.md](../../CLAUDE.md)
- [AGENTS.md](../../AGENTS.md)

## 🚀 開発開始前のチェックリスト

各タスク開始前に確認：

- [ ] 依存するタスクが完了している
- [ ] 仕様書（PRD、デザインシステム、データモデル）を確認
- [ ] 技術スタックと依存ライブラリを確認
- [ ] テスト戦略を定義
- [ ] デザインモックアップを確認（必要に応じて）

## 💡 開発のヒント

### TDD（テスト駆動開発）の遵守

Kent Beckの原則に従い、必ず以下の順序で実装：

1. **レッド**: 失敗するテストを書く
2. **グリーン**: 最小限のコードでテストをパスさせる
3. **リファクタリング**: コードを整理・改善

### Tidy First アプローチ

構造変更と動作変更を分離：

1. **構造変更**: コードの再配置（リファクタリング）
2. **動作変更**: 新機能の追加

**重要**: 同じコミットに混在させない

### コミット規律

- すべてのテストがパス
- リンター警告ゼロ
- 単一の論理的な作業単位
- 明確なコミットメッセージ

## 🎓 学習リソース

- [Better-Auth Documentation](https://better-auth.com)
- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [dnd-kit Documentation](https://docs.dndkit.com)
- [shadcn/ui Documentation](https://ui.shadcn.com)

---

**Last Updated**: 2025-01-15
**Version**: 1.0
