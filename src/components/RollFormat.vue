<template lang="pug">
.roll
	template(v-for="(b,i) in rawBlocks" :key="i")
		template(v-if="b.isSeperator")
			hr.separator
		template(v-else)
			.roll-description
				| {{ b.description }}

			component(
				:is='game + "Roll"'
				:data='b.rollData'
			)
</template>

<script setup lang="ts">
const props = defineProps<{
	data: string;
}>();

const games = new Map([
	['PF', 'Pathfinder'],
	['M2', 'M2d20'],
]);

const lines = props.data.trim().split('\n');
const game = games.get(lines.shift());

const rawBlocks: RawRollBlock[] = [];
for (let l = 0; l < lines.length; l++) {
	const isSeparator = lines[l].startsWith('-');

	let dataBlock: RawRollBlock = {};
	if (isSeparator) {
		dataBlock.isSeperator = true;
		rawBlocks.push(dataBlock);
	} else {
		const raw = lines[l + 1].split(';').map((val) => val.trim());
		const rollData = raw as PfRollData;
		dataBlock = {
			description: lines[l],
			rollData,
		};

		rawBlocks.push(dataBlock);
		l++; //Increment to skip next line
	}
}
</script>

<style lang="scss">
.block-language-rpg-roll {
	margin-top: 15px;
}

.roll {
	padding: var(--size-2-2) var(--size-4-2);
	border: 1px solid var(--color-base-30);
	font-size: var(--font-small);

	&-description {
		font-style: italic;
	}

	&-data {
		&__result,
		&__target {
			font-weight: var(--bold-weight);
			color: var(--color-accent);
		}

		&__outcome {
			font-weight: var(--bold-weight);
		}

		.success {
			color: var(--color-green);
		}

		.failure {
			color: var(--color-red);
		}
	}

	.separator {
		margin: 0.5em 0;
	}
}
</style>
