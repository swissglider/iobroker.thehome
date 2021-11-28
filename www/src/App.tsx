import React, { useEffect, useState } from 'react';

import GenericApp from '@iobroker/adapter-react/GenericApp';
import { GenericAppProps, GenericAppSettings } from '@iobroker/adapter-react/types';
import GrommetThemeCreator from './helper/GrommetThemeCreator';
import Loader from '@iobroker/adapter-react/Components/Loader';
import { Grommet, ResponsiveContext } from 'grommet';
import BatteryStatus from './pages/BatteryStatus';
import { T_GenericApp } from './types/T_GenericApp';
import { RecoilRoot, useRecoilState, useSetRecoilState } from 'recoil';
import Skeleton from './skeleton'
import { themeModeState, totalHeightState, totalWidthState } from './helper/AtomAndSelectors'
import { BrowserRouter as Router } from 'react-router-dom';

type T_Slide_Type = { title: string; child: any }[];

let GENERIC_APP: T_GenericApp;

const TabCreator = (): JSX.Element => {
	const [slides, setSlides] = useState<T_Slide_Type>([]);
	const [selectedSlide, setSelectedSlide] = useState<JSX.Element>(<></>);

	const [themeMode, setThemeMode] = useRecoilState(themeModeState);
	const setTotalHeight = useSetRecoilState(totalHeightState);
	const setTotalWidth = useSetRecoilState(totalWidthState);

	const theme = GrommetThemeCreator.createGrommetTheme();

	useEffect(() => {
		const _slides: T_Slide_Type = [
			// { title: I18n.t('batterStatus'), child: <BatteryStatus /> },
			// { title: I18n.t('connectionStatus'), child: <>{I18n.t('connectionStatus')}</> },
			// { title: I18n.t('miNames'), child: <>{I18n.t('miNames')}</> },
			// { title: I18n.t('netatmoReAranger'), child: <NetatmoReAranger /> },
			// { title: I18n.t('test'), child: <Test /> },

			{ title: "batterStatus", child: <BatteryStatus genericApp={GENERIC_APP} /> },
			{ title: "connectionStatus", child: <>connectionStatus</> },
			{ title: "miNames", child: <>miNames</> },
			{ title: "netatmoReAranger", child: <>netatmoReAranger</> },
			{ title: "test", child: <>test</> },

		];
		setSlides(_slides);
		setSelectedSlide(_slides[0].child);



	}, []);

	useEffect(() => {
		/**
		 *  set environment varables
		 */

		// set Mode
		const darkMode = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
		// setThemeMode(darkMode ? 'dark' : 'light');
		setThemeMode('light');

		// set Size
		setTotalWidth(Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0));
		setTotalHeight(Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0));

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [window.matchMedia]);

	return (
		<>
			{!GENERIC_APP.state.loaded ? (
				<Loader theme={themeMode} />
			) : (
				<Grommet theme={theme} themeMode={themeMode} full={true}>
					<ResponsiveContext.Consumer>
						{(size) => (size)
							? (
								<Skeleton genericApp={GENERIC_APP} />
							) : (
								<div>Hallo</div>
							)
						}
					</ResponsiveContext.Consumer>
				</Grommet >
			)
			}
		</>
	);
};

class App extends GenericApp {
	constructor(props: GenericAppProps) {
		try {
			const extendedProps: GenericAppSettings = {
				...props,
				bottomButtons: false,
				encryptedFields: [],
				translations: {
					en: require('./i18n/en.json'),
					de: require('./i18n/de.json'),
				},
			};
			super(props, extendedProps);
			this.onSave = this.onSave.bind(this);
			this.onLoadConfig = this.onLoadConfig.bind(this);
			this.onError = this.onError.bind(this);
			this.onToast = this.onToast.bind(this);
			GENERIC_APP = this;
		} catch (error) {
			console.error(error)
		}

	}

	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	onError(text: any): void {
		try {
			this.setState({
				errorText: (text || text === 0) && typeof text !== 'string' ? text.toString() : text,
			});
		} catch (error) {
			console.error(error, 'Message: ' + text.toString());
		}
	}

	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	onToast(text: any): void {
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
			<Router basename="/thehome">
				<RecoilRoot>
					<TabCreator />
					{this.renderError()}
					{this.renderToast()}
				</RecoilRoot>
			</Router>
		);
	}
}

export default App;
