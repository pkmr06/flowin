# データモデル仕様書: Flowin

## コアエンティティ

### User（ユーザー）
**目的**: カレンダーアカウントと個人設定を持つシステムユーザー

**フィールド**:
- `id`: UUID（主キー）
- `email`: String、OAuth認証からの一意識別子
- `name`: String、OAuthプロバイダーからの表示名
- `avatar_url`: String、OAuthプロバイダーからのプロフィール画像
- `timezone`: String、IANAタイムゾーン（例: "Asia/Tokyo"）
- `daily_capacity_hours`: Integer、設定可能な作業時間（2-16、デフォルト6）
- `created_at`: Timestamp
- `updated_at`: Timestamp

**リレーションシップ**:
- 1対多: CalendarAccount（カレンダーアカウント）
- 1対多: Task（タスク）
- 1対多: DailyPlan（デイリープラン）
- 1対多: Reflection（振り返り）

**検証ルール**:
- メールアドレスは有効な形式である必要がある
- 日次作業時間: 2 ≤ 値 ≤ 16（Flowinは6時間をデフォルト推奨）
- タイムゾーンは有効なIANAタイムゾーン文字列である必要がある

### CalendarAccount（カレンダーアカウント）
**目的**: 接続された外部カレンダーサービス（Google/Microsoft）

**フィールド**:
- `id`: UUID（主キー）
- `user_id`: UUID、Userへの外部キー
- `provider`: Enum ('google', 'microsoft')
- `provider_account_id`: String、外部アカウントID
- `access_token`: 暗号化String、OAuthアクセストークン
- `refresh_token`: 暗号化String、OAuthリフレッシュトークン
- `expires_at`: Timestamp、トークン有効期限
- `calendar_id`: String、プロバイダーからのプライマリカレンダーID
- `webhook_id`: String、通知WebhookID
- `last_sync_at`: Timestamp、最後の同期成功時刻
- `sync_token`: String、増分同期トークン
- `is_active`: Boolean、同期有効化フラグ
- `created_at`: Timestamp
- `updated_at`: Timestamp

**リレーションシップ**:
- 多対1: User
- 1対多: CalendarEvent（カレンダーイベント）

**検証ルール**:
- プロバイダーは'google'または'microsoft'である必要がある
- ユーザーは各プロバイダーにつき最大1アカウントを持つことができる
- トークンは保存時に暗号化される必要がある

### Task（タスク）
**目的**: タイムブロックにスケジュール可能な作業項目

**フィールド**:
- `id`: UUID（主キー）
- `user_id`: UUID、Userへの外部キー
- `title`: String、タスク名（1-200文字）
- `description`: Text、任意の詳細説明
- `estimated_duration_minutes`: Integer、完了予想時間（15-480分）
- `priority`: Enum ('high', 'medium', 'low')
- `status`: Enum ('pending', 'in_progress', 'completed', 'cancelled')
- `completed_at`: Timestamp、タスク完了時刻
- `created_at`: Timestamp
- `updated_at`: Timestamp

**リレーションシップ**:
- 多対1: User
- 1対多: TimeBlock（タイムブロック）

**検証ルール**:
- タイトル長: 1 ≤ 長さ ≤ 200
- 予想所要時間: 15 ≤ 分 ≤ 480（15分〜8時間）
- 優先度は有効なEnum値である必要がある
- status = 'completed'の場合、completed_atが必須

**状態遷移**:
- pending → in_progress → completed
- pending → cancelled
- in_progress → cancelled
- completed/cancelledからの遷移は不可

### CalendarEvent（カレンダーイベント）
**目的**: Google/Outlookカレンダーからの外部予定

**フィールド**:
- `id`: UUID（主キー）
- `calendar_account_id`: UUID、CalendarAccountへの外部キー
- `provider_event_id`: String、外部イベントID
- `title`: String、イベント件名/タイトル
- `description`: Text、イベント説明
- `start_time`: タイムゾーン付きTimestamp
- `end_time`: タイムゾーン付きTimestamp
- `is_all_day`: Boolean、終日イベントフラグ
- `attendees`: JSON配列、参加者情報
- `location`: String、イベント場所
- `is_deleted`: Boolean、同期用の論理削除
- `last_modified`: Timestamp、プロバイダーからの最終更新時刻
- `sync_version`: String、プロバイダーのバージョン/etag
- `created_at`: Timestamp
- `updated_at`: Timestamp

**リレーションシップ**:
- 多対1: CalendarAccount

**検証ルール**:
- 開始時刻は終了時刻より前である必要がある（終日イベント除く）
- プロバイダーイベントIDはカレンダーアカウント内で一意
- 参加者は有効なJSON配列である必要がある

### TimeBlock（タイムブロック）
**目的**: 特定のタスクのための時間割り当て

**フィールド**:
- `id`: UUID（主キー）
- `task_id`: UUID、Taskへの外部キー
- `daily_plan_id`: UUID、DailyPlanへの外部キー
- `start_time`: タイムゾーン付きTimestamp
- `end_time`: タイムゾーン付きTimestamp
- `actual_duration_minutes`: Integer、実際の所要時間（NULL可）
- `notes`: Text、実行メモ
- `status`: Enum ('planned', 'active', 'completed', 'overrun')
- `created_at`: Timestamp
- `updated_at`: Timestamp

