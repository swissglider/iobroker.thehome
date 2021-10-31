import { Theme } from '@iobroker/adapter-react/types';
import { grommet, ThemeType } from 'grommet';
import { deepMerge } from 'grommet/utils';

const createGrommetTheme = (ioBrokerMUITheme: Theme): ThemeType => {
	const returnTheme = deepMerge(grommet, {
		global: {
			colors: {
				background: ioBrokerMUITheme.palette.background.paper,
				// brand: {
				// 	light: ioBrokerMUITheme.palette.primary.light,
				// 	dark: ioBrokerMUITheme.palette.primary.dark,
				// },
				brand: ioBrokerMUITheme.palette.primary,
				control: {
					light: 'brand',
					dark: 'brand',
				},
				'accent-1': ioBrokerMUITheme.palette.secondary,
				// header:
				// 	ioBrokerMUITheme.overrides?.MuiAppBar?.colorDefault?.backgroundColor ??
				// 	ioBrokerMUITheme.palette.background.paper,
				headerBorder:
					ioBrokerMUITheme.overrides?.MuiAppBar?.colorDefault?.backgroundColor ??
					ioBrokerMUITheme.palette.background.paper,
				'status-error': ioBrokerMUITheme.palette.error,
				'status-warning': ioBrokerMUITheme.palette.warning,
				'status-success': ioBrokerMUITheme.palette.success,
				'status-info': ioBrokerMUITheme.palette.info,
			},
			breakpoints: {
				xsmall: {
					value: 300,
				},
				small: {
					value: ioBrokerMUITheme.breakpoints.values.sm,
				},
				medium: {
					value: ioBrokerMUITheme.breakpoints.values.md,
				},
				large: {
					value: ioBrokerMUITheme.breakpoints.values.lg,
				},
				xlarge: {
					value: ioBrokerMUITheme.breakpoints.values.xl,
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
