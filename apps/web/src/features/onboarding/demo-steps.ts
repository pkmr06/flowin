import type { DriveStep } from 'driver.js';

export const demoSteps: DriveStep[] = [
	{
		element: '#welcome-message',
		popover: {
			title: 'Flowinへようこそ！',
			description: '30秒でFlowinの使い方を体験しましょう',
			side: 'bottom',
			align: 'center',
		},
	},
	{
		element: '#add-task-button',
		popover: {
			title: 'タスクを追加',
			description: 'この「+」ボタンでタスクを追加できます。クリックしてみましょう！',
			side: 'left',
			align: 'start',
		},
	},
	{
		element: '#task-title-input',
		popover: {
			title: 'タスク名を入力',
			description: '「プレゼン資料作成」など、今日やることを入力してください',
			side: 'bottom',
			align: 'center',
		},
	},
	{
		element: '#priority-selector',
		popover: {
			title: '優先度を設定',
			description: '高・中・低から選択。重要なタスクは「高」にしましょう',
			side: 'right',
			align: 'start',
		},
	},
	{
		element: '#save-task-button',
		popover: {
			title: 'タスクを保存',
			description: '保存ボタンでタスクリストに追加されます',
			side: 'bottom',
			align: 'center',
		},
	},
	{
		element: '#task-list',
		popover: {
			title: 'タスク一覧',
			description: 'ここに追加したタスクが表示されます',
			side: 'left',
			align: 'start',
		},
	},
	{
		element: '#start-task-button',
		popover: {
			title: 'タスクを開始',
			description: '「開始」ボタンでタイマーがスタート！集中して作業できます',
			side: 'top',
			align: 'center',
		},
	},
	{
		element: '#progress-bar',
		popover: {
			title: '進捗を確認',
			description: '完了したタスクがリアルタイムで表示されます',
			side: 'bottom',
			align: 'center',
		},
	},
	{
		popover: {
			title: 'デモ完了！',
			description: '実際にタスクを追加して始めましょう！',
		},
	},
];
