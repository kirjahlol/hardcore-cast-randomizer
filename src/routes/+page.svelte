<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const numberOfPeople = 7;

	let people: typeof data.members = $state([]);

	onMount(() => {
		const shuffledMembers = Array.from(data.members).sort(() => 0.5 - Math.random());
		people = shuffledMembers.slice(0, numberOfPeople);
	});

	function randomizePeople() {
		const shuffledMembers = Array.from(data.members).sort(() => 0.5 - Math.random());
		people = shuffledMembers.slice(0, numberOfPeople);
	}
</script>

<main class="flex flex-col items-center justify-center gap-2 sm:h-screen">
	<h1 class="text-2xl font-semibold">Hardcore Cast Randomizer</h1>
	<div class="flex flex-wrap gap-2">
		{#each people as person, i (i)}
			<a
				href="https://hardcore.wiki/wiki/{encodeURIComponent(person.title.replace(/ /g, '_'))}"
				class="flex size-48 items-center justify-center rounded-full border p-4">{person.title}</a
			>
		{/each}
	</div>
	<button class="rounded-lg border p-2 hover:cursor-pointer" onclick={randomizePeople}
		>Randomize</button
	>
</main>
