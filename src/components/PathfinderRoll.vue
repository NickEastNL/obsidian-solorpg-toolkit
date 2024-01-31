<template lang="pug">
.roll-data.pf2e
	span {{ formula }}
	|  = 
	span.roll-data__result {{ result }}
	template(v-if="type === 'A'")
		|  vs AC 
		span.roll-data__target {{ target }}
		|  | 
		span.roll-data__outcome(:class="'outcome-' + outcome.toLowerCase()") {{ outcomeFull }}
</template>

<script setup lang="ts">
const props = defineProps<{ data: PfRollData }>();

const [type, formula, result, target, outcome] = props.data;

const positiveOutcomes = new Map([
	['m', 'Miss'],
	['h', 'Hit'],
	['cm', 'Critical Miss'],
	['ch', 'Critical Hit'],
]);

let outcomeFull = '';
if (type === 'A') {
	outcomeFull = positiveOutcomes.get(outcome.toLowerCase());
}
</script>

<style lang="scss">
.pf2e {
	.outcome-m,
	.outcome-cm {
		color: var(--color-red);
	}

	.outcome-h,
	.outcome-ch {
		color: var(--color-green);
	}
}
</style>
