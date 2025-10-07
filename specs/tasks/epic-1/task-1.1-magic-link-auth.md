# Task 1.1: マジックリンク認証実装

**Epic**: Epic 1 - ユーザーオンボーディング  
**User Story**: US-1.1 - シンプルな登録  
**優先度**: Critical  
**推定工数**: 2日

## 概要
Better-Authを使用したメールアドレスベースのマジックリンク認証を実装する。パスワード不要で、メールリンククリックのみで自動ログインできるようにする。

## 技術要件

### バックエンド実装

#### 1. Better-Auth設定
```typescript
// apps/server/src/lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: false, // パスワード認証無効化
  },
  magicLink: {
    enabled: true,
    sendMagicLink: async ({ email, url, token }) => {
      await sendMagicLinkEmail({
        to: email,
        magicLink: url,
        token,
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7日間
    updateAge: 60 * 60 * 24, // 1日ごとに更新
  },
});
```

#### 2. メール送信サービス統合
```typescript
// apps/server/src/services/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMagicLinkEmail({
  to,
  magicLink,
  token,
}: {
  to: string;
  magicLink: string;
  token: string;
}) {
  await resend.emails.send({
    from: 'Flowin <noreply@flowin.app>',
    to,
    subject: 'Flowinへのログインリンク',
    html: `
      <h1>Flowinへようこそ</h1>
      <p>以下のリンクをクリックしてログインしてください：</p>
      <a href="${magicLink}">ログイン</a>
      <p>このリンクは30分間有効です。</p>
    `,
  });
}
```

#### 3. tRPC認証ルーター
```typescript
// apps/server/src/routers/auth.ts
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { auth } from '../lib/auth';

export const authRouter = router({
  sendMagicLink: publicProcedure
    .input(z.object({
      email: z.string().email(),
    }))
    .mutation(async ({ input }) => {
      await auth.sendMagicLink({
        email: input.email,
      });
      return { success: true };
    }),
  
  verifyMagicLink: publicProcedure
    .input(z.object({
      token: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const session = await auth.verifyMagicLink({
        token: input.token,
      });
      
      // セッションをコンテキストに設定
      ctx.session = session;
      
      return { 
        success: true,
        user: session.user,
      };
    }),
});
```

### フロントエンド実装

#### 4. ログインフォームコンポーネント
```tsx
// apps/web/src/components/auth/LoginForm.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const sendMagicLink = trpc.auth.sendMagicLink.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMagicLink.mutate({ email });
  };

  if (submitted) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">メールを確認してください</h2>
        <p className="text-muted-foreground">
          {email} にログインリンクを送信しました。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          メールアドレス
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
        />
      </div>
      <Button 
        type="submit" 
        className="w-full"
        disabled={sendMagicLink.isLoading}
      >
        {sendMagicLink.isLoading ? '送信中...' : 'ログインリンクを送信'}
      </Button>
    </form>
  );
}
```

#### 5. マジックリンク検証ページ
```tsx
// apps/web/src/routes/auth/verify.tsx
import { useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { trpc } from '@/lib/trpc';

export function VerifyMagicLink() {
  const navigate = useNavigate();
  const { token } = useSearch();
  
  const verifyMagicLink = trpc.auth.verifyMagicLink.useMutation({
    onSuccess: () => {
      navigate({ to: '/onboarding/demo' });
    },
    onError: (error) => {
      console.error('Verification failed:', error);
      navigate({ to: '/login', search: { error: 'invalid_token' } });
    },
  });

  useEffect(() => {
    if (token) {
      verifyMagicLink.mutate({ token });
    }
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p>ログイン処理中...</p>
      </div>
    </div>
  );
}
```

## データベーススキーマ

```typescript
// apps/server/src/db/schema/auth.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const magicLinks = sqliteTable('magic_links', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
```

## テスト要件

### ユニットテスト
```typescript
// apps/server/src/routers/auth.test.ts
describe('Auth Router', () => {
  it('should send magic link email', async () => {
    const result = await caller.auth.sendMagicLink({
      email: 'test@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('should verify valid magic link token', async () => {
    const result = await caller.auth.verifyMagicLink({
      token: 'valid-token',
    });
    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
  });

  it('should reject invalid magic link token', async () => {
    await expect(
      caller.auth.verifyMagicLink({ token: 'invalid-token' })
    ).rejects.toThrow();
  });
});
```

### E2Eテスト（Playwright）
```typescript
// apps/web/tests/e2e/auth.spec.ts
test('magic link authentication flow', async ({ page }) => {
  // ログインページへ移動
  await page.goto('/login');
  
  // メールアドレス入力
  await page.fill('input[type="email"]', 'test@example.com');
  await page.click('button[type="submit"]');
  
  // 確認メッセージ表示確認
  await expect(page.locator('text=メールを確認してください')).toBeVisible();
  
  // メールからトークン取得（モック）
  const token = await getLatestMagicLinkToken('test@example.com');
  
  // 検証ページへ直接アクセス
  await page.goto(`/auth/verify?token=${token}`);
  
  // オンボーディングページへリダイレクト確認
  await expect(page).toHaveURL('/onboarding/demo');
});
```

## 環境変数

```.env
# Resend API
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Better-Auth
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
```

## 受け入れ基準チェックリスト

- [ ] メールアドレス入力フォームが表示される
- [ ] マジックリンクが30秒以内にメールで届く
- [ ] マジックリンククリックで自動ログインできる
- [ ] 無効なメールアドレスでエラー表示
- [ ] 期限切れトークンでエラー表示
- [ ] セッションが7日間保持される
- [ ] ログアウト機能が動作する

## 依存関係

- Better-Auth パッケージ
- Resend メール送信サービス
- Drizzle ORM
- tRPC

## 実装順序

1. Better-Auth設定とデータベーススキーマ
2. メール送信サービス統合
3. tRPC認証ルーター実装
4. フロントエンドログインフォーム
5. マジックリンク検証ページ
6. テスト実装
7. エラーハンドリング強化

## 関連ドキュメント

- [Better-Auth Documentation](https://better-auth.com)
- [Resend Documentation](https://resend.com/docs)
- `specs/data-model.md` - User, Session エンティティ
- `specs/design-system.md` - フォームUIガイドライン
