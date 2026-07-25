<script lang="ts">
	import Navbar from "$lib/components/Navbar.svelte";
	import Sidebar from "$lib/components/Sidebar.svelte";
	import Button from "$lib/components/Button.svelte";
	import Input from "$lib/components/Input.svelte";
	import Card from "$lib/components/Card.svelte";
	import Modal from "$lib/components/Modal.svelte";
	import Loader from "$lib/components/Loader.svelte";
	import { me } from "$lib/services/auth";
	import { getSMTPConfigs, createSMTP, updateSMTP, deleteSMTP } from "$lib/services/config";
	import { api } from "$lib/api/client";

	let user = $state<any>(null);
	let configs = $state<any[]>([]);
	let loading = $state(true);
	let saving = $state(false);
	let testing = $state(false);
	let toast = $state<{ message: string; type: string } | null>(null);
	let path = "/smtp";

	// Modal state
	let showModal = $state(false);
	let editingId = $state<string | null>(null);
	let form = $state({
		name: "",
		host: "",
		port: 587,
		secure: false,
		user: "",
		pass: "",
		fromEmail: "",
		fromName: "",
		isDefault: false
	});

	function showToast(message: string, type: "success" | "error" | "info" = "info") {
		toast = { message, type };
		setTimeout(() => toast = null, 3000);
	}

	function openAdd() {
		editingId = null;
		form = { name: "", host: "", port: 587, secure: false, user: "", pass: "", fromEmail: "", fromName: "", isDefault: false };
		showModal = true;
	}

	function openEdit(config: any) {
		editingId = config.id;
		form = {
			name: config.name,
			host: config.host,
			port: config.port,
			secure: config.secure,
			user: config.user,
			pass: "",
			fromEmail: config.fromEmail,
			fromName: config.fromName || "",
			isDefault: config.isDefault
		};
		showModal = true;
	}

	async function handleSave() {
		saving = true;
		try {
			if (editingId) {
				await updateSMTP(editingId, form);
				showToast("✅ SMTP configuration updated", "success");
			} else {
				await createSMTP(form);
				showToast("✅ SMTP configuration saved", "success");
			}
			showModal = false;
			await loadConfigs();
		} catch (e: any) {
			showToast(e.response?.data?.message || "❌ Failed to save", "error");
		} finally {
			saving = false;
		}
	}

	async function handleDelete(id: string) {
		if (!confirm("Are you sure you want to delete this SMTP configuration?")) return;
		try {
			await deleteSMTP(id);
			showToast("🗑️ SMTP configuration deleted", "success");
			await loadConfigs();
		} catch (e: any) {
			showToast(e.response?.data?.message || "❌ Failed to delete", "error");
		}
	}

	async function handleSetDefault(id: string) {
		try {
			await api.post(`/config/smtp/${id}/default`);
			showToast("⭐ Default configuration updated", "success");
			await loadConfigs();
		} catch (e: any) {
			showToast(e.response?.data?.message || "❌ Failed to set default", "error");
		}
	}

	async function handleTest() {
		testing = true;
		try {
			const res = await api.post("/config/smtp/test", {
				host: form.host,
				port: form.port,
				secure: form.secure,
				user: form.user,
				pass: form.pass
			});
			if (res.data?.success) {
				showToast("✅ Connection successful!", "success");
			} else {
				showToast(res.data?.message || "❌ Connection failed", "error");
			}
		} catch (e: any) {
			showToast(e.response?.data?.message || "❌ Connection test failed", "error");
		} finally {
			testing = false;
		}
	}

	async function loadConfigs() {
		try {
			const res = await getSMTPConfigs();
			if (res.data?.success) {
				configs = res.data.userConfigs || [];
			}
		} catch (e) {
			console.error(e);
		}
	}

	$effect(() => {
		async function init() {
			try {
				const userRes = await me();
				if (userRes.data?.success) user = userRes.data.user;
				await loadConfigs();
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

		<div class="p-6 space-y-6">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-2xl font-bold text-gray-800">SMTP Configuration</h1>
					<p class="text-gray-500 mt-1">Manage your email sending profiles</p>
				</div>
				<Button onclick={openAdd}>
					+ Add SMTP
				</Button>
			</div>

			{#if loading}
				<Loader text="Loading configurations..." />
			{:else if configs.length === 0}
				<Card>
					<div class="text-center py-8">
						<p class="text-4xl mb-4">⚙️</p>
						<p class="text-gray-500">No SMTP configurations found</p>
						<p class="text-sm text-gray-400 mt-1">Add your first SMTP configuration to start sending emails</p>
						<div class="mt-4">
							<Button onclick={openAdd}>Add SMTP Configuration</Button>
						</div>
					</div>
				</Card>
			{:else}
				<div class="grid gap-4">
					{#each configs as config}
						<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
							<div class="flex items-start justify-between">
								<div class="space-y-1">
									<div class="flex items-center gap-2">
										<h3 class="text-lg font-semibold text-gray-800">{config.name}</h3>
										{#if config.isDefault}
											<span class="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">Default</span>
										{/if}
									</div>
									<p class="text-sm text-gray-500">{config.host}:{config.port}</p>
									<p class="text-sm text-gray-500">{config.fromEmail}</p>
								</div>
								<div class="flex items-center gap-2">
	<Button variant="ghost" size="sm" onclick={() => {
										form.host = config.host;
										form.port = config.port;
										form.secure = config.secure;
										form.user = config.user;
										form.pass = "";
										handleTest();
									}}>
										🧪 Test
									</Button>
									{#if !config.isDefault}
										<Button variant="ghost" size="sm" onclick={() => handleSetDefault(config.id)}>
											⭐ Set Default
										</Button>
									{/if}
									<Button variant="ghost" size="sm" onclick={() => openEdit(config)}>
										✏️ Edit
									</Button>
									<Button variant="danger" size="sm" onclick={() => handleDelete(config.id)}>
										🗑️ Delete
									</Button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<Modal open={showModal} title={editingId ? "Edit SMTP Configuration" : "Add SMTP Configuration"} onclose={() => showModal = false}>
	<div class="space-y-4">
		<div class="space-y-1">
			<label for="config-name" class="block text-sm font-medium text-gray-700">Configuration Name <span class="text-red-500">*</span></label>
			<input id="config-name" type="text" placeholder="e.g., Gmail Work" value={form.name} oninput={(e) => form.name = (e.target as HTMLInputElement).value}
				class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
		</div>
		<div class="grid grid-cols-3 gap-4">
			<div class="col-span-2 space-y-1">
				<label for="smtp-host" class="block text-sm font-medium text-gray-700">SMTP Host <span class="text-red-500">*</span></label>
				<input id="smtp-host" type="text" placeholder="smtp.gmail.com" value={form.host} oninput={(e) => form.host = (e.target as HTMLInputElement).value}
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
			</div>
			<div class="space-y-1">
				<label for="smtp-port" class="block text-sm font-medium text-gray-700">Port</label>
				<input id="smtp-port" type="number" placeholder="587" value={form.port} oninput={(e) => form.port = parseInt((e.target as HTMLInputElement).value) || 587}
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
			</div>
		</div>
		<div class="flex items-center gap-2">
			<input type="checkbox" id="secure" checked={form.secure} onchange={(e) => form.secure = (e.target as HTMLInputElement).checked} />
			<label for="secure" class="text-sm text-gray-700">Use SSL/TLS (Secure Connection)</label>
		</div>
		<div class="grid grid-cols-2 gap-4">
			<div class="space-y-1">
				<label for="smtp-user" class="block text-sm font-medium text-gray-700">SMTP Username <span class="text-red-500">*</span></label>
				<input id="smtp-user" type="text" placeholder="user@gmail.com" value={form.user} oninput={(e) => form.user = (e.target as HTMLInputElement).value}
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
			</div>
			<div class="space-y-1">
				<label for="smtp-pass" class="block text-sm font-medium text-gray-700">SMTP Password <span class="text-red-500">*</span></label>
				<input id="smtp-pass" type="password" placeholder="••••••••" value={form.pass} oninput={(e) => form.pass = (e.target as HTMLInputElement).value}
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
			</div>
		</div>
		<div class="grid grid-cols-2 gap-4">
			<div class="space-y-1">
				<label for="from-email" class="block text-sm font-medium text-gray-700">From Email <span class="text-red-500">*</span></label>
				<input id="from-email" type="email" placeholder="sender@gmail.com" value={form.fromEmail} oninput={(e) => form.fromEmail = (e.target as HTMLInputElement).value}
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
			</div>
			<div class="space-y-1">
				<label for="from-name" class="block text-sm font-medium text-gray-700">From Name</label>
				<input id="from-name" type="text" placeholder="Your Name" value={form.fromName} oninput={(e) => form.fromName = (e.target as HTMLInputElement).value}
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
			</div>
		</div>
		<div class="flex items-center gap-2">
			<input type="checkbox" id="isDefault" checked={form.isDefault} onchange={(e) => form.isDefault = (e.target as HTMLInputElement).checked} />
			<label for="isDefault" class="text-sm text-gray-700">Set as default configuration</label>
		</div>
		<div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
			<Button variant="secondary" onclick={() => showModal = false}>Cancel</Button>
			<Button variant="primary" onclick={handleTest} loading={testing}>🧪 Test Connection</Button>
			<Button variant="success" onclick={handleSave} loading={saving}>
				{editingId ? 'Update' : 'Save'}
			</Button>
		</div>
	</div>
</Modal>

