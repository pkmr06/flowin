# Epic 2: タスク管理基盤

## 概要
Flowinの中核となるタスク管理機能を実装し、ユーザーがタスクを追加・編集・削除し、優先度とステータスを管理できるようにする。

## ビジネス価値
- タスク完了率70%以上の達成に貢献
- ユーザーの日次作業効率を向上
- 他の全機能の基盤となる

## 成功基準
- タスク作成成功率: 99%以上
- タスク一覧表示速度: 100ms以内
- タスク編集の即時反映（楽観的更新）
- データ損失率: 0%

## ユーザーストーリー

### US-2.1: タスク作成
**As a** ユーザー  
**I want to** 新しいタスクを簡単に追加したい  
**So that** やるべきことを忘れずに記録できる

**受け入れ基準:**
- ⚠️ 大きな「+」ボタンでタスク作成モーダルを開ける（トリガーボタン要確認）
- ✅ タイトル（必須）、説明（任意）、予想時間、優先度を入力
- ✅ 自動保存機能でデータ損失を防ぐ（ローカルストレージ）
- ❌ キーボードショートカット（Cmd+K）で素早く作成（未実装）

**技術要件:**
- タスク作成API（tRPC mutation）
- フォームバリデーション（Zod）
- 楽観的更新（TanStack Query）
- キーボードショートカット（react-hotkeys-hook）

### US-2.2: タスク一覧表示
**As a** ユーザー  
**I want to** タスクを優先度とステータスでフィルタリングして見たい  
**So that** 今やるべきタスクに集中できる

**受け入れ基準:**
- ✅ 優先度別にソート表示（高→中→低）
- ✅ ステータスフィルター（未着手/進行中/完了）
- ✅ 検索機能でタスクを素早く見つけられる（全文検索実装済み）
- ❌ 仮想スクロールで大量タスクも快適（ペジネーションのみ実装）

**技術要件:**
- タスク一覧取得API（tRPC query）
- フィルター・ソートロジック
- 仮想スクロール（@tanstack/react-virtual）
- 全文検索（クライアントサイド）

### US-2.3: タスク編集・削除
**As a** ユーザー  
**I want to** タスクを編集・削除したい  
**So that** 状況の変化に柔軟に対応できる

**受け入れ基準:**
- ✅ インライン編集またはモーダルで編集（モーダル実装済み）
- ⚠️ 削除前に確認ダイアログ表示（UI確認要）
- ✅ 楽観的更新で即座に反映
- ❌ 編集履歴の保持（将来機能）

**技術要件:**
- タスク更新API（tRPC mutation）
- タスク削除API（tRPC mutation）
- 楽観的更新とロールバック
- 確認ダイアログコンポーネント

### US-2.4: 優先度設定
**As a** ユーザー  
**I want to** タスクに優先度を設定したい  
**So that** 重要なタスクから取り組める

**受け入れ基準:**
- ✅ 3段階の優先度（高/中/低）
- ✅ ビジュアルインジケーター（色・アイコン：🔴🟡🟢）
- ❌ ドラッグ＆ドロップで優先度変更（未実装）
- ✅ デフォルトは「中」

**技術要件:**
- 優先度Enum定義
- ドラッグ＆ドロップ（dnd-kit）
- 優先度別カラー（design-system準拠）

### US-2.5: ステータス管理
**As a** ユーザー  
**I want to** タスクのステータスを更新したい  
**So that** 進捗状況を正確に把握できる

**受け入れ基準:**
- ✅ 3つのステータス（未着手/進行中/完了）+ cancelled
- ✅ ワンクリックで状態遷移（pending⇔completed）
- ✅ 完了時にタイムスタンプ記録
- ✅ 不正な遷移を防ぐバリデーション

**技術要件:**
- ステータス状態遷移ロジック
- 完了時刻の自動記録
- バリデーション（data-model準拠）

## 技術設計

### データモデル
```typescript
interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  estimatedDurationMinutes: number; // 15-480
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// State transitions
// pending → in_progress → completed
// pending → cancelled
// in_progress → cancelled
```

### API エンドポイント
```typescript
// tRPC router
taskRouter = {
  create: mutation<CreateTaskInput, Task>
  update: mutation<UpdateTaskInput, Task>
  delete: mutation<{ id: string }, void>
  list: query<TaskListFilters, Task[]>
  getById: query<{ id: string }, Task>
}
```

### UI コンポーネント
- `TaskList` - タスク一覧コンテナ
- `TaskItem` - 個別タスクアイテム
- `TaskCreateModal` - タスク作成モーダル
- `TaskEditModal` - タスク編集モーダル
- `PriorityBadge` - 優先度表示
- `StatusBadge` - ステータス表示

## 依存関係
- Better-Auth（ユーザー認証）
- Drizzle ORM（データベース）
- TanStack Query（状態管理）

## リスクと対策
- **リスク**: 大量タスクでのパフォーマンス劣化
  - **対策**: 仮想スクロール、ページネーション、インデックス最適化
- **リスク**: 楽観的更新時のデータ不整合
  - **対策**: エラー時の自動ロールバック、再取得メカニズム
- **リスク**: 同時編集による競合
  - **対策**: 楽観的ロック、最終更新時刻チェック

## 実装優先度
**Priority: Critical（MVP必須）**

## 推定工数
- 設計・準備: 2日
- バックエンドAPI: 3日
- フロントエンドUI: 4日
- テスト・調整: 2日
- **合計: 11日**

## 関連ドキュメント
- `specs/prd.md` - タスク管理機能要件
- `specs/design-system.md` - タスクUIコンポーネント
- `specs/data-model.md` - Task エンティティ
