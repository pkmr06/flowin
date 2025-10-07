# Task 5.3: 振り返りUI実装

**Epic**: Epic 5 - デイリー振り返り
**優先度**: High
**推定工数**: 3日

## 概要
満足度評価、振り返り入力フォームを実装する。

## 技術要件

```tsx
// apps/web/src/features/reflection/ReflectionForm.tsx
import { useForm } from 'react-hook-form';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function ReflectionForm({ plan, onComplete }) {
  const form = useForm();

  const onSubmit = (data) => {
    createReflection.mutate({
      dailyPlanId: plan.id,
      satisfactionRating: data.rating,
      achievements: data.achievements,
      challenges: data.challenges,
      learnings: data.learnings,
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block mb-2">今日の満足度</label>
        <StarRating value={form.watch('rating')} onChange={(v) => form.setValue('rating', v)} />
      </div>

      <div>
        <label>達成できたこと</label>
        <Textarea {...form.register('achievements')} rows={3} />
      </div>

      <div>
        <label>課題や困難</label>
        <Textarea {...form.register('challenges')} rows={3} />
      </div>

      <div>
        <label>学んだこと</label>
        <Textarea {...form.register('learnings')} rows={3} />
      </div>

      <Button type="submit" className="w-full">振り返りを保存</Button>
    </form>
  );
}
```

## 受け入れ基準

- [ ] 星5段階評価が表示
- [ ] テキストエリアで振り返り入力
- [ ] 保存ボタンで送信
- [ ] 自動保存機能

## 関連ドキュメント

- `specs/design-system.md` - フォームUI仕様
