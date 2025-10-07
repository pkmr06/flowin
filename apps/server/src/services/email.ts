import { Resend } from 'resend';

// 開発環境では実際にメールを送信しないようにする
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_dummy_key_for_development';
const resend = new Resend(RESEND_API_KEY);

export async function sendMagicLinkEmail({
	to,
	magicLink,
	token,
}: {
	to: string;
	magicLink: string;
	token: string;
}) {
	// 開発環境でダミーキーの場合はメール送信をスキップ
	if (RESEND_API_KEY === 're_dummy_key_for_development') {
		console.log('Development mode: Would send magic link email to:', to);
		console.log('Magic link:', magicLink);
		return;
	}

	try {
		await resend.emails.send({
			from: 'Flowin <noreply@flowin.app>',
			to,
			subject: 'Flowinへのログインリンク',
			html: `
				<!DOCTYPE html>
				<html>
				<head>
					<meta charset="utf-8">
					<style>
						body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; }
						.container { max-width: 600px; margin: 0 auto; padding: 20px; }
						.header { text-align: center; padding: 20px 0; }
						.button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
						.footer { text-align: center; color: #666; font-size: 14px; margin-top: 40px; }
					</style>
				</head>
				<body>
					<div class="container">
						<div class="header">
							<h1>Flowinへようこそ</h1>
						</div>
						<p>以下のボタンをクリックしてログインしてください：</p>
						<p style="text-align: center;">
							<a href="${magicLink}" class="button">ログイン</a>
						</p>
						<p style="color: #666; font-size: 14px;">
							このリンクは30分間有効です。<br>
							もしこのメールに心当たりがない場合は、このメールを無視してください。
						</p>
						<div class="footer">
							<p>&copy; 2025 Flowin. All rights reserved.</p>
						</div>
					</div>
				</body>
				</html>
			`,
		});
	} catch (error) {
		console.error('Failed to send magic link email:', error);
		throw new Error('メール送信に失敗しました');
	}
}
