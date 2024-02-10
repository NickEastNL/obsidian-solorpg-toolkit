import { MarkdownPostProcessorContext, parseYaml } from 'obsidian';

import RpgPlugin from 'src/main';

interface RollData {
	type: string;
	formula: string;
	total: string;
	target: string;
	result: string;
	outcome: string;
}

export async function rollProcessor(
	plugin: RpgPlugin,
	source: string,
	el: HTMLElement,
	ctx: MarkdownPostProcessorContext
) {
	const data: RollData = parseYaml(source) || {};

	const container = el.createDiv('rpg-roll');
	container.createSpan('roll-type').setText(data.type || '');
	container.createSpan('roll-formula').setText(data.formula || '');

	const comparison = container.createSpan('roll-comparison');
	comparison.createEl('label').setText('Target:');
	comparison.createSpan('roll-total').setText(data.total || '');
	comparison.createSpan('roll-icon').innerHTML =
		'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>';
	comparison.createSpan('roll-target').setText(data.target || '');

	if (data.result) {
		const customResults = plugin.data.customResults;

		const choices = [
			'fail',
			'succeed',
			'fails',
			'succeeds',
			'failure',
			'success',
		];
		const resultClass =
			choices.find((r) => data.result.toLowerCase().includes(r)) || '';

		const resultColor = Object.values(customResults).reduce((color, r) => {
			if (data.result.toLowerCase().includes(r.id.toLowerCase()))
				return r.color;
		}, '');
		const result = container.createSpan(`roll-result ${resultClass}`);
		if (resultColor) result.setCssStyles({ color: resultColor });
		result.setText(data.result);
	}

	if (data.outcome)
		container.createSpan('roll-outcome').setText(data.outcome);
}
