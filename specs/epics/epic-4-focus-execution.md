# Epic 4: フォーカス実行モード

## 概要
ユーザーがタスク実行中に集中力を維持できるフォーカスモードと、リアルタイムの進捗トラッキング機能を提供する。

## ビジネス価値
- タスク完了率70%以上の達成に直結
- セッション時間15-20分の実現
- ユーザーの集中力向上と生産性向上を支援

## 成功基準
- フォーカスモード利用率: 60%以上
- タスク完了率: 計画したタスクの70%以上
- 平均実行時間と予想時間の誤差: ±20%以内
- タイマー精度: 誤差1秒以内

## ユーザーストーリー

### US-4.1: タスク開始とタイマー
**As a** ユーザー  
**I want to** タスクの「開始」ボタンをクリックして時間計測を開始したい  
**So that** 実際の作業時間を正確に記録できる

**受け入れ基準:**
- ✅ 各タスクに「開始」ボタン表示
- ✅ クリックでタイマー開始、画面上部に固定表示（FocusBar実装済み）
- ✅ 経過時間をリアルタイム表示（00:00:00形式）
- ✅ 同時に複数タスクを開始できない（useTaskTimer実装済み）

**技術要件:**
- タイマー管理（useTimer hook）
- WebWorkerでバックグラウンド計測
- タイムブロックステータス更新API
- 排他制御（1タスクのみactive）

### US-4.2: フォーカスモード
**As a** ユーザー  
**I want to** 実行中のタスクだけを画面に表示したい  
**So that** 他のタスクに気を取られず集中できる

**受け入れ基準:**
- ✅ フォーカスモード切り替えボタン
- ✅ 実行中タスクを全画面/上部固定表示（FocusMode実装済み）
- ✅ 他のタスクは非表示または最小化
- ✅ ESCキーで通常モードに戻る

**技術要件:**
- フォーカスモードレイアウト
- 全画面表示コンポーネント
- キーボードショートカット
- アニメーション（smooth transition）

### US-4.3: ポモドーロタイマー
**As a** ユーザー  
**I want to** 25分タイマーで適度な休憩を促されたい  
**So that** 長時間作業による疲労を防げる

**受け入れ基準:**
- ✅ 25分経過で休憩提案通知（PomodoroTimer実装済み）
- ✅ 5分休憩のカウントダウン
- ✅ 休憩スキップも可能
- ❌ カスタマイズ可能（設定で変更）（未実装）

**技術要件:**
- ポモドーロタイマーロジック
- ブラウザ通知API
- 休憩時間カウントダウン
- ユーザー設定（作業/休憩時間）

### US-4.4: リアルタイム進捗表示
**As a** ユーザー  
**I want to** 今日のタスクの完了率を視覚的に見たい  
**So that** 進捗状況を一目で把握できる

**受け入れ基準:**
- ✅ 画面上部に進捗バー表示（ProgressTracker実装済み）
- ✅ パーセンテージと完了数/総数を表示
- ✅ 完了タスクは緑色でハイライト
- ✅ リアルタイムで更新

**技術要件:**
- 進捗計算ロジック
- プログレスバーコンポーネント
- リアルタイム更新（楽観的UI）
- カラー: Success green（design-system準拠）

### US-4.5: ステータス更新
**As a** ユーザー  
**I want to** ワンクリックでタスクを「完了」にしたい  
**So that** 素早く次のタスクに移れる

**受け入れ基準:**
- ✅ チェックボックスまたは完了ボタン（TaskItem実装済み）
- ✅ クリックで即座に完了状態に（楽観的更新）
- ✅ 完了時刻を自動記録
- ❌ Undo機能（5秒間）（未実装）

**技術要件:**
- タスク完了API
- 楽観的更新
- Undo機能（タイムアウト付き）
- 完了時刻タイムスタンプ

### US-4.6: 予定時間vs実際時間
**As a** ユーザー  
**I want to** 予定時間と実際時間の比較を見たい  
**So that** 時間見積もりの精度を向上できる

**受け入れ基準:**
- 各タスクに予定/実際時間を表示
- 差分を色分け表示（±20%以内: 緑、超過: 黄/赤）
- 累計の予定vs実際も表示
- グラフやチャートで可視化

**技術要件:**
- 時間比較計算ロジック
- カラーコーディング
- 簡易チャートコンポーネント
- 統計データ集計

## 技術設計

### 状態管理
```typescript
interface FocusState {
  activeTaskId: string | null;
  focusModeEnabled: boolean;
  timerStartedAt: Date | null;
  elapsedSeconds: number;
  pomodoroState: 'work' | 'break' | 'idle';
  pomodoroRemainingSeconds: number;
}

interface ProgressState {
  totalTasks: number;
  completedTasks: number;
  totalPlannedMinutes: number;
  totalActualMinutes: number;
  completionRate: number;
}
```

### タイマー実装
```typescript
// WebWorker timer for accuracy
class TaskTimer {
  start(taskId: string): void
  pause(): void
  resume(): void
  stop(): { taskId: string, elapsedMs: number }
  getElapsed(): number
}

// Pomodoro timer
class PomodoroTimer {
  startWork(duration: number): void
  startBreak(duration: number): void
  onComplete(callback: () => void): void
  skip(): void
}
```

### API エンドポイント
```typescript
executionRouter = {
  startTask: mutation<{ taskId: string }, TimeBlock>
  pauseTask: mutation<{ taskId: string }, TimeBlock>
  completeTask: mutation<{ taskId: string, actualMinutes: number }, Task>
  getProgress: query<{ planId: string }, ProgressState>
}
```

### UI コンポーネント
- `FocusBar` - フォーカスモードヘッダー
- `TaskTimer` - タイマー表示
- `ProgressBar` - 進捗バー
- `PomodoroNotification` - 休憩通知
- `TimeComparisonChart` - 時間比較表示
- `TaskCompletionButton` - 完了ボタン

## 依存関係
- Epic 3: デイリープランニング
- ブラウザ通知API
- WebWorker API

## リスクと対策
- **リスク**: タイマーの精度低下（バックグラウンド時）
  - **対策**: WebWorker使用、サーバー時刻と同期
- **リスク**: 通知がブロックされる
  - **対策**: 通知許可リクエスト、UI内通知の代替
- **リスク**: 長時間作業での疲労
  - **対策**: ポモドーロ推奨、強制休憩提案

## 実装優先度
**Priority: Critical（MVP必須）**

## 推定工数
- 設計・準備: 2日
- タイマー実装: 3日
- フォーカスモードUI: 3日
- 進捗トラッキング: 2日
- テスト・調整: 2日
- **合計: 12日**

## 関連ドキュメント
- `specs/prd.md` - Step 2: 実行モード、Step 3: 進捗確認
- `specs/design-system.md` - フォーカスモードUI
- `specs/data-model.md` - TimeBlock, Task status
