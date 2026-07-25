<script lang="ts">
	import Navbar from "$lib/components/Navbar.svelte";
	import Sidebar from "$lib/components/Sidebar.svelte";
	import Button from "$lib/components/Button.svelte";
	import Card from "$lib/components/Card.svelte";
	import Loader from "$lib/components/Loader.svelte";
	import { me } from "$lib/services/auth";
	import { getSMTPConfigs } from "$lib/services/config";
	import { api } from "$lib/api/client";

	let user = $state<any>(null);
	let configs = $state<any[]>([]);
	let loading = $state(true);
	let sending = $state(false);
	let toast = $state<{ message: string; type: string } | null>(null);
	let path = "/compose";

	// Form state
	let subject = $state("");
	let selectedConfigId = $state("");
	let delay = $state(20);
	let excelFile = $state<File | null>(null);
	let htmlFile = $state<File | null>(null);
	let excelFileName = $state("");
	let htmlFileName = $state("");

	function showToast(message: string, type: "success" | "error" | "info" = "info") {
		toast = { message, type };
		setTimeout(() => toast = null, 3000);
	}

	function handleExcelChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			excelFile = input.files[0];
			excelFileName = input.files[0].name;
		}
	}

	function handleHtmlChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			htmlFile = input.files[0];
			htmlFileName = input.files[0].name;
		}
	}

	async function handleSend() {
		if (!excelFile) {
			showToast("Please upload an Excel file with contacts", "error");
			return;
		}
		if (!selectedConfigId) {
			showToast("Please select an SMTP configuration", "error");
			return;
		}
		if (!subject.trim()) {
			showToast("Please enter a subject", "error");
			return;
		}

		sending = true;
		try {
			const formData = new FormData();
			formData.append("excelFile", excelFile);
			formData.append("configId", selectedConfigId);
			formData.append("subject", subject);
			formData.append("delay", String(delay));

			if (htmlFile) {
				formData.append("htmlTemplate", htmlFile);
			} else {
				formData.append("htmlContent", `<html><body><h2>${subject}</h2><p>Hello {{firstName}},</p><p>This is a test email.</p></body></html>`);
			}

			const res = await api.post("/send", formData, {
				headers: { "Content-Type": "multipart/form-data" }
			});

			if (res.data?.success) {
				showToast(`✅ ${res.data.message}`, "success");
				// Reset form
				subject = "";
				excelFile = null;
				htmlFile = null;
				excelFileName = "";
				htmlFileName = "";
			} else {
				showToast(res.data?.message || "❌ Failed to send", "error");
			}
		} catch (e: any) {
			showToast(e.response?.data?.message || "❌ Failed to send emails", "error");
		} finally {
			sending = false;
		}
	}

	$effect(() => {
		async function init() {
			try {
				const [userRes, smtpRes] = await Promise.all([me(), getSMTPConfigs()]);
				if (userRes.data?.success) user = userRes.data.user;
				if (smtpRes.data?.success) {
					configs = smtpRes.data.userConfigs || [];
					if (configs.length > 0) selectedConfigId = configs[0].id;
				}
			} catch (e) {
				console.error(e);
			} finally {
				loading = false;
			}
		}
		init();
	});
</script>

<div class="flex">
	<Sidebar currentPath={path} />
	<div class="flex-1 bg-gray-50 min-h-screen">
		<Navbar userName={user?.name || "User"} />

		{#if toast}
			<div class="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-white text-sm shadow-lg
				{toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}">
				{toast.message}
			</div>
		{/if}

		<div class="p-6 space-y-6 max-w-3xl">
			<div>
				<h1 class="text-2xl font-bold text-gray-800">Compose Email</h1>
				<p class="text-gray-500 mt-1">Send bulk emails to your contacts</p>
			</div>

			{#if loading}
				<Loader text="Loading..." />
			{:else}
				<Card title="Email Details">
					<div class="space-y-4">
						<!-- SMTP Selection -->
						<div class="space-y-1">
							<label for="smtp-select" class="block text-sm font-medium text-gray-700">
								SMTP Configuration <span class="text-red-500">*</span>
							</label>
							<select
								id="smtp-select"
								class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
								value={selectedConfigId}
								onchange={(e) => selectedConfigId = (e.target as HTMLSelectElement).value}
							>
								<option value="">Select SMTP config...</option>
								{#each configs as config}
									<option value={config.id}>
										{config.name} ({config.host}) {config.isDefault ? '⭐' : ''}
									</option>
								{/each}
							</select>
						</div>

						<!-- Subject -->
						<div class="space-y-1">
							<label for="subject-input" class="block text-sm font-medium text-gray-700">
								Subject <span class="text-red-500">*</span>
							</label>
							<input
								id="subject-input"
								type="text"
								placeholder="Enter email subject"
								class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
								value={subject}
								oninput={(e) => subject = (e.target as HTMLInputElement).value}
							/>
						</div>

						<!-- Delay -->
						<div class="space-y-1">
							<label for="delay-input" class="block text-sm font-medium text-gray-700">Delay between emails (seconds)</label>
							<input
								id="delay-input"
								type="number"
								min="1"
								class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
								value={delay}
								oninput={(e) => delay = parseInt((e.target as HTMLInputElement).value) || 20}
							/>
						</div>
					</div>
				</Card>

				<Card title="Upload Files">
					<div class="space-y-4">
						<!-- Excel Upload -->
						<div>
							<label for="excel-upload" class="block text-sm font-medium text-gray-700 mb-1">
								Excel File (Contacts) <span class="text-red-500">*</span>
							</label>
							<div class="flex items-center gap-3">
								<label for="excel-upload" class="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
									📂 Choose File
								</label>
								<input id="excel-upload" type="file" accept=".xlsx,.xls" class="hidden" onchange={handleExcelChange} />
								{#if excelFileName}
									<span class="text-sm text-gray-600">{excelFileName}</span>
								{/if}
							</div>
							<p class="text-xs text-gray-400 mt-1">Upload an Excel file with email addresses</p>
						</div>

						<!-- HTML Template Upload -->
						<div>
							<label for="html-upload" class="block text-sm font-medium text-gray-700 mb-1">
								HTML Template (Optional)
							</label>
							<div class="flex items-center gap-3">
								<label for="html-upload" class="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
									📄 Choose File
								</label>
								<input id="html-upload" type="file" accept=".html,.htm" class="hidden" onchange={handleHtmlChange} />
								{#if htmlFileName}
									<span class="text-sm text-gray-600">{htmlFileName}</span>
								{/if}
							</div>
							<p class="text-xs text-gray-400 mt-1">Upload an HTML template (optional, uses default if not provided)</p>
						</div>
					</div>
				</Card>

				<div class="flex justify-end">
					<Button onclick={handleSend} loading={sending} size="lg">
						🚀 Send Emails
					</Button>
				</div>
			{/if}
		</div>
	</div>
</div>

