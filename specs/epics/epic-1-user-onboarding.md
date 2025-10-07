# Epic 1: ユーザーオンボーディング

## 概要
新規ユーザーがFlowinを初めて使用する際の登録から初回体験までの完全なフローを提供し、即座に価値を実感できるようにする。

## ビジネス価値
- 初回利用のハードルを下げ、ユーザー獲得を促進
- 7日後継続率70%の達成に貢献
- 直感的なUXによりサポート問い合わせ率5%以下を実現

## 成功基準
- 登録完了率: 80%以上
- 初回タスク作成率: 90%以上（登録ユーザーのうち）
- オンボーディング完了時間: 平均3分以内
- 初回セッション後の再訪率: 60%以上

## ユーザーストーリー

### US-1.1: シンプルな登録
**As a** 新規ユーザー  
**I want to** メールアドレスだけで登録したい  
**So that** 煩わしいパスワード設定なしに素早く始められる

**受け入れ基準:**
- ✅ メールアドレス入力フォームが表示される
- ⚠️ マジックリンクが30秒以内にメールで届く（外部サービス依存）
- ✅ マジックリンククリックで自動ログインできる
- ✅ エラーハンドリング（無効なメール、送信失敗など）が適切

**技術要件:**
- Better-Auth のマジックリンク認証
- メール送信サービス統合（Resend or SendGrid）
- セッション管理とトークン検証

### US-1.2: インタラクティブデモ
**As a** 新規ユーザー  
**I want to** 30秒で基本的な使い方を体験したい  
**So that** 実際に使い始める前に価値を理解できる

**受け入れ基準:**
- ✅ 登録後すぐにデモモードに入る
- ✅ タスク追加→優先度設定→開始の基本フローを体験（9ステップ実装済み）
- ✅ スキップ可能で、後から再度見られる
- ⚠️ モバイルでもスムーズに動作（実機テスト要）

**技術要件:**
- インタラクティブツアーライブラリ（Shepherd.js or Driver.js）
- アニメーション: Framer Motion
- ローカルストレージでデモ完了状態を保存

### US-1.3: 初回タスク入力
**As a** 新規ユーザー  
**I want to** 「今日の3つのタスク」を入力したい  
**So that** すぐに価値を実感できる

**受け入れ基準:**
- ⚠️ デモ完了後、タスク入力画面に遷移（画面遷移処理要実装）
- ✅ 3つのタスク入力を促すガイダンス表示
- ✅ フォーカスモードで集中入力できる
- ✅ 自動保存で入力途中のデータも保護（500msデバウンス）

**技術要件:**
- タスク作成API（tRPC mutation）
- リアルタイムバリデーション
- 自動保存（debounce 500ms）
- エラーリカバリー機構

## 技術設計

### データモデル
```typescript
// User onboarding state
interface OnboardingState {
  userId: string;
  currentStep: 'registration' | 'demo' | 'first_tasks' | 'completed';
  demoCompleted: boolean;
  firstTasksCreated: boolean;
  completedAt?: Date;
}
```

### API エンドポイント
- `POST /auth/magic-link` - マジックリンク送信
- `GET /auth/verify/:token` - トークン検証とログイン
- `POST /onboarding/demo-complete` - デモ完了記録
- `POST /tasks/batch-create` - 初回タスク一括作成

### UI コンポーネント
- `RegistrationForm` - メール登録フォーム
- `InteractiveDemo` - デモツアーコンポーネント
- `FirstTasksInput` - 初回タスク入力UI
- `OnboardingProgress` - 進捗インジケーター

## 依存関係
- Better-Auth 認証システム
- メール送信サービス
- タスク管理基盤（Epic 2）

## リスクと対策
- **リスク**: メール到達率の低さ
  - **対策**: 複数のメールプロバイダー対応、SMSオプション検討
- **リスク**: デモが長すぎてスキップされる
  - **対策**: 30秒以内に抑える、スキップしやすいUI
- **リスク**: モバイルでのUX劣化
  - **対策**: モバイルファーストでデザイン、タッチ操作最適化

## 実装優先度
**Priority: Critical（MVP必須）**

## 推定工数
- 設計・準備: 1日
- 実装: 5日
- テスト・調整: 2日
- **合計: 8日**

## 関連ドキュメント
- `specs/prd.md` - Entry Point & First-Time User Experience
- `specs/design-system.md` - UI/UXガイドライン
- `specs/data-model.md` - User, OnboardingState
