<script lang="ts">
	import type { PageProps } from './$types';
	import { onMount } from 'svelte';

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

<main class="flex flex-col items-center justify-center gap-2 p-4 sm:h-screen">
	<h1 class="text-center text-2xl font-semibold">Hardcore Cast Randomizer</h1>
	<p>
		Made by <a href="https://github.com/kirjahlol" class="text-blue-500 underline">kirjah</a> :)
	</p>
	<div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
		{#each people as person, i (i)}
			<a
				href="https://hardcore.wiki/wiki/{encodeURIComponent(person.title.replace(/ /g, '_'))}"
				class="flex size-48 items-center justify-center rounded-full border p-4">{person.title}</a
			>
		{/each}
	</div>
	<p class="text-center">Click on the name of a person to go to their wiki page.</p>
	<button class="rounded-lg border p-2 hover:cursor-pointer" onclick={randomizePeople}
		>Randomize</button
	>
</main>
