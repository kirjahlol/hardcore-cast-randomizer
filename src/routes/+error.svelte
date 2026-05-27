<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Footer from '$components/Footer.svelte';
</script>

<div class="p-4 flex flex-col gap-4">
	<main class="flex flex-col gap-4 items-center justify-center min-h-screen">
		<h1 class="text-5xl font-semibold text-center">{page.status}</h1>
		<h2 class="text-lg font-medium text-center">{page.error?.message}</h2>
		<a
			href={resolve('/')}
			class="py-2 px-4 rounded-lg bg-ctp-blue text-center text-ctp-base hover:bg-ctp-blue-700 cursor-pointer"
			>&leftarrow; Back to home</a
		>
	</main>
	<hr />
	<Footer />
</div>
