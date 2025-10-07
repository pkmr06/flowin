# Epic 3: デイリープランニング

## 概要
ユーザーが毎朝5分以内で今日の作業計画を立て、タスクをタイムブロックに配置できるデイリープランニング機能を提供する。

## ビジネス価値
- 平均セッション時間15分以上の達成（プランニング5分含む）
- タスク完了率70%以上に貢献
- ユーザーの時間管理スキル向上を支援

## 成功基準
- プランニング完了時間: 平均5分以内
- デイリープラン作成率: 80%以上（アクティブユーザーのうち）
- 過剰割り当て警告の適切な表示（6時間超）
- タイムブロック配置成功率: 95%以上

## ユーザーストーリー

### US-3.1: 今日のタスク選択
**As a** ユーザー  
**I want to** 全タスクから今日実行するものを選びたい  
**So that** 今日やるべきことを明確にできる

**受け入れ基準:**
- ❌ タスク一覧からチェックボックスで選択（UI未実装）
- ❌ 選択したタスクが「今日のプラン」エリアに移動（UI未実装）
- ❌ ドラッグ＆ドロップでも選択可能（UI未実装）
- ⚠️ 選択済みタスクの合計時間を表示（API実装済み、UI未実装）

**技術要件:**
- デイリープラン作成API
- タスク選択状態管理
- ドラッグ＆ドロップ（dnd-kit）
- 合計時間計算ロジック

### US-3.2: 時間見積もり
**As a** ユーザー  
**I want to** 各タスクの予想実行時間を設定したい  
**So that** 現実的な計画を立てられる

**受け入れ基準:**
- ✅ 15分〜8時間の範囲で設定（バリデーション実装済み）
- ❌ クイックピッカー（15/30/45/60/90/120分）（UI未実装）
- ❌ カスタム時間入力も可能（UI未実装）
- ✅ デフォルトは30分（実装済み）

**技術要件:**
- 時間ピッカーコンポーネント
- バリデーション（15-480分）
- プリセット時間のクイック選択

### US-3.3: タスク順序調整
**As a** ユーザー  
**I want to** ドラッグ＆ドロップで実行順序を調整したい  
**So that** 優先度や作業の流れに合わせて計画できる

**受け入れ基準:**
- ❌ 直感的なドラッグ＆ドロップUI（UI未実装）
- ❌ リアルタイムでプレビュー表示（UI未実装）
- ❌ モバイルでもタッチ操作可能（UI未実装）
- ⚠️ 順序変更を自動保存（API実装済み、UI未実装）

**技術要件:**
- dnd-kit による並べ替え
- タッチデバイス対応
- 楽観的更新

### US-3.4: 作業時間上限警告
**As a** ユーザー  
**I want to** 6時間を超える計画時に警告を受けたい  
**So that** 過剰な割り当てを避けられる

**受け入れ基準:**
- ✅ 合計時間が6時間超で警告表示（ロジック実装済み）
- ❌ 警告は目立つが邪魔にならない（UI未実装）
- ❌ タスクを減らすか時間を調整する提案（UI未実装）
- ❌ 警告を無視して続行も可能（UI未実装）

**技術要件:**
- 合計時間監視ロジック
- 警告トーストコンポーネント
- ユーザー設定（警告閾値変更）

### US-3.5: デイリープラン確定
**As a** ユーザー  
**I want to** プランを確定して実行モードに移りたい  
**So that** 計画から実行にスムーズに移行できる

**受け入れ基準:**
- ⚠️ 「プラン確定」ボタンで状態を固定（API実装済み、UI未実装）
- ❌ 確定後は実行モードに自動遷移（UI未実装）
- ⚠️ 確定後も必要に応じて編集可能（API実装済み、UI未実装）
- ✅ 確定時刻を記録（実装済み）

**技術要件:**
- デイリープラン確定API
- 状態遷移管理
- タイムスタンプ記録

## 技術設計

### データモデル
```typescript
interface DailyPlan {
  id: string;
  userId: string;
  planDate: Date;
  totalPlannedMinutes: number;
  workStartTime: string; // "09:00"
  workEndTime: string; // "18:00"
  isFinalized: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TimeBlock {
  id: string;
  taskId: string;
  dailyPlanId: string;
  startTime: Date;
  endTime: Date;
  actualDurationMinutes?: number;
  notes?: string;
  status: 'planned' | 'active' | 'completed' | 'overrun';
  createdAt: Date;
  updatedAt: Date;
}
```

### API エンドポイント
```typescript
dailyPlanRouter = {
  create: mutation<CreateDailyPlanInput, DailyPlan>
  update: mutation<UpdateDailyPlanInput, DailyPlan>
  finalize: mutation<{ id: string }, DailyPlan>
  getByDate: query<{ date: Date }, DailyPlan | null>
  addTimeBlock: mutation<CreateTimeBlockInput, TimeBlock>
  updateTimeBlock: mutation<UpdateTimeBlockInput, TimeBlock>
  removeTimeBlock: mutation<{ id: string }, void>
}
```

### UI コンポーネント
- `DailyPlanningView` - プランニング画面全体
- `TaskSelector` - タスク選択UI
- `TimeBlockEditor` - タイムブロック編集
- `PlanTimeline` - タイムライン表示
- `OverallocationWarning` - 警告表示
- `PlanFinalizeButton` - 確定ボタン

## 依存関係
- Epic 2: タスク管理基盤
- デザインシステム（タイムライン、ドラッグ＆ドロップ）

## リスクと対策
- **リスク**: タイムブロック配置の複雑さ
  - **対策**: シンプルなUIから始め、段階的に機能追加
- **リスク**: 時間計算の精度
  - **対策**: サーバーサイドでも検証、クライアント側と二重チェック
- **リスク**: ドラッグ＆ドロップのパフォーマンス
  - **対策**: 仮想化、最適化されたライブラリ使用

## 実装優先度
**Priority: Critical（MVP必須）**

## 推定工数
- 設計・準備: 2日
- バックエンドAPI: 3日
- フロントエンドUI: 5日
- テスト・調整: 2日
- **合計: 12日**

## 関連ドキュメント
- `specs/prd.md` - デイリープランニング機能、Step 1
- `specs/design-system.md` - タイムラインUI
- `specs/data-model.md` - DailyPlan, TimeBlock
