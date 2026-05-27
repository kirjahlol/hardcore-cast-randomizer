<script lang="ts">
	import { browser } from '$app/environment';
	import type { LayoutProps } from './$types';
	import './layout.css';
	import { onMount } from 'svelte';

	if (browser) {
		const isThemeSystem = localStorage.getItem('theme-system');
		if (isThemeSystem === null) {
			const isThemeDarkPreferred = window.matchMedia('(prefers-color-scheme: dark)').matches;
			const defaultTheme = isThemeDarkPreferred ? 'mocha' : 'latte';
			localStorage.setItem('theme', defaultTheme);
			localStorage.setItem('theme-system', 'true');
		}

		const theme = localStorage.getItem('theme');
		if (theme) {
			document.documentElement.className = theme;
		}
	}

	onMount(() => {
		const isThemeSystem = localStorage.getItem('theme-system');
		if (isThemeSystem === 'true') {
			const isThemeDarkPreferred = window.matchMedia('(prefers-color-scheme: dark)').matches;
			const defaultTheme = isThemeDarkPreferred ? 'mocha' : 'latte';
			document.documentElement.className = defaultTheme;
		}

		const isThemeDarkPreferred = window.matchMedia('(prefers-color-scheme: dark)');
		isThemeDarkPreferred.addEventListener('change', (event) => {
			const isThemeSystem = localStorage.getItem('theme-system');
			if (isThemeSystem !== 'true') return;

			const defaultTheme = event.matches ? 'mocha' : 'latte';
			document.documentElement.className = defaultTheme;
			localStorage.setItem('theme', defaultTheme);
		});
	});

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<title>Hardcore Cast Randomizer</title>
</svelte:head>
{@render children()}
