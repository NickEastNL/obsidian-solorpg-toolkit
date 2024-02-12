import { MarkdownView, Plugin } from 'obsidian';

import { CustomResult, RpgPluginSettings } from './@types';
import { rollProcessor } from './markdown/roll';
import { dialogueCodeProcessor, dialogueProcessor } from './markdown/dialogue';
import { dialogueField } from './editor/dialogue';

import { RpgSettingTab } from './settings';

export const DEFAULT_SETTINGS: RpgPluginSettings = {
	customResults: {},
};

export default class RpgPlugin extends Plugin {
	data: RpgPluginSettings;

	async onload() {
		console.log('Loading Solo RPG Toolkit plugin.');

		await this.loadSettings();
		this.addSettingTab(new RpgSettingTab(this.app, this));

		this.registerMarkdownCodeBlockProcessor('rpg-roll', (source, el, ctx) =>
			rollProcessor(this, source, el, ctx)
		);

		this.registerMarkdownCodeBlockProcessor(
			'rpg-dialogue',
			(source, el, ctx) => dialogueCodeProcessor(this, source, el, ctx)
		);

		this.registerMarkdownPostProcessor((el, ctx) =>
			dialogueProcessor(el, ctx)
		);
	}

	async onunload() {
		console.log('Unloading Solo RPG Toolkit plugin.');
	}

	async loadSettings() {
		this.data = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.data);
	}

	async addResultFormat(style: CustomResult) {
		this.data.customResults = {
			...this.data.customResults,
			[style.id]: style,
		};

		this.refreshView();
		await this.saveSettings();
	}

	async removeResultFormat(style: CustomResult) {
		if (this.data.customResults[style.id]) {
			delete this.data.customResults[style.id];
		}

		this.refreshView();
		await this.saveSettings();
	}

	refreshView() {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		const scroll = view.previewMode.getScroll();
		view.previewMode.rerender(true);
		setTimeout(() => view.previewMode.applyScroll(scroll), 10);
		view.editor.refresh();
	}
}
