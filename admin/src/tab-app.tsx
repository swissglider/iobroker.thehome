import React, { useEffect, useState } from 'react';
import GenericApp from '@iobroker/adapter-react/GenericApp';
import { GenericAppProps, GenericAppSettings } from '@iobroker/adapter-react/types';
import Loader from '@iobroker/adapter-react/Components/Loader';
import I18n from '@iobroker/adapter-react/i18n';
import { Grommet, Tabs, Tab, Box, Main, ResponsiveContext, Menu } from 'grommet';
import { Menu as MenuIcon } from 'grommet-icons';
import BatteryStatus from './app_tabs/BatteryStatus';
import Test from './app_tabs/Test';
import NetatmoReAranger from './app_tabs/NetatmoReAranger';
import GrommetThemeCreator from './helper/GrommetThemeCreator';

type T_Slide_Type = { title: string; child: any }[];
export let GENERIC_APP: GenericApp & { onToast: any; onError: any };

const TabCreator = (): JSX.Element => {
	const [slides, setSlides] = useState<T_Slide_Type>([]);
	const [selectedSlide, setSelectedSlide] = useState<JSX.Element>(<></>);
	const theme = GrommetThemeCreator.createGrommetTheme(GENERIC_APP.state.theme);

	useEffect(() => {
		const _slides: T_Slide_Type = [
			{ title: I18n.t('batterStatus'), child: <BatteryStatus /> },
			{ title: I18n.t('connectionStatus'), child: <>{I18n.t('connectionStatus')}</> },
			{ title: I18n.t('miNames'), child: <>{I18n.t('miNames')}</> },
			{ title: I18n.t('netatmoReAranger'), child: <NetatmoReAranger /> },
			{ title: I18n.t('test'), child: <Test /> },
		];
		setSlides(_slides);
		setSelectedSlide(_slides[0].child);
		return () => {
			t: 't';
		};
	}, []);

	return (
		<>
			{!GENERIC_APP.state.loaded ? (
				<Loader theme={GENERIC_APP.state.themeType} />
			) : (
				<Grommet theme={theme} themeMode={GENERIC_APP.state.themeType as 'dark' | 'light'} full={true}>
					<ResponsiveContext.Consumer>
						{(size) => (
							<Main pad="none" margin="none">
								{['xsmall', 'small', 'medium'].includes(size.toString()) ? (
									<>
										<Menu
											margin="none"
											dropProps={{
												align: { top: 'bottom', left: 'left' },
												elevation: 'small',
											}}
											icon={<MenuIcon color="brand" />}
											items={slides.map((slide) => ({
												label: slide.title,
												onClick: () => {
													setSelectedSlide(slide.child);
												},
											}))}
										/>
										<Box align="center" pad="none" margin="none">
											{selectedSlide}
										</Box>
									</>
								) : (
									<Tabs margin="none">
										{slides.map((slide) => (
											<Tab key={slide.title} title={slide.title}>
												<Box align="center" pad="none" margin="none">
													{slide.child}
												</Box>
											</Tab>
										))}
									</Tabs>
								)}
							</Main>
						)}
					</ResponsiveContext.Consumer>
				</Grommet>
			)}
		</>
	);
};

class TabApp extends GenericApp {
	constructor(props: GenericAppProps) {
		const extendedProps: GenericAppSettings = {
			...props,
			bottomButtons: false,
			encryptedFields: [],
			translations: {
				en: require('./i18n/en.json'),
				de: require('./i18n/de.json'),
				ru: require('./i18n/ru.json'),
				pt: require('./i18n/pt.json'),
				nl: require('./i18n/nl.json'),
				fr: require('./i18n/fr.json'),
				it: require('./i18n/it.json'),
				es: require('./i18n/es.json'),
				pl: require('./i18n/pl.json'),
				'zh-cn': require('./i18n/zh-cn.json'),
			},
		};
		super(props, extendedProps);
		this.onError = this.onError.bind(this);
		this.onToast = this.onToast.bind(this);
		GENERIC_APP = this;
	}

	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	onError(text): void {
		try {
			this.setState({
				errorText: (text || text === 0) && typeof text !== 'string' ? text.toString() : text,
			});
		} catch (error) {
			console.error(error, 'Message: ' + text.toString());
		}
	}

	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	onToast(text): void {
		try {
			this.setState({
				toast: (text || text === 0) && typeof text !== 'string' ? text.toString() : text,
			});
		} catch (error) {
			console.error(error, 'Message: ' + text.toString());
		}
	}

	render(): JSX.Element {
		return (
			<>
				<TabCreator />
				{this.renderError()}
				{this.renderToast()}
			</>
		);
	}
}

export default TabApp;
