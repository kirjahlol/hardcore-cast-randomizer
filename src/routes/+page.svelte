<script lang="ts">
	import Footer from '$components/Footer.svelte';
	import type { PageProps } from './$types';
	import { onMount } from 'svelte';

	interface Event {
		episode: number;
		person?: string;
		causeOfDeath?: string;
	}

	let { data }: PageProps = $props();

	let numberOfPeople = $state(8);
	let highlightedName = $state('');

	let possibleMembers = $derived([...data.members]);
	let shuffledMembers: typeof data.members = $state([]);
	let poolSize = $state(0);
	let people: typeof data.members = $state([]);

	let games = ['Minecraft', 'Terraria'];
	let game = $state('Minecraft');
	let numberOfEpisodes = $state(10);
	let odds = $state(0.5);

	let events: Event[] = $state([]);
	let survivors: string[] = $state([]);
	let isSimulationFinished = $state(false);

	function randomizePeople() {
		for (let i = shuffledMembers.length - 1; i > 0; i--) {
			const arrayBuffer = new Uint32Array(1);
			crypto.getRandomValues(arrayBuffer);
			const j = arrayBuffer[0] % (i + 1);
			[shuffledMembers[i], shuffledMembers[j]] = [shuffledMembers[j], shuffledMembers[i]];
		}

		poolSize = shuffledMembers.length;
		people = shuffledMembers.slice(0, Math.min(numberOfPeople, shuffledMembers.length));

		randomizeEvents();
	}

	function randomizeEvents() {
		events = [];
		isSimulationFinished = false;

		let aliveCastMembers: string[] = [...people].map((person) => person.title);

		const minecraftDeathMessages = [
			'was killed by a Zombie',
			'was killed by a Baby Zombie',
			'was killed by a Skeleton',
			'was killed by a Spider',
			'was blown up by a Creeper',
			'was killed by a Creeper',
			'was killed by an Enderman',
			'was fireballed by a Blaze',
			'was killed by a Wither Skeleton',
			'fell to their death'
		];

		const terrariaDeathMessages = [
			'was killed by a Slime',
			'was killed by a Zombie',
			'was killed by a Skeleton',
			'accidentally jumped of a minecart track',
			'fell to their death',
			'was crushed by a boulder',
			'was blown up by an explosive trap',
			'drowned'
		];

		for (let i = 0; i < numberOfEpisodes; i++) {
			if (aliveCastMembers.length === 0) break;

			let willEventHappen = Math.random() < odds;

			if (willEventHappen) {
				const randomIndex = Math.floor(Math.random() * aliveCastMembers.length);
				const person = aliveCastMembers[randomIndex];

				let causeOfDeath = '';
				switch (game) {
					case 'Minecraft':
						causeOfDeath =
							minecraftDeathMessages[Math.floor(Math.random() * minecraftDeathMessages.length)];
						break;
					case 'Terraria':
						causeOfDeath =
							terrariaDeathMessages[Math.floor(Math.random() * terrariaDeathMessages.length)];
						break;
				}

				events.push({
					episode: i + 1,
					person,
					causeOfDeath
				});

				aliveCastMembers.splice(randomIndex, 1);
			}
		}

		survivors = aliveCastMembers;
		isSimulationFinished = true;
	}

	function formatPeopleList(people: string[]): string {
		if (people.length === 1) return people[0];
		if (people.length === 2) return `${people[0]} and ${people[1]}`;

		const allButLast = people.slice(0, -1).join(', ');
		return `${allButLast}, and ${people[people.length - 1]}`;
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
			<hr class="w-full" />
			<h1 class="font-semibold text-4xl text-center">Simulator</h1>
			<div class="flex gap-2">
				Game:
				{#each games as gameName, i (i)}
					<label>
						<input
							type="radio"
							name="games"
							value={gameName}
							bind:group={game}
							onchange={randomizeEvents}
							class="accent-ctp-blue"
						/>
						{gameName}
					</label>
				{/each}
			</div>
			<label class="flex items-center gap-2">
				Number of episodes:
				<input
					type="number"
					bind:value={numberOfEpisodes}
					min="1"
					max="20"
					oninput={(event) => {
						const currentTarget = event.currentTarget;

						if (!currentTarget.value) return;

						if (parseInt(currentTarget.value) > 20) {
							currentTarget.value = '20';
							numberOfEpisodes = 20;
						}

						if (parseInt(currentTarget.value) < 1) {
							currentTarget.value = '1';
							numberOfEpisodes = 1;
						}

						randomizeEvents();
					}}
					class="border border-ctp-surface0 bg-ctp-mantle rounded-lg p-2 focus:outline-none"
				/>
				<input
					type="range"
					bind:value={numberOfEpisodes}
					min="1"
					max="20"
					oninput={randomizeEvents}
					class="accent-ctp-blue"
				/>
			</label>
			<label class="flex items-center gap-2">
				Chances of death:
				<input
					type="number"
					bind:value={odds}
					min="0"
					max="1"
					step="0.01"
					oninput={(event) => {
						const currentTarget = event.currentTarget;

						if (!currentTarget.value) return;

						if (parseInt(currentTarget.value) > 1) {
							currentTarget.value = '1';
							odds = 1;
						}

						if (parseInt(currentTarget.value) < 0) {
							currentTarget.value = '0';
							odds = 0;
						}

						randomizeEvents();
					}}
					class="border border-ctp-surface0 bg-ctp-mantle rounded-lg p-2 focus:outline-none"
				/>
				<input
					type="range"
					bind:value={odds}
					min="0"
					max="1"
					step="0.01"
					oninput={randomizeEvents}
					class="accent-ctp-blue"
				/>
			</label>
			{#if isSimulationFinished}
				<div class="flex flex-col text-center">
					{#each events as event, i (i)}
						<div>
							<p>In episode {event.episode}, {event.person} {event.causeOfDeath}.</p>
						</div>
					{/each}
					{#if survivors.length > 0}
						<p class="font-semibold">
							{formatPeopleList(survivors)} completed the goal!
						</p>
					{:else}
						<p class="font-semibold">Everyone died before the goal was completed...</p>
					{/if}
				</div>
			{/if}
		{/if}
	</main>
	<hr />
	<Footer />
</div>
