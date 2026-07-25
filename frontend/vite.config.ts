import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		proxy: {
			'/auth': {
				target: 'http://localhost:3000',
				changeOrigin: true
			},
			'/dashboard/data': {
				target: 'http://localhost:3000',
				changeOrigin: true
			},
			'/dashboard/poll-status': {
				target: 'http://localhost:3000',
				changeOrigin: true
			},
			'/config': {
				target: 'http://localhost:3000',
				changeOrigin: true
			},
			'/report': {
				target: 'http://localhost:3000',
				changeOrigin: true
			},
			'/send': {
				target: 'http://localhost:3000',
				changeOrigin: true
			}
		}
	}
});
