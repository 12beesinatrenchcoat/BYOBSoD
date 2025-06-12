import {defineConfig} from "eslint/config";
import xoBrowser from "eslint-config-xo/browser";

export default defineConfig([
	...xoBrowser,
	{
		rules: {
			quotes: ["error", "double"],
			"@stylistic/quotes": ["error", "double"],
		},
	},
]);
