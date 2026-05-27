<script lang="ts">
	import type { PageProps } from './$types';
	import { onMount } from 'svelte';

	let { data }: PageProps = $props();

	let numberOfPeople = $state(8);

	let people: typeof data.members = $state([]);

	function randomizePeople() {
		let shuffledMembers = [...data.members];

		// Someone said not to fix Category:Groups because it was funny but someone else pointed it out and now I feel like I need to fix it
		shuffledMembers = shuffledMembers.filter((member) => {
			return member.title !== 'Category:Groups' && member.title !== 'User:Charity';
		});

		for (let i = shuffledMembers.length - 1; i > 0; i--) {
			const arrayBuffer = new Uint32Array(1);
			crypto.getRandomValues(arrayBuffer);
			const j = arrayBuffer[0] % (i + 1);
			[shuffledMembers[i], shuffledMembers[j]] = [shuffledMembers[j], shuffledMembers[i]];
		}

		people = shuffledMembers.slice(0, Math.min(numberOfPeople, shuffledMembers.length));
	}

	onMount(() => {
		randomizePeople();
	});
</script>

<main class="flex flex-col items-center gap-4 p-4 pt-16">
	<div class="flex items-center gap-2">
		<img src="/favicon.svg" alt="Hardcore logo" class="size-12" />
		<h1 class="text-center text-4xl font-semibold">Hardcore Cast Randomizer</h1>
	</div>
	<p>
		Made by <a href="https://github.com/kirjahlol" class="text-ctp-blue underline">kirjah</a> ❤️
	</p>
	<label class="flex items-center gap-2">
		<input
			type="number"
			bind:value={numberOfPeople}
			min="1"
			max="30"
			onchange={randomizePeople}
			class="border border-ctp-surface0 bg-ctp-mantle rounded-lg p-2 focus:outline-none"
		/>
		<input
			type="range"
			bind:value={numberOfPeople}
			min="1"
			max="30"
			onchange={randomizePeople}
			class="accent-ctp-blue"
		/>
	</label>
	<div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap justify-center">
		{#each people as person, i (i)}
			<a
				href="https://hardcore.wiki/wiki/{encodeURIComponent(person.title.replace(/ /g, '_'))}"
				class="flex size-48 items-center justify-center rounded-full border border-ctp-surface0 bg-ctp-mantle p-4 hover:scale-105 transition-[scale] duration-150 flex-col text-center"
				><span class="text-ctp-subtext0">{i + 1}.</span>{person.title}</a
			>
		{/each}
	</div>
	<p class="text-center">Click on the name of a person to go to their wiki page.</p>
	<button
		class="rounded-lg bg-ctp-blue py-2 px-4 text-ctp-base cursor-pointer hover:bg-ctp-blue-700"
		onclick={randomizePeople}>Randomize</button
	>
</main>
