# Epic 6: 分析とインサイト

## 概要
週次・月次のデータを可視化し、ユーザーが生産性パターンを理解して改善に活かせる分析機能を提供する。

## ビジネス価値
- ユーザー継続率60%（30日後）の向上に貢献
- データドリブンな自己改善を促進
- プレミアム機能の基盤構築

## 成功基準
- 週次サマリー閲覧率: 50%以上
- インサイトの有用性評価: 4.0/5以上
- 改善行動への転換率: 30%以上
- グラフ表示速度: 500ms以内

## ユーザーストーリー

### US-6.1: 週次サマリー
**As a** ユーザー  
**I want to** 過去1週間の生産性動向をグラフで見たい  
**So that** 週単位でのパフォーマンスを把握できる

**受け入れ基準:**
- ✅ 週の完了タスク数の推移グラフ（WeeklySummaryCard実装済み）
- ❌ 日別の作業時間棒グラフ（未実装）
- ❌ 週間平均と比較（未実装）
- ❌ 前週比の増減表示（未実装）

**技術要件:**
- 週次集計API
- Recharts による可視化
- 比較計算ロジック
- キャッシング戦略

### US-6.2: 完了率推移
**As a** ユーザー  
**I want to** 日別のタスク完了率をトレンドで見たい  
**So that** 生産性の変化を把握できる

**受け入れ基準:**
- ✅ 7日間/30日間の完了率ライングラフ（CompletionTrendChart実装済み）
- ❌ 平均完了率ライン表示（未実装）
- ❌ ピーク日とボトム日のハイライト（未実装）
- ❌ トレンド分析（上昇/横ばい/下降）（未実装）

**技術要件:**
- 完了率計算API
- トレンド分析ロジック
- ラインチャート
- 統計的指標表示

### US-6.3: 時間配分分析
**As a** ユーザー  
**I want to** 優先度別の時間配分を円グラフで見たい  
**So that** 重要なタスクに十分時間を使えているか確認できる

**受け入れ基準:**
- ✅ 高/中/低優先度別の時間円グラフ（TimeAllocationPie実装済み）
- ✅ 実数と割合を表示
- ❌ 推奨配分との比較（未実装）
- ❌ 改善提案の表示（未実装）

**技術要件:**
- 時間配分集計API
- パイチャート
- 推奨値との差分計算
- アラート表示

### US-6.4: 生産性パターン発見
**As a** ユーザー  
**I want to** 自分の生産性パターンを発見したい  
**So that** 最適な働き方を見つけられる

**受け入れ基準:**
- ❌ 最も生産的な曜日/時間帯を表示（未実装）
- ⚠️ エネルギーレベルと完了率の相関（SatisfactionTrendChart実装済み、相関分析未実装）
- ⚠️ 満足度と生産性の関係（データ収集中、分析未実装）
- ❌ パーソナライズされたインサイト（未実装）

**技術要件:**
- 相関分析ロジック
- パターン検出アルゴリズム
- インサイト生成エンジン
- 自然言語での提示

### US-6.5: 長期トレンド
**As a** ユーザー  
**I want to** 月次・四半期のトレンドを見たい  
**So that** 長期的な成長を実感できる

**受け入れ基準:**
- ❌ 月次サマリーの表示（未実装）
- ❌ 3ヶ月/6ヶ月のトレンド（未実装）
- ❌ 目標達成度の可視化（未実装）
- ❌ マイルストーンの記録（未実装）

**技術要件:**
- 長期集計API
- トレンドライン
- 目標設定機能
- マイルストーン管理

### US-6.6: データエクスポート
**As a** ユーザー  
**I want to** データをCSV/JSON形式でエクスポートしたい  
**So that** 外部ツールで分析できる

**受け入れ基準:**
- タスクデータのCSVエクスポート
- 振り返りデータのJSONエクスポート
- 統計データの一括ダウンロード
- GDPR準拠のデータポータビリティ

**技術要件:**
- エクスポートAPI
- CSV/JSON生成ロジック
- ダウンロードトリガー
- データプライバシー準拠

## 技術設計

### 分析データモデル
```typescript
interface WeeklySummary {
  userId: string;
  weekStartDate: Date;
  totalTasks: number;
  completedTasks: number;
  totalMinutes: number;
  averageCompletionRate: number;
  dailyBreakdown: {
    date: Date;
    tasks: number;
    completed: number;
    minutes: number;
  }[];
}

interface ProductivityInsight {
  userId: string;
  type: 'pattern' | 'recommendation' | 'milestone';
  title: string;
  description: string;
  data: Record<string, any>;
  createdAt: Date;
}

interface TimeAllocation {
  high: number;    // minutes
  medium: number;
  low: number;
  total: number;
  recommended: {
    high: number;  // percentage
    medium: number;
    low: number;
  };
}
```

### API エンドポイント
```typescript
analyticsRouter = {
  getWeeklySummary: query<{ startDate: Date }, WeeklySummary>
  getCompletionTrend: query<{ days: number }, TrendData[]>
  getTimeAllocation: query<{ startDate: Date, endDate: Date }, TimeAllocation>
  getInsights: query<void, ProductivityInsight[]>
  exportData: mutation<{ format: 'csv' | 'json', type: string }, Blob>
}
```

### 分析ロジック
```typescript
class AnalyticsEngine {
  calculateWeeklySummary(userId: string, weekStart: Date): WeeklySummary
  detectProductivityPattern(userId: string): ProductivityInsight[]
  analyzeTrend(data: DailyStats[]): TrendAnalysis
  calculateCorrelation(x: number[], y: number[]): number
  generateRecommendations(userData: UserAnalytics): Recommendation[]
}
```

### UI コンポーネント
- `AnalyticsDashboard` - 分析ダッシュボード全体
- `WeeklySummaryCard` - 週次サマリー
- `CompletionTrendChart` - 完了率推移グラフ
- `TimeAllocationPie` - 時間配分円グラフ
- `InsightCard` - インサイトカード
- `ExportDataButton` - エクスポートボタン

## 依存関係
- Epic 5: デイリー振り返り（統計データ）
- Recharts（グラフライブラリ）
- 統計計算ライブラリ

## リスクと対策
- **リスク**: 大量データでのパフォーマンス低下
  - **対策**: 集計データのキャッシング、ページネーション
- **リスク**: インサイトが的外れ
  - **対策**: ユーザーフィードバック収集、アルゴリズム改善
- **リスク**: プライバシー懸念
  - **対策**: データ匿名化、GDPR完全準拠

## 実装優先度
**Priority: Medium（MVPでは基本機能のみ）**

## 段階的実装
**Phase 1（MVP）:**
- 週次サマリー
- 完了率推移
- 基本的な時間配分

**Phase 2（Post-MVP）:**
- 生産性パターン発見
- パーソナライズドインサイト
- 長期トレンド分析

**Phase 3（Premium）:**
- AI駆動の推奨事項
- 高度な相関分析
- カスタムレポート

## 推定工数
**Phase 1（MVP）:**
- 設計・準備: 2日
- バックエンド集計: 3日
- フロントエンドグラフ: 4日
- テスト・調整: 2日
- **小計: 11日**

**Phase 2（Post-MVP）:**
- パターン検出: 3日
- インサイト生成: 3日
- UI拡張: 2日
- **小計: 8日**

**Phase 3（Premium）:**
- AI統合: 5日
- 高度な分析: 4日
- カスタムレポート: 3日
- **小計: 12日**

## 関連ドキュメント
- `specs/prd.md` - データ可視化機能
- `specs/design-system.md` - グラフとチャートUI
- `specs/data-model.md` - 統計データ構造
