<script lang="ts">
	import type { LayoutProps } from './$types';
	import './layout.css';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<title>Hardcore Cast Randomizer</title>
</svelte:head>
{@render children()}
