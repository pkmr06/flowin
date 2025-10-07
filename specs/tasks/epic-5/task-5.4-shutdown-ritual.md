# Task 5.4: シャットダウン儀式実装

**Epic**: Epic 5 - デイリー振り返り
**優先度**: High
**推定工数**: 3日

## 概要
終業時のシャットダウン儀式（振り返り→明日の準備→完了）を実装する。

## 技術要件

```tsx
// apps/web/src/features/reflection/ShutdownRitual.tsx
export function ShutdownRitual() {
  const [step, setStep] = useState<'reflection' | 'tomorrow' | 'complete'>('reflection');

  return (
    <div className="max-w-2xl mx-auto">
      {step === 'reflection' && (
        <ReflectionForm onComplete={() => setStep('tomorrow')} />
      )}
      {step === 'tomorrow' && (
        <TomorrowPrep onComplete={() => setStep('complete')} />
      )}
      {step === 'complete' && (
        <ShutdownComplete />
      )}
    </div>
  );
}
```

## 受け入れ基準

- [ ] 3ステップのフロー（振り返り→明日→完了）
- [ ] ステップ間で遷移
- [ ] 完了メッセージ表示
- [ ] 翌日のタスク候補を提案

## 関連ドキュメント

- `specs/prd.md` - シャットダウン儀式要件
