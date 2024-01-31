import {
	Plugin,
	App,
	MarkdownPostProcessorContext,
	MarkdownRenderer,
} from 'obsidian';

export async function dialogueProcessor(
	plugin: Plugin,
	source: string,
	el: HTMLElement,
	ctx: MarkdownPostProcessorContext
) {
	const data = source.match(/^(.*)\n([\s\S]*)/);

	const container = el.createDiv('rpg-dialogue');
	container.createSpan('dialogue-name').setText(data[1]);
	const content = container.createSpan('dialogue-content');

	MarkdownRenderer.render(
		plugin.app,
		data[2],
		content,
		ctx.sourcePath,
		plugin
	);
}
