import {
	Plugin,
	App,
	MarkdownPostProcessorContext,
	MarkdownRenderer,
} from 'obsidian';
import { Token } from 'src/@types';

function parser(source: string) {
	const lines = source.split(/\n/);

	let isDialogue = false;
	let isAction = false;
	let newLinesBefore = 0;
	const tokens: Token[] = [];
	for (const line of lines) {
		if (line.length > 0 && line.startsWith('@')) {
			const text = line.match(/^@[^\S]*(.*)/)[1];
			tokens.push({ type: 'character', text });
			isDialogue = true;
			isAction = false;
			newLinesBefore = 0;
			continue;
		}

		if (line.length > 0 && line.startsWith('!')) {
			const text = line.match(/^![^\S]*(.*)/)[1];
			tokens.push({ type: 'action', text });
			isDialogue = false;
			isAction = true;
			newLinesBefore = 0;
			continue;
		}

		if (line === '') {
			continue;
		}

		if (isDialogue) {
			const text = line.replace(
				/^\s*(\(\S+\))/,
				'<span class="dialogue-parenthetical">$1</span>'
			);
			tokens.push({ type: 'dialogue', text });
			continue;
		}

		if (isAction) {
			tokens.push({ type: 'action', text: line });
			continue;
		}
	}

	return tokens;
}

export async function dialogueProcessor(
	plugin: Plugin,
	source: string,
	el: HTMLElement,
	ctx: MarkdownPostProcessorContext
) {
	const data = source.match(/^(.*)\n([\s\S]*)/);

	const tokens = parser(source);

	const render = async (text: string) => {
		const el = createDiv();
		await MarkdownRenderer.render(plugin.app, text, el, source, plugin);
		return el.innerHTML;
	};

	let html = '';
	let currentBlock = null;
	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];

		if (token.type === 'character') {
			currentBlock = {
				name: token.text,
				content: '',
			};
			continue;
		}

		if (currentBlock) {
			if (token.type === 'dialogue') {
				const nextToken = tokens[i + 1];

				if (nextToken?.type === 'dialogue') {
					currentBlock.content += `${token.text}\n\n`;
				} else {
					currentBlock.content += `${token.text}`;
					currentBlock.content = await render(currentBlock.content);

					const container = createDiv('rpg-dialogue');
					container
						.createSpan('dialogue-name')
						.setText(currentBlock.name);
					container.createSpan('dialogue-content').innerHTML =
						currentBlock.content;
					html += container.outerHTML;
					currentBlock = null;
				}
				continue;
			}
		}

		if (token.type === 'action') {
			html += await render(token.text);
		}
	}

	el.innerHTML = html;
}
