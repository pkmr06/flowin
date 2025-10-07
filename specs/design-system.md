# Flowin デザインシステム

## 概要

Flowinのデザインシステムは、shadcn/uiをベースに、淡く落ち着いたニュートラルトーンを採用したミニマルなデザインです。日本語を含むテキストの可読性を最優先し、長時間の作業でも目に優しいインターフェースを提供します。

## デザイン原則

### 1. Simplicity at Scale
- クリーンで雑音のないインターフェース
- 必要な情報だけを適切なタイミングで表示
- 装飾的な要素は最小限に抑える

### 2. 可読性優先
- 日本語と英語の混在テキストでも読みやすいタイポグラフィ
- 十分なコントラスト比（WCAG AA準拠：4.5:1以上）
- 適切な行間・文字間隔

### 3. 集中をサポート
- 淡いニュートラルカラーで視覚的ストレスを軽減
- 重要な情報にだけアクセントカラーを使用
- タスク実行中は余計な情報を排除

### 4. 一貫性
- すべてのコンポーネントで統一されたスタイル
- 予測可能なインタラクション
- プラットフォーム間での体験の統一

## カラーパレット

### ベースカラー（Neutral）

\`\`\`css
/* Light Mode - ベースカラー */
--background: 0 0% 100%;           /* #ffffff - 背景 */
--foreground: 0 0% 9%;             /* #171717 - 主要テキスト */

--card: 0 0% 100%;                 /* #ffffff - カード背景 */
--card-foreground: 0 0% 9%;        /* #171717 - カードテキスト */

--popover: 0 0% 100%;              /* #ffffff - ポップオーバー背景 */
--popover-foreground: 0 0% 9%;     /* #171717 - ポップオーバーテキスト */

/* Neutral階調 */
--neutral-50: 0 0% 98%;            /* #fafafa */
--neutral-100: 0 0% 96%;           /* #f5f5f5 - メインベース */
--neutral-200: 0 0% 90%;           /* #e5e5e5 */
--neutral-300: 0 0% 83%;           /* #d4d4d4 */
--neutral-400: 0 0% 64%;           /* #a3a3a3 */
--neutral-500: 0 0% 45%;           /* #737373 */
--neutral-600: 0 0% 32%;           /* #525252 */
--neutral-700: 0 0% 25%;           /* #404040 */
--neutral-800: 0 0% 15%;           /* #262626 */
--neutral-900: 0 0% 9%;            /* #171717 */
--neutral-950: 0 0% 4%;            /* #0a0a0a */
\`\`\`

### アクセントカラー

\`\`\`css
/* Primary - ブランドカラー（落ち着いたブルー） */
--primary: 217 91% 60%;            /* #3b82f6 - Blue 500 */
--primary-foreground: 0 0% 100%;   /* #ffffff */

/* Secondary - サポートカラー（ニュートラル） */
--secondary: 0 0% 96%;             /* #f5f5f5 - Neutral 100 */
--secondary-foreground: 0 0% 9%;   /* #171717 */

/* Muted - 控えめな要素 */
--muted: 0 0% 96%;                 /* #f5f5f5 */
--muted-foreground: 0 0% 45%;      /* #737373 */

/* Accent - アクセント要素 */
--accent: 0 0% 96%;                /* #f5f5f5 */
--accent-foreground: 0 0% 9%;      /* #171717 */
\`\`\`

### セマンティックカラー

\`\`\`css
/* Destructive - 削除・警告 */
--destructive: 0 84% 60%;          /* #ef4444 - Red 500 */
--destructive-foreground: 0 0% 100%;

/* Success - 成功・完了 */
--success: 142 71% 45%;            /* #22c55e - Green 500 */
--success-foreground: 0 0% 100%;

/* Warning - 注意 */
--warning: 38 92% 50%;             /* #f59e0b - Amber 500 */
--warning-foreground: 0 0% 100%;

/* Info - 情報 */
--info: 199 89% 48%;               /* #0ea5e9 - Sky 500 */
--info-foreground: 0 0% 100%;
\`\`\`

### ボーダー＆インプット

\`\`\`css
--border: 0 0% 90%;                /* #e5e5e5 - Neutral 200 */
--input: 0 0% 90%;                 /* #e5e5e5 */
--ring: 217 91% 60%;               /* #3b82f6 - Primary */
\`\`\`

### ダークモード

\`\`\`css
/* Dark Mode - ベースカラー */
--background: 0 0% 9%;             /* #171717 */
--foreground: 0 0% 98%;            /* #fafafa */

--card: 0 0% 15%;                  /* #262626 */
--card-foreground: 0 0% 98%;       /* #fafafa */

--popover: 0 0% 9%;                /* #171717 */
--popover-foreground: 0 0% 98%;    /* #fafafa */

--primary: 217 91% 60%;            /* #3b82f6 */
--primary-foreground: 0 0% 98%;    /* #fafafa */

--secondary: 0 0% 15%;             /* #262626 */
--secondary-foreground: 0 0% 98%;  /* #fafafa */

--muted: 0 0% 15%;                 /* #262626 */
--muted-foreground: 0 0% 64%;      /* #a3a3a3 */

--accent: 0 0% 15%;                /* #262626 */
--accent-foreground: 0 0% 98%;     /* #fafafa */

--border: 0 0% 25%;                /* #404040 */
--input: 0 0% 25%;                 /* #404040 */
--ring: 217 91% 60%;               /* #3b82f6 */
\`\`\`

## タイポグラフィ

### フォントファミリー

\`\`\`css
/* メインフォント - 日本語対応 */
--font-sans: 'Inter Variable', 'Noto Sans JP', -apple-system, BlinkMacSystemFont,
             'Segoe UI', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN',
             'Yu Gothic', 'Meiryo', sans-serif;

/* モノスペースフォント */
--font-mono: 'JetBrains Mono', 'Consolas', 'Monaco', 'Courier New', monospace;
\`\`\`

**フォント選定理由：**
- **Inter Variable**: 欧文の可読性が高く、日本語と並べた際のバランスが良い
- **Noto Sans JP**: Googleが提供する高品質な日本語フォント。Interとの相性が良い
- **Hiragino Sans**: macOS標準の高品質日本語フォント
- **Yu Gothic**: Windows標準の読みやすい日本語フォント

### タイプスケール

\`\`\`css
/* Heading */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */

/* Line Height */
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;

/* Font Weight */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
\`\`\`

### テキストスタイル定義

\`\`\`css
/* Display - 大見出し */
.text-display {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
}

/* Heading 1 */
.text-h1 {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: -0.01em;
}

/* Heading 2 */
.text-h2 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
}

/* Heading 3 */
.text-h3 {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
}

/* Body Large */
.text-body-lg {
  font-size: var(--text-lg);
  font-weight: var(--font-normal);
  line-height: var(--leading-relaxed);
}

/* Body (デフォルト) */
.text-body {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-relaxed);
}

/* Body Small */
.text-body-sm {
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
}

/* Caption */
.text-caption {
  font-size: var(--text-xs);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: hsl(var(--muted-foreground));
}
\`\`\`

## スペーシングシステム

4pxベースのスペーシングスケール

\`\`\`css
--spacing-0: 0;
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
--spacing-20: 5rem;     /* 80px */
--spacing-24: 6rem;     /* 96px */
\`\`\`

## ボーダー＆シャドウ

### ボーダー半径

\`\`\`css
--radius-none: 0;
--radius-sm: 0.125rem;   /* 2px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-full: 9999px;   /* 完全な円形 */
\`\`\`

### シャドウ

\`\`\`css
/* Elevation システム */
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
             0 1px 2px -1px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
             0 2px 4px -2px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
             0 4px 6px -4px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
             0 8px 10px -6px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
\`\`\`

## アニメーション

### トランジション

\`\`\`css
/* Duration */
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 350ms;

/* Easing */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);
\`\`\`

### 一般的なトランジション定義

\`\`\`css
.transition-default {
  transition: all var(--duration-normal) var(--ease-in-out);
}

.transition-colors {
  transition: color var(--duration-fast) var(--ease-in-out),
              background-color var(--duration-fast) var(--ease-in-out),
              border-color var(--duration-fast) var(--ease-in-out);
}

.transition-transform {
  transition: transform var(--duration-normal) var(--ease-out);
}

.transition-opacity {
  transition: opacity var(--duration-fast) var(--ease-in-out);
}
\`\`\`

## レイアウト

### コンテナ幅

\`\`\`css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
\`\`\`

### グリッドシステム

\`\`\`css
/* 基本12カラムグリッド */
.grid {
  display: grid;
  gap: var(--spacing-6);
}

.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
.grid-cols-6 { grid-template-columns: repeat(6, 1fr); }
.grid-cols-12 { grid-template-columns: repeat(12, 1fr); }
\`\`\`

### Z-Index階層

\`\`\`css
--z-base: 0;
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-popover: 1060;
--z-tooltip: 1070;
--z-toast: 1080;
\`\`\`

## コンポーネント設計原則

### 1. Button（ボタン）

\`\`\`tsx
// Variant定義
variants: {
  variant: {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  },
  size: {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  }
}
\`\`\`

### 2. Input（入力フィールド）

- ボーダー: \`border-input\`
- フォーカス時: \`ring-2 ring-ring ring-offset-2\`
- 高さ: \`h-10\` (40px)
- パディング: \`px-3 py-2\`
- 角丸: \`rounded-md\`

### 3. Card（カード）

- 背景: \`bg-card\`
- ボーダー: \`border border-border\`
- シャドウ: \`shadow-sm\`
- 角丸: \`rounded-lg\`
- パディング: \`p-6\`

### 4. Modal/Dialog（モーダル）

- 背景オーバーレイ: \`bg-black/50\`
- モーダル背景: \`bg-background\`
- シャドウ: \`shadow-lg\`
- 最大幅: \`max-w-lg\`

## アクセシビリティ

### コントラスト比

- 通常テキスト: 4.5:1以上（WCAG AA準拠）
- 大きいテキスト（18px以上または太字14px以上）: 3:1以上
- インタラクティブ要素: 3:1以上

### フォーカス状態

\`\`\`css
/* キーボードフォーカス */
.focus-visible:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
\`\`\`

### ARIAラベル

- すべてのインタラクティブ要素に適切なARIAラベルを付与
- フォームフィールドには\`aria-label\`または関連付けられた\`<label>\`が必須
- モーダルには\`role="dialog"\`と\`aria-modal="true"\`を設定

## レスポンシブデザイン

### ブレークポイント

\`\`\`css
/* Mobile First */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
\`\`\`

### タッチターゲット

- 最小タッチサイズ: 44x44px（モバイル）
- ボタン間のスペース: 最低8px

## 実装ガイドライン

### CSS Variables使用例

\`\`\`css
/* globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 9%;
    /* ... その他の変数 ... */
  }

  .dark {
    --background: 0 0% 9%;
    --foreground: 0 0% 98%;
    /* ... ダークモード変数 ... */
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
\`\`\`

### Tailwind設定

\`\`\`js
// tailwind.config.js
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... 続く
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      fontFamily: {
        sans: "var(--font-sans)",
        mono: "var(--font-mono)",
      },
    },
  },
}
\`\`\`

## デザイントークン

### Figma/デザインツール連携

デザイントークンは以下のJSON形式で管理：

\`\`\`json
{
  "color": {
    "background": {
      "value": "#ffffff",
      "type": "color"
    },
    "foreground": {
      "value": "#171717",
      "type": "color"
    }
  },
  "spacing": {
    "4": {
      "value": "16px",
      "type": "spacing"
    }
  }
}
\`\`\`

## まとめ

このデザインシステムは、以下を実現します：

1. **淡く落ち着いた見た目**: Neutral 100ベースの柔らかい配色
2. **日本語の可読性**: Noto Sans JPとInterの組み合わせで最適化
3. **shadcn/ui互換**: 既存コンポーネントをそのまま活用可能
4. **アクセシビリティ**: WCAG AA準拠のコントラスト比
5. **一貫性**: すべての要素で統一されたスタイリング

このシステムに従うことで、ユーザーが長時間使用しても疲れにくい、快適なデイリープランナー体験を提供できます。
