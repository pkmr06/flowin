# Task 6.3: 時間配分分析実装

**Epic**: Epic 6 - 分析とインサイト
**優先度**: Medium
**推定工数**: 2日

## 概要
優先度別の時間配分を円グラフで表示する。

## 技術要件

```tsx
// apps/web/src/features/analytics/TimeAllocationPie.tsx
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

export function TimeAllocationPie({ data }) {
  const COLORS = {
    high: '#ef4444',
    medium: '#eab308',
    low: '#22c55e',
  };

  return (
    <PieChart width={400} height={400}>
      <Pie data={data} dataKey="minutes" nameKey="priority" cx="50%" cy="50%" outerRadius={80}>
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[entry.priority]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  );
}
```

## 受け入れ基準

- [ ] 高/中/低優先度別の時間円グラフ
- [ ] 実数と割合を表示
- [ ] 推奨配分との比較

## 関連ドキュメント

- `specs/prd.md` - 時間配分分析要件
