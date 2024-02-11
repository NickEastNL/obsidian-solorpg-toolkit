import {
	Plugin,
	App,
	MarkdownPostProcessorContext,
	MarkdownRenderer,
} from 'obsidian';
import { Token } from 'src/@types';

function parser(source: string) {
	const lines = source.replace(/^\s*/, '').split(/\n/);

	let index = -1;
	let isDialogue = false;
	let isAction = false;
	const tokens: Token[] = [];
	for (const line of lines) {
		index++;

		if (line.length > 0 && index === 0) {
			tokens.push({ type: 'character', text: line });
			isDialogue = true;
			isAction = false;
			continue;
		}

		if (line.length > 0 && line.startsWith('@')) {
			const text = line.match(/^@[^\S]*(.*)/)[1];
			tokens.push({ type: 'character', text });
			isDialogue = true;
			isAction = false;
			continue;
		}

		if (line.length > 0 && line.startsWith('!')) {
			const text = line.match(/^![^\S]*(.*)/)[1];
			tokens.push({ type: 'action', text });
			isDialogue = false;
			isAction = true;
			continue;
		}

		if (line === '') {
			if (isDialogue) {
				tokens.push({ type: 'dialogue', text: line });
			}
			if (isAction) {
				tokens.push({ type: 'action', text: line });
			}
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
	const tokens = parser(source);

	const render = async (text: string) => {
		const el = createDiv();
		await MarkdownRenderer.render(plugin.app, text, el, source, plugin);
		return el.innerHTML;
	};

	let html = '';
	let isDialogue = false;
	let currentName = '';
	let currentBody = '';
	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];

		if (token.type === 'character') {
			currentName = token.text;
			isDialogue = true;
			continue;
		}

		if (isDialogue) {
			if (token.type === 'dialogue') {
				const nextToken = tokens[i + 1];

				if (nextToken?.type === 'dialogue') {
					currentBody += `${token.text}\n\n`;
				} else {
					currentBody += token.text;
					currentBody = await render(currentBody);

					const container = createDiv('rpg-dialogue');
					container.createSpan('dialogue-name').setText(currentName);
					container.createSpan('dialogue-content').innerHTML =
						currentBody;
					html += container.outerHTML;
					currentName = '';
					currentBody = '';
					isDialogue = false;
				}
				continue;
			}
		}

		if (token.type === 'action') {
			const nextToken = tokens[i + 1];

			if (nextToken?.type === 'action') {
				currentBody += `${token.text}\n`;
			} else {
				currentBody += token.text;
				currentBody = await render(currentBody);
				html += currentBody;
				currentBody = '';
			}
			continue;
		}
	}
	console.debug(html);
	el.innerHTML = html;
}
