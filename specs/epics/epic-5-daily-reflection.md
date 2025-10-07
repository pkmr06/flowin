# Epic 5: デイリー振り返り

## 概要
1日の終わりにユーザーが成果と学びを振り返り、翌日への改善につなげる振り返り機能を提供する。

## ビジネス価値
- 継続利用率60%（30日後）の達成に貢献
- ユーザーの自己成長と改善サイクルを促進
- セッション時間15-20分の実現（振り返り5分含む）

## 成功基準
- 振り返り完了率: 60%以上（デイリープラン作成者のうち）
- 振り返り入力時間: 平均5分以内
- 翌日への改善点記録率: 80%以上
- 満足度評価の平均: 3.5/5以上

## ユーザーストーリー

### US-5.1: デイリーレビュー開始
**As a** ユーザー  
**I want to** 夕方に振り返り画面への誘導を受けたい  
**So that** 1日の終わりに必ず振り返りができる

**受け入れ基準:**
- ❌ 18時頃にブラウザ通知で誘導（未実装）
- ❌ ダッシュボードに振り返りCTAを表示（未実装）
- ❌ スキップ可能だが翌日も促される（未実装）
- ✅ 振り返り画面へスムーズに遷移（/shutdown実装済み）

**技術要件:**
- スケジュール通知（18:00デフォルト、カスタマイズ可）
- ブラウザ通知API
- 振り返り状態管理
- CTAバナーコンポーネント

### US-5.2: 成果指標の自動表示
**As a** ユーザー  
**I want to** 完了タスク数、総作業時間、達成率を自動表示されたい  
**So that** 客観的に1日を評価できる

**受け入れ基準:**
- ✅ 完了タスク数/計画タスク数を表示（ReflectionForm実装済み）
- ❌ 総作業時間と計画時間の比較（未実装）
- ❌ 優先度別の達成率（未実装）
- ❌ グラフやビジュアルで視覚化（未実装）

**技術要件:**
- 統計データ集計API
- チャートコンポーネント（Recharts）
- パーセンテージ計算ロジック
- カラーコーディング（design-system準拠）

### US-5.3: 今日の学び入力
**As a** ユーザー  
**I want to** 「今日の学び」を自由に記述したい  
**So that** 気づきや成長を言語化できる

**受け入れ基準:**
- ✅ テキストエリアで自由記述（ReflectionForm実装済み）
- ✅ プレースホルダーで入力例を提示
- ✅ 2-3行程度を推奨（rows={3}設定済み）
- ❌ 自動保存機能（未実装）

**技術要件:**
- リッチテキストエリア
- 文字数カウント表示
- 自動保存（debounce 1秒）
- バリデーション（最大500文字）

### US-5.4: 明日への改善点
**As a** ユーザー  
**I want to** 明日への改善点を記録したい  
**So that** 継続的に生産性を向上できる

**受け入れ基準:**
- ✅ 改善点を自由記述（tomorrowPrioritiesフィールド実装済み）
- ❌ 今日の課題から自動提案（未実装）
- ❌ タスク化することも可能（未実装）
- ❌ 翌日のプランニング時に表示（未実装）

**技術要件:**
- テキストエリア
- AI提案機能（将来実装）
- タスク変換ボタン
- 翌日表示ロジック

### US-5.5: 満足度評価
**As a** ユーザー  
**I want to** 1日の満足度を5段階で評価したい  
**So that** 感情的な側面も記録できる

**受け入れ基準:**
- ✅ 1-5の星評価（StarRating実装済み）
- ✅ エネルギーレベル（1-5評価実装済み）
- ❌ 集中品質（悪/普通/良/優秀）（未実装）
- ✅ 評価は任意だが推奨（optional設定済み）

**技術要件:**
- 星評価コンポーネント
- ラジオボタン選択
- 評価データ保存API
- 週次集計への反映

### US-5.6: 翌日タスクの仕込み
**As a** ユーザー  
**I want to** 前日夜に翌日のタスクを仕込みたい  
**So that** 朝のプランニングをスムーズに始められる

**受け入れ基準:**
- 振り返り画面から翌日タスク作成
- 作成したタスクは翌日に表示
- 優先度も設定可能
- 最大3タスクを推奨

**技術要件:**
- タスク作成API（日付指定）
- 翌日タスク一覧取得
- クイック作成UI
- 日付管理ロジック

## 技術設計

### データモデル
```typescript
interface Reflection {
  id: string;
  dailyPlanId: string;
  completedTasksCount: number;
  plannedTasksCount: number;
  totalProductiveMinutes: number;
  satisfactionRating?: number; // 1-5
  biggestAccomplishment?: string;
  improvementNote?: string;
  energyLevel?: 'low' | 'medium' | 'high' | 'peak';
  focusQuality?: 'poor' | 'fair' | 'good' | 'excellent';
  createdAt: Date;
}
```

### API エンドポイント
```typescript
reflectionRouter = {
  create: mutation<CreateReflectionInput, Reflection>
  update: mutation<UpdateReflectionInput, Reflection>
  getByPlanId: query<{ planId: string }, Reflection | null>
  getStats: query<{ planId: string }, DailyStats>
  createNextDayTask: mutation<CreateTaskInput, Task>
}

interface DailyStats {
  completedCount: number;
  plannedCount: number;
  totalMinutes: number;
  completionRate: number;
  priorityBreakdown: {
    high: { completed: number; total: number };
    medium: { completed: number; total: number };
    low: { completed: number; total: number };
  };
}
```

### UI コンポーネント
- `ReflectionView` - 振り返り画面全体
- `DailyStatsCard` - 成果指標カード
- `SatisfactionRating` - 星評価
- `ReflectionForm` - 学びと改善点フォーム
- `NextDayTaskPrep` - 翌日タスク仕込み
- `ReflectionCTA` - 振り返り誘導バナー

## 依存関係
- Epic 4: フォーカス実行モード（統計データ）
- Epic 3: デイリープランニング（翌日タスク）
- ブラウザ通知API

## リスクと対策
- **リスク**: 振り返りがスキップされる
  - **対策**: 適切なタイミング通知、簡潔な入力項目
- **リスク**: 入力が面倒で離脱
  - **対策**: 自動計算、AI提案、最小限の入力
- **リスク**: データの活用不足
  - **対策**: 週次サマリーで集計、改善点を翌日表示

## 実装優先度
**Priority: High（MVP重要機能）**

## 推定工数
- 設計・準備: 1日
- バックエンドAPI: 2日
- フロントエンドUI: 4日
- 統計機能: 2日
- テスト・調整: 1日
- **合計: 10日**

## 関連ドキュメント
- `specs/prd.md` - Step 4: 1日の振り返り
- `specs/design-system.md` - フォームとカードUI
- `specs/data-model.md` - Reflection エンティティ
