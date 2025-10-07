# Task 6.2: 完了率推移実装

**Epic**: Epic 6 - 分析とインサイト
**優先度**: Medium
**推定工数**: 3日

## 概要
日別のタスク完了率をトレンドグラフで表示する。

## 技術要件

```tsx
// apps/web/src/features/analytics/CompletionTrendChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function CompletionTrendChart({ data }) {
  return (
    <div className="w-full h-64">
      <LineChart data={data} width={600} height={300}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="completionRate" stroke="#3b82f6" />
      </LineChart>
    </div>
  );
}
```

## 受け入れ基準

- [ ] 7日間/30日間の完了率グラフ
- [ ] 平均完了率ライン表示
- [ ] トレンド分析（上昇/横ばい/下降）

## 関連ドキュメント

- `specs/prd.md` - 完了率推移要件
