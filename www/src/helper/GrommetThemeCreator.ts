import { grommet, ThemeType } from 'grommet';
import { deepMerge } from 'grommet/utils';

const createGrommetTheme = (): ThemeType => {
	const returnTheme = deepMerge(grommet, {
		global: {
			breakpoints: {
				xsmall: {
					value: 300,
				},
				small: {
					value: 600,
				},
				medium: {
					value: 900,
				},
				large: {
					value: 1800,
				},
				xlarge: {
					value: 3000,
				},
			},
		},
		table: {
			body: {
				border: 'horizontal',
				color: 'red',
				background: {
					color: 'headerBorder',
					opacity: 'strong',
				},
			},
			// extend: () => `color:red`,
			footer: {
				align: 'start',
				border: undefined,
				pad: { horizontal: 'large', vertical: 'small' },
				verticalAlign: 'bottom',
			},
			header: {
				border: 'bottom',
				fill: 'horizontal',
				pad: { horizontal: 'large', vertical: 'xsmall' },
				verticalAlign: 'bottom',
				background: {
					color: 'accent-1',
					opacity: 'strong',
				},
			},
		},
		tab: { border: { color: { dark: 'brand' } } },
	});
	return returnTheme;
};

const GrommetThemeCreator = {
	createGrommetTheme: createGrommetTheme,
};

export default GrommetThemeCreator;
