<template lang="pug">
.roll-data.m2d20
	span {{ formula }}
	|  vs TN 
	span.roll-data__target {{ TN }}
	|  | Difficulty 
	span.roll-data__target {{ difficulty }}
	|  |  
	span.roll-data__result {{ successes }}
	|  Successes | 
	span.roll-data__outcome(:class="outcomeCls") {{ outcome }}
	|  (+{{ momentum }} Momentum)
</template>

<script setup lang="ts">
const props = defineProps<{ data: M2RollData }>();

const [type, formula, TN, successes, difficulty] = props.data;

const success = successes >= difficulty;
const outcome = success ? 'Succeeds' : 'Fails';
const momentum = Math.max(successes - difficulty, 0);

let outcomeCls = 'outcome-fail';
if (success) outcomeCls = 'outcome-succeeds';
</script>

<style lang="scss">
.m2d20 {
	.outcome-fail {
		color: var(--color-red);
	}

	.outcome-succeeds {
		color: var(--color-green);
	}
}
</style>
