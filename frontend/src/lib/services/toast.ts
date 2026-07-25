type ToastType = "success" | "error" | "info";

interface Toast {
	id: number;
	message: string;
	type: ToastType;
}

let toasts = $state<Toast[]>([]);
let nextId = 0;

export function getToastStore() {
	function add(message: string, type: ToastType = "info", duration = 3000) {
		const id = nextId++;
		toasts = [...toasts, { id, message, type }];
		setTimeout(() => {
			toasts = toasts.filter(t => t.id !== id);
		}, duration);
	}

	return {
		get toasts() { return toasts; },
		success: (msg: string) => add(msg, "success"),
		error: (msg: string) => add(msg, "error"),
		info: (msg: string) => add(msg, "info"),
	};
}

export function ToastContainer() {
	const store = getToastStore();
	
	return {
		render() {
			return `
<div class="fixed top-4 right-4 z-[100] space-y-2">
	${store.toasts.map(t => {
		const bg = t.type === "success" ? "bg-green-500" : t.type === "error" ? "bg-red-500" : "bg-blue-500";
		return `<div class="px-4 py-3 rounded-lg text-white text-sm shadow-lg ${bg}">${t.message}</div>`;
	}).join('')}
</div>`;
		}
	};
}

