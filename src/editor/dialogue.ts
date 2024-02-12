import { syntaxTree } from '@codemirror/language';
import { RangeSetBuilder, StateField } from '@codemirror/state';
import {
	Decoration,
	DecorationSet,
	EditorView,
	WidgetType,
} from '@codemirror/view';
import { setIcon, setTooltip } from 'obsidian';
import { DialogueState } from 'src/@types';

export class DialogueWidget extends WidgetType {
	constructor(readonly state: DialogueState) {
		super();
	}

	eq(widget: DialogueWidget): boolean {
		return widget.state === this.state;
	}

	toDOM(view: EditorView): HTMLElement {
		const lines = this.state.lines;
		const character = lines.shift()?.replace('@', '');

		const container = createDiv({
			cls: 'cm-embed-block cm-dialogue',
			attr: { tabindex: -1 },
		});

		const block = container.createDiv('rpg-dialogue');
		block.createSpan({ cls: 'dialogue-name', text: character });
		const content = block.createSpan('dialogue-content');

		const btn = container.createDiv('edit-block-button');
		setIcon(btn, 'lucide-code-2');
		setTooltip(btn, 'Edit this Block');
		btn.addEventListener('click', () => {
			DialogueWidget.selectElement(view, this, block);
		});

		container.addEventListener('click', () => {
			DialogueWidget.selectElement(view, this, block);
		});

		for (const line of lines) {
			const pNode = content.createEl('p', { text: line });

			const regex = /^([\S\s]*)(\([A-Za-z]*\))([\S\s]*)/;
			const match = line.match(regex);
			if (!match) continue;
			const parens = createSpan({
				cls: 'dialogue-parenthetical',
				text: match[2],
			});

			pNode.replaceChildren(match[1], parens, match[3]);
		}

		return container;
	}

	static selectElement(
		view: EditorView,
		owner: DialogueWidget,
		el: HTMLElement
	) {
		let start = owner.state.from;
		let end = owner.state.to;

		if (start < 0 || end < 0) {
			try {
				const pos = view.posAtDOM(el);
				view.dispatch({
					selection: { head: pos, anchor: pos },
					scrollIntoView: true,
				});
				view.focus();
			} catch (e) {}
		} else {
			view.focus();
			try {
				view.dispatch({
					selection: { head: start, anchor: end },
					scrollIntoView: true,
				});
			} catch (e) {}
		}
	}
}

export const dialogueField = StateField.define<DecorationSet>({
	create(state) {
		return Decoration.none;
	},
	update(value, transaction) {
		// console.debug(value);
		const builder = new RangeSetBuilder<Decoration>();

		let isInRange = false;
		let isDialogue = false;
		let isDone = false;
		const state: DialogueState = {
			from: 0,
			to: 0,
			lines: [],
		};

		syntaxTree(transaction.state).iterate({
			enter(node) {
				const cursor = transaction.state.selection.ranges[0];

				if (node.type.is('HyperMD-quote_HyperMD-quote-1')) {
					const text = transaction.state.sliceDoc(node.from, node.to);

					if (text.startsWith('> @')) {
						state.from = node.from;
						isDialogue = true;
					} else {
						return true;
					}
				}

				if (isDialogue && node.type.is('quote_quote-1')) {
					const text = transaction.state.sliceDoc(node.from, node.to);
					const nextLine = transaction.state.doc.lineAt(node.to + 1);
					state.to = node.to;
					state.lines.push(text);

					if (nextLine && nextLine.length === 0) {
						isDialogue = false;
						isDone = true;
					}
				}

				isInRange = cursor.from >= state.from && cursor.to <= state.to;
				if (isInRange) return false;
			},
		});

		if (!isInRange && isDone) {
			builder.add(
				state.from,
				state.to,
				Decoration.replace({
					widget: new DialogueWidget(state),
					block: true,
				})
			);
			isDone = false;
		}

		return builder.finish();
	},
	provide(field) {
		return EditorView.decorations.from(field);
	},
});
