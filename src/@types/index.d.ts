export interface RpgPluginSettings {
	customResults: Record<string, CustomResult>;
}

export interface CustomResult {
	id: string;
	color: string;
}

export interface Token {
	type: string;
	text: string;
}

export interface DialogueState {
	from: number;
	to: number;
	lines: string[];
}

// Old types that need reorganizing

export interface RawRollBlock {
	isSeperator?: boolean;
	description?: string;
	rollData?: string[];
}

/**
 * `[type, formula, result, target, outcome]`
 */
export type PfRollData = [string, string, string, string, string];

/**
 * [type, formula, TN, successes, difficulty]
 */
export type M2RollData = [string, string, number, number, number];
