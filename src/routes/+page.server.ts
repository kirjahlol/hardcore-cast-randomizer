import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const url = 'https://hardcore.wiki/w/api.php';

	const urlSearchParams = new URLSearchParams({
		action: 'query',
		list: 'categorymembers',
		cmtitle: 'Category:People',
		cmlimit: 'max',
		format: 'json',
		origin: '*'
	});

	const allMembers = [];
	let hasMoreMembers = true;

	try {
		while (hasMoreMembers) {
			const response = await fetch(`${url}?${urlSearchParams.toString()}`);

			if (!response.ok) {
				throw error(response.status, 'Failed to fetch data from wiki');
			}

			const data = await response.json();

			const batchMembers = data.query?.categorymembers || [];
			allMembers.push(...batchMembers);

			if (data.continue && data.continue.cmcontinue) {
				urlSearchParams.set('cmcontinue', data.continue.cmcontinue);
			} else {
				hasMoreMembers = false;
			}
		}

		return {
			members: allMembers
		};
	} catch (error) {
		console.error('Error while fetching data from wiki:', error);
		return {
			members: [],
			error: 'Could not load wiki category members.'
		};
	}
};
