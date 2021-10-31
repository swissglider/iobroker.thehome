import { ThemeType } from 'grommet';

export const subTabsTheme: ThemeType = {
	global: {
		elevation: {
			light: {
				none: 'none',
				xsmall: '0px 1px 2px rgba(100, 100, 100, 0.50)',
				small: '0px 2px 4px rgba(100, 100, 100, 0.50)',
				medium: '0px 3px 8px rgba(100, 100, 100, 0.50)',
				large: '0px 6px 12px rgba(100, 100, 100, 0.50)',
				xlarge: '0px 8px 16px rgba(100, 100, 100, 0.50)',
			},
			dark: {
				none: 'none',
				xsmall: '0px 12px 19px -18px rgba(255, 255, 255, 0.8)',
				small: '0px 4px 4px rgba(255, 255, 255, 0.40)',
				medium: '0px 6px 8px rgba(255, 255, 255, 0.40)',
				large: '0px 8px 16px rgba(255, 255, 255, 0.40)',
				xlarge: '0px 10px 24px rgba(255, 255, 255, 0.40)',
			},
		},
	},
	tab: {
		border: {
			side: 'bottom',
			size: 'small',
			color: 'background',
			active: {
				color: 'background',
			},
			hover: {
				color: 'background',
				// extend: undefined,
			},
		},
		margin: 'xxsmall',
		pad: 'xsmall',
	},
};
