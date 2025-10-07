import { createContext, useContext, useState, type ReactNode } from 'react';

interface DemoTask {
	id: string;
	title: string;
	priority: 'high' | 'medium' | 'low';
	status: 'pending' | 'in_progress' | 'completed';
}

interface DemoTaskContextValue {
	tasks: DemoTask[];
	addTask: (title: string, priority: DemoTask['priority']) => void;
	startTask: (id: string) => void;
	completeTask: (id: string) => void;
}

const DemoTaskContext = createContext<DemoTaskContextValue | null>(null);

export function DemoTaskProvider({ children }: { children: ReactNode }) {
	const [tasks, setTasks] = useState<DemoTask[]>([]);

	const addTask = (title: string, priority: DemoTask['priority']) => {
		const newTask: DemoTask = {
			id: Math.random().toString(36).substring(7),
			title,
			priority,
			status: 'pending',
		};
		setTasks((prev) => [...prev, newTask]);
	};

	const startTask = (id: string) => {
		setTasks((prev) =>
			prev.map((task) =>
				task.id === id ? { ...task, status: 'in_progress' as const } : task
			)
		);
	};

	const completeTask = (id: string) => {
		setTasks((prev) =>
			prev.map((task) =>
				task.id === id ? { ...task, status: 'completed' as const } : task
			)
		);
	};

	return (
		<DemoTaskContext.Provider value={{ tasks, addTask, startTask, completeTask }}>
			{children}
		</DemoTaskContext.Provider>
	);
}

export function useDemoTasks() {
	const context = useContext(DemoTaskContext);
	if (!context) {
		throw new Error('useDemoTasks must be used within DemoTaskProvider');
	}
	return context;
}