**リレーションシップ**:
- 多対1: Task
- 多対1: DailyPlan

**検証ルール**:
- 開始時刻は終了時刻より前である必要がある
- 所要時間はタスクの予想時間±50%以内である必要がある
- 同じデイリープラン内の他のタイムブロックと重複不可
- 終了時刻はデイリープランの日付内である必要がある

**状態遷移**:
- planned → active → completed
- planned → active → overrun
- 任意の状態からplannedへ遷移可能（再スケジュール）

### DailyPlan（デイリープラン）
**目的**: ユーザーの1日の完全なスケジュール

**フィールド**:
- `id`: UUID（主キー）
- `user_id`: UUID、Userへの外部キー
- `plan_date`: Date、このプランの対象日
- `total_planned_minutes`: Integer、タイムブロックから計算
- `work_start_time`: Time、希望作業開始時刻
- `work_end_time`: Time、希望作業終了時刻
- `is_finalized`: Boolean、その日のプランをロック
- `created_at`: Timestamp
- `updated_at`: Timestamp

**リレーションシップ**:
- 多対1: User
- 1対多: TimeBlock
- 1対1: Reflection

**検証ルール**:
- プラン日付はユーザーごとに一意
- 計画合計時間 ≤ ユーザーの日次作業時間
- 作業開始時刻は作業終了時刻より前である必要がある
- 確定済みプランは変更不可（確定解除を除く）

### Reflection（振り返り）
**目的**: 1日の終わりのレビューデータ、成果とフィードバックを記録

**フィールド**:
- `id`: UUID（主キー）
- `daily_plan_id`: UUID、DailyPlanへの外部キー
- `completed_tasks_count`: Integer、本日完了したタスク数
- `planned_tasks_count`: Integer、元々計画していたタスク数
- `total_productive_minutes`: Integer、実際の作業時間
- `satisfaction_rating`: Integer、1-5段階の満足度
- `biggest_accomplishment`: Text、本日のハイライト
- `improvement_note`: Text、明日への改善点
- `energy_level`: Enum ('low', 'medium', 'high', 'peak')
- `focus_quality`: Enum ('poor', 'fair', 'good', 'excellent')
- `created_at`: Timestamp

**リレーションシップ**:
- 1対1: DailyPlan

**検証ルール**:
- 満足度評価: 1 ≤ 評価 ≤ 5
- カウントは非負の整数である必要がある
- エネルギーレベルと集中品質は有効なEnumである必要がある

## データベースインデックス

### プライマリインデックス
- すべてのエンティティID（UUID主キー）
- ユーザーメール（一意インデックス）
- CalendarAccount (user_id, provider) 複合一意

### クエリ最適化インデックス
- Task (user_id, status, priority) - タスク一覧用
- CalendarEvent (calendar_account_id, start_time) - カレンダービュー用
- TimeBlock (daily_plan_id, start_time) - デイリータイムライン用
- DailyPlan (user_id, plan_date) - ユーザープラン用

### 同期パフォーマンスインデックス
- CalendarEvent (provider_event_id, last_modified) - 増分同期用
- CalendarAccount (last_sync_at, is_active) - 同期スケジューリング用

## データリレーションシップサマリー

```
User (1) ←→ (M) CalendarAccount (1) ←→ (M) CalendarEvent
User (1) ←→ (M) Task (1) ←→ (M) TimeBlock
User (1) ←→ (M) DailyPlan (1) ←→ (1) Reflection
DailyPlan (1) ←→ (M) TimeBlock
```

## ストレージ要件

**推定サイズ**（1ユーザーあたり年間）:
- タスク: ~1,000レコード × 500バイト = 500KB
- カレンダーイベント: ~2,000レコード × 800バイト = 1.6MB
- タイムブロック: ~2,000レコード × 300バイト = 600KB
- デイリープラン: 365レコード × 200バイト = 73KB
- 振り返り: 365レコード × 1KB = 365KB

**ユーザーあたり年間合計**: ~3.14MB
**10,000ユーザーの場合**: 年間約31GB

## Flowin固有の考慮事項

### 時間ブロッキング設計
- デフォルト計画作業時間を6時間に設定（過剰割り当て防止）
- 6時間を超える計画時に警告を表示
- タイムブロックは15分単位で作成推奨

### フォーカスモード
- `TimeBlock.status = 'active'`は同時に1つのみ
- アクティブなタイムブロックはUI上部に固定表示
- フォーカスバー用のリアルタイムタイマー計算

### デイリー儀式ワークフロー
1. **朝のプランニング**: `DailyPlan`作成、`TimeBlock`配置
2. **実行**: `TimeBlock.status`を'active'→'completed'へ遷移
3. **シャットダウン**: `Reflection`作成、`DailyPlan.is_finalized = true`

### カレンダー双方向同期
- `CalendarEvent`は外部カレンダーから読み取り専用
- `TimeBlock`完了時、対応する`CalendarEvent`を外部カレンダーに作成（将来機能）
- 競合検出: `TimeBlock`と`CalendarEvent`の時間重複チェック

### AI統合ポイント（将来拡張）
- `Task.description`と`Reflection.improvement_note`を分析
- 最適な`TimeBlock`配置の提案
- `Reflection`データから生産性パターンを学習
