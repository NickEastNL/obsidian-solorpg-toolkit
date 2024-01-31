import { App, Modal, PluginSettingTab, Setting, TextComponent } from 'obsidian';
import { CustomResult } from './@types';
import RpgPlugin from './main';

export class RpgSettingTab extends PluginSettingTab {
	customResultsEl: HTMLDivElement;

	constructor(app: App, public plugin: RpgPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		let { containerEl } = this;

		containerEl.empty();
		const settingEl = containerEl.createDiv('solo-toolkit-settings');

		new Setting(settingEl)
			.setName('Result Styles')
			.setDesc('Style rules for custom results.')
			.addButton((button) => {
				button
					.setTooltip('Add rule')
					.setButtonText('+')
					.onClick(async () => {
						let modal = new SettingsModal(this.plugin);

						modal.onClose = async () => {
							if (modal.saved) {
								const style: CustomResult = {
									id: modal.id,
									color: modal.color,
								};

								this.plugin.addResultFormat(style);

								this.display();
							}
						};

						modal.open();
					});
			});

		this.customResultsEl = settingEl.createDiv();
		this.customResultsEl.empty();

		for (const style of Object.values(this.plugin.data.customResults)) {
			const setting = new Setting(this.customResultsEl);

			const resultEl = window.createDiv('custom-result-item');

			const valueEl = resultEl.createSpan('custom-result-label');
			valueEl.setCssStyles({ color: style.color });
			valueEl.setText(style.id);

			setting.infoEl.replaceWith(resultEl);

			setting
				.addExtraButton((b) => {
					b.setIcon('pencil')
						.setTooltip('Edit')
						.onClick(() => {
							let modal = new SettingsModal(this.plugin, style);

							modal.onClose = async () => {
								if (modal.saved) {
									const style: CustomResult = {
										id: modal.id,
										color: modal.color,
									};

									this.plugin.addResultFormat(style);

									this.display();
								}
							};

							modal.open();
						});
				})
				.addExtraButton((b) => {
					b.setIcon('trash')
						.setTooltip('Delete')
						.onClick(() => {
							this.plugin.removeResultFormat(style);
							this.display();
						});
				});
		}
	}
}

class SettingsModal extends Modal {
	id: string = '';
	color: string = '';
	editing: boolean = false;
	saved: boolean = false;

	constructor(public plugin: RpgPlugin, style?: CustomResult) {
		super(plugin.app);

		if (style) {
			this.editing = true;
			this.id = style.id;
			this.color = style.color;
		}
	}

	onOpen() {
		this.display();
	}

	async display() {
		this.titleEl.setText(`${this.editing ? 'Edit' : 'Add'} Style`);
		let { contentEl } = this;

		contentEl.empty();
		const idDiv = contentEl.createDiv();
		new Setting(idDiv)
			.setName('Label')
			.setDesc(
				'This is the case-insenstive label to\nfind in the result text.'
			)
			.addText((text) => {
				text.setValue(this.id).onChange((v) => {
					this.id = v;
				});
			});

		const colorDiv = contentEl.createDiv();
		new Setting(colorDiv).setName('Color').addText((text) => {
			text.inputEl.setAttribute('type', 'color');

			text.setValue(this.color).onChange((v) => {
				this.color = v;
			});
		});

		const footerEl = contentEl.createDiv();
		const footerButtons = new Setting(footerEl);
		footerButtons.addButton((button) => {
			button
				.setTooltip('Save')
				.setIcon('checkmark')
				.onClick(async () => {
					this.saved = true;
					this.close();
				});
		});
		footerButtons.addExtraButton((button) => {
			button.setIcon('cross').onClick(() => {
				this.saved = false;
				this.close();
			});
		});
	}
}
