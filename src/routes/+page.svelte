<script lang="ts">
	import Footer from '$components/Footer.svelte';
	import type { PageProps } from './$types';
	import { onMount, tick } from 'svelte';
	import { fly } from 'svelte/transition';

	interface Event {
		eventType: 'progression' | 'death' | 'victory' | 'failure';
		episode?: number;
		person?: string;
		message?: string;
	}

	let { data }: PageProps = $props();

	let numberOfPeople = $state(8);
	let highlightedName = $state('');

	let transitionKey = $state(0);

	let possibleMembers = $derived([...data.members]);
	let shuffledMembers: typeof data.members = $state([]);
	let poolSize = $state(0);
	let people: typeof data.members = $state([]);

	let games = ['Minecraft', 'Terraria'];
	let game = $state('Minecraft');
	let numberOfEpisodes = $state(10);
	let deathOdds = $state(0.1);
	let isSimulationFinished = $state(false);
	let events: Event[] = $state([]);
	let survivors: string[] = $state([]);

	async function randomizePeople() {
		people = [];
		transitionKey++;

		await tick();

		for (let i = shuffledMembers.length - 1; i > 0; i--) {
			const arrayBuffer = new Uint32Array(1);
			crypto.getRandomValues(arrayBuffer);
			const j = arrayBuffer[0] % (i + 1);
			[shuffledMembers[i], shuffledMembers[j]] = [shuffledMembers[j], shuffledMembers[i]];
		}

		poolSize = shuffledMembers.length;
		people = shuffledMembers.slice(0, Math.min(numberOfPeople, shuffledMembers.length));

		simulateEvents();
	}

	function simulateEvents() {
		events = [];
		isSimulationFinished = false;

		let aliveCastMembers: string[] = [...people].map((person) => person.title);
		let progressionLevel = 0;

		const gameEvents = {
			Minecraft: {
				milestones: [
					{ episode: Math.floor(numberOfEpisodes * 0.3), message: 'The Nether was entered' },
					{
						episode: Math.floor(numberOfEpisodes * 0.4),
						message: 'All the Blaze Rods were collected'
					},
					{
						episode: Math.floor(numberOfEpisodes * 0.7),
						message: 'All the Ender Pearls were collected'
					}
				],
				deaths: [
					{ message: 'was killed by a Zombie', levels: [0, 2, 3] },
					{ message: 'was killed by a Baby Zombie', levels: [0, 2, 3] },
					{ message: 'was killed by a Skeleton', levels: [0, 2, 3] },
					{ message: 'was blown up by a Creeper', levels: [0, 2, 3] },
					{ message: 'was killed by a Spider', levels: [0, 2, 3] },
					{ message: 'fell to their death', levels: [0, 2, 3] },
					{ message: 'drowned', levels: [0, 2, 3] },
					{ message: 'was killed by an Enderman', levels: [0, 2] },
					{ message: 'was fireballed by a Blaze', levels: [1] },
					{ message: 'was killed by a Wither Skeleton', levels: [1] }
				]
			},
			Terraria: {
				milestones: [
					{
						episode: Math.floor(numberOfEpisodes * 0.3),
						message: 'The Eye of Cthulhu was defeated'
					},
					{
						episode: Math.floor(numberOfEpisodes * 0.5),
						message: 'The Eater of Worlds was defeated'
					},
					{
						episode: Math.floor(numberOfEpisodes * 0.7),
						message: 'Skeletron was defeated'
					}
				],
				deaths: [
					{ message: 'was killed by a Slime', levels: [0, 1, 2, 3] },
					{ message: 'was killed by a Zombie', levels: [0, 1, 2, 3] },
					{ message: 'was killed by a Skeleton', levels: [0, 1, 2, 3] },
					{ message: 'was killed by a Hornet', levels: [0, 1, 2, 3] },
					{ message: 'accidentally jumped of a minecart track', levels: [0, 1, 2, 3] },
					{ message: 'fell to their death', levels: [0, 1, 2, 3] },
					{ message: 'was crushed by a boulder', levels: [0, 1, 2, 3] },
					{ message: 'was blown up by an explosive trap', levels: [0, 1, 2, 3] },
					{ message: 'drowned', levels: [0, 1, 2, 3] }
				]
			}
		};

		const activeGame = gameEvents[game as keyof typeof gameEvents];

		for (let i = 0; i < numberOfEpisodes; i++) {
			if (aliveCastMembers.length === 0) break;

			const currentEpisode = i + 1;

			const milestone = activeGame.milestones.find(
				(milestone) => milestone.episode === currentEpisode
			);
			if (milestone) {
				progressionLevel++;

				events.push({
					eventType: 'progression',
					message: milestone.message
				});
			}

			let deathsThisEpisode: string[] = [];

			for (const person of aliveCastMembers) {
				if (Math.random() < deathOdds) {
					const possibleDeaths = activeGame.deaths.filter((death) =>
						death.levels.includes(progressionLevel)
					);

					if (possibleDeaths.length > 0) {
						const death = possibleDeaths[Math.floor(Math.random() * possibleDeaths.length)];
						events.push({
							eventType: 'death',
							episode: currentEpisode,
							person,
							message: death.message
						});
						deathsThisEpisode.push(person);
					}
				}
			}

			aliveCastMembers = aliveCastMembers.filter((person) => !deathsThisEpisode.includes(person));
		}

		survivors = aliveCastMembers;
		if (aliveCastMembers.length > 0) {
			switch (game) {
				case 'Minecraft':
					events.push({
						eventType: 'victory',
						message: 'defeated the Ender Dragon'
					});
					break;
				case 'Terraria':
					events.push({
						eventType: 'victory',
						message: 'defeated the Wall of Flesh'
					});
					break;
			}
		} else {
			events.push({
				eventType: 'failure',
				message: 'Everyone died before the goal was completed'
			});
		}

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
		<div class="flex flex-col items-center gap-4">
			<img src="/favicon.svg" alt="Hardcore logo" class="size-12" />
			<h1 class="text-center text-4xl font-semibold">Hardcore Cast Randomizer</h1>
		</div>
		<div
			class="flex flex-col items-center gap-4 p-4 bg-ctp-mantle rounded-lg border border-ctp-surface0"
		>
			<label class="flex items-center gap-2 flex-col sm:flex-row">
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
					class="border border-ctp-surface0 bg-ctp-crust rounded-md p-2 focus:outline-none"
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
			<label for="highlighted-name" class="flex flex-col sm:flex-row items-center gap-2">
				Highlighted name (optional):
				<input
					list="names"
					id="highlighted-name"
					name="highlighted-name"
					bind:value={highlightedName}
					class="focus:outline-none p-2 rounded-md border border-ctp-surface0 bg-ctp-crust"
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
			<button onclick={randomizePeople}>Randomize</button>
		</div>
		{#if data.error}
			<p class="text-center font-semibold text-ctp-red">{data.error}</p>
		{:else}
			<p class="text-center">Click on the name of a person to go to their wiki page.</p>
			{#key transitionKey}
				<div class="flex flex-col gap-4 sm:flex-row sm:flex-wrap justify-center min-h-48">
					{#each people as person, i (i)}
						<div transition:fly={{ y: 20, duration: 300, delay: i * 50 }}>
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
						</div>
					{/each}
				</div>
			{/key}
			<hr class="w-full" />
			<h1 class="font-semibold text-4xl text-center">Hardcore Simulator</h1>
			<div
				class="flex flex-col items-center gap-4 p-4 bg-ctp-mantle rounded-lg border border-ctp-surface0"
			>
				<div class="flex gap-2 items-center flex-col sm:flex-row">
					Game:
					{#each games as gameName, i (i)}
						<label>
							<input
								type="radio"
								name="games"
								value={gameName}
								bind:group={game}
								onchange={simulateEvents}
								class="accent-ctp-blue"
							/>
							{gameName}
						</label>
					{/each}
				</div>
				<label class="flex items-center gap-2 flex-col sm:flex-row">
					Number of episodes:
					<input
						type="number"
						bind:value={numberOfEpisodes}
						min="1"
						max="30"
						oninput={(event) => {
							const currentTarget = event.currentTarget;

							if (!currentTarget.value) return;

							if (parseInt(currentTarget.value) > 30) {
								currentTarget.value = '30';
								numberOfEpisodes = 30;
							}

							if (parseInt(currentTarget.value) < 1) {
								currentTarget.value = '1';
								numberOfEpisodes = 1;
							}

							simulateEvents();
						}}
						class="border border-ctp-surface0 bg-ctp-crust rounded-md p-2 focus:outline-none"
					/>
					<input
						type="range"
						bind:value={numberOfEpisodes}
						min="1"
						max="30"
						oninput={simulateEvents}
						class="accent-ctp-blue"
					/>
				</label>
				<label class="flex items-center gap-2 flex-col sm:flex-row">
					Chance of death per episode:
					<input
						type="number"
						bind:value={deathOdds}
						min="0"
						max="1"
						step="0.01"
						oninput={(event) => {
							const currentTarget = event.currentTarget;

							if (!currentTarget.value) return;

							if (parseInt(currentTarget.value) > 1) {
								currentTarget.value = '1';
								deathOdds = 1;
							}

							if (parseInt(currentTarget.value) < 0) {
								currentTarget.value = '0';
								deathOdds = 0;
							}

							simulateEvents();
						}}
						class="border border-ctp-surface0 bg-ctp-crust rounded-md p-2 focus:outline-none"
					/>
					<input
						type="range"
						bind:value={deathOdds}
						min="0"
						max="1"
						step="0.01"
						oninput={simulateEvents}
						class="accent-ctp-blue"
					/>
				</label>
				<button onclick={simulateEvents}>Simulate</button>
			</div>
			{#if isSimulationFinished}
				<div class="flex flex-col text-center h-64 overflow-y-auto w-full max-w-lg">
					{#each events as event, i (i)}
						{#if event.eventType === 'death'}
							<div>
								<p>In episode {event.episode}, {event.person} {event.message}.</p>
							</div>
						{:else if event.eventType === 'progression'}
							<p class="font-semibold">{event.message}!</p>
						{:else if event.eventType === 'victory'}
							<p class="font-semibold">{formatPeopleList(survivors)} {event.message}!</p>
						{:else if event.eventType === 'failure'}
							<p class="font-semibold">{event.message}...</p>
						{/if}
					{/each}
				</div>
			{/if}
		{/if}
	</main>
	<hr class="mb-0!" />
	<Footer />
</div>
