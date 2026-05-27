<script lang="ts">
	import Footer from '$components/Footer.svelte';
	import type { PageProps } from './$types';
	import { onMount } from 'svelte';

	let { data }: PageProps = $props();

	let numberOfPeople = $state(8);
	let highlightedName = $state('');

	let possibleMembers = $derived([...data.members]);
	let shuffledMembers: typeof data.members = $state([]);
	let poolSize = $state(0);
	let people: typeof data.members = $state([]);

	function randomizePeople() {
		for (let i = shuffledMembers.length - 1; i > 0; i--) {
			const arrayBuffer = new Uint32Array(1);
			crypto.getRandomValues(arrayBuffer);
			const j = arrayBuffer[0] % (i + 1);
			[shuffledMembers[i], shuffledMembers[j]] = [shuffledMembers[j], shuffledMembers[i]];
		}

		poolSize = shuffledMembers.length;
		people = shuffledMembers.slice(0, Math.min(numberOfPeople, shuffledMembers.length));
	}

	onMount(() => {
		// Someone said not to fix Category:Groups because it was funny but someone else pointed it out and now I feel like I need to fix it
		possibleMembers = possibleMembers.filter((member) => {
			return member.title !== 'Category:Groups' && member.title !== 'User:Charity';
		});

		shuffledMembers = possibleMembers;

		randomizePeople();
	});
</script>

<div class="p-4 pt-16 flex flex-col gap-4">
	<main class="flex flex-col items-center gap-4 min-h-screen">
		<div class="flex items-center gap-2">
			<img src="/favicon.svg" alt="Hardcore logo" class="size-12" />
			<h1 class="text-center text-4xl font-semibold">Hardcore Cast Randomizer</h1>
		</div>
		<label class="flex items-center gap-2">
			Number of cast members:
			<input
				type="number"
				bind:value={numberOfPeople}
				min="1"
				max="30"
				oninput={(event) => {
					const currentTarget = event.currentTarget;

					if (!currentTarget.value) return;

					if (parseInt(currentTarget.value) > 30) {
						currentTarget.value = '30';
						numberOfPeople = 30;
					}

					if (parseInt(currentTarget.value) < 1) {
						currentTarget.value = '1';
						numberOfPeople = 1;
					}

					randomizePeople();
				}}
				class="border border-ctp-surface0 bg-ctp-mantle rounded-lg p-2 focus:outline-none"
			/>
			<input
				type="range"
				bind:value={numberOfPeople}
				min="1"
				max="30"
				oninput={randomizePeople}
				class="accent-ctp-blue"
			/>
		</label>
		<label for="highlighted-name"
			>Highlighted name:
			<input
				list="names"
				id="highlighted-name"
				name="highlighted-name"
				bind:value={highlightedName}
				class="focus:outline-none p-2 rounded-lg border border-ctp-surface0 bg-ctp-mantle"
			/>
		</label>
		<datalist id="names">
			{#each possibleMembers as person, i (i)}
				<option value={person.title}></option>
			{/each}
		</datalist>
		<p>
			Pool size: {poolSize} (people pulled from the
			<a href="https://hardcore.wiki/wiki/Category:People">People category</a>
			on the
			<a href="https://hardcore.wiki/wiki/Hardcore_Wiki">Hardcore Wiki</a>)
		</p>
		<button
			class="rounded-lg bg-ctp-blue py-2 px-4 text-ctp-base cursor-pointer hover:bg-ctp-blue-700"
			onclick={randomizePeople}>Randomize</button
		>
		{#if data.error}
			<p class="text-center font-semibold text-ctp-red">{data.error}</p>
		{:else}
			<p class="text-center">Click on the name of a person to go to their wiki page.</p>
			<div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap justify-center">
				{#each people as person, i (i)}
					{#if person.title === highlightedName}
						<a
							href="https://hardcore.wiki/wiki/{encodeURIComponent(
								person.title.replace(/ /g, '_')
							)}"
							class="flex size-48 items-center justify-center rounded-full border border-ctp-yellow-700 bg-ctp-yellow p-4 hover:scale-105 transition-[scale] duration-150 flex-col text-center text-ctp-base! no-underline!"
							><span class="text-ctp-base/80">{i + 1}.</span>{person.title}</a
						>
					{:else}
						<a
							href="https://hardcore.wiki/wiki/{encodeURIComponent(
								person.title.replace(/ /g, '_')
							)}"
							class="flex size-48 items-center justify-center rounded-full border border-ctp-surface0 bg-ctp-mantle p-4 hover:scale-105 transition-[scale] duration-150 flex-col text-center text-ctp-text! no-underline!"
							><span class="text-ctp-subtext0">{i + 1}.</span>{person.title}</a
						>
					{/if}
				{/each}
			</div>
		{/if}
	</main>
	<hr />
	<Footer />
</div>
