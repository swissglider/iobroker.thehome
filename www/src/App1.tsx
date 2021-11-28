import React, { FC, useEffect } from 'react';

import GrommetThemeCreator from './helper/GrommetThemeCreator';
import { Grommet, ResponsiveContext } from 'grommet';
import { RecoilRoot, useRecoilState, useSetRecoilState } from 'recoil';
import Skeleton from './skeleton'
import { themeModeState, totalHeightState, totalWidthState } from './helper/AtomAndSelectors'
import { BrowserRouter as Router } from 'react-router-dom';

type T_App_Props = {
	adapterName: any,
	socket: any
}

const TabCreator = (): JSX.Element => {

	const [themeMode, setThemeMode] = useRecoilState(themeModeState);
	const setTotalHeight = useSetRecoilState(totalHeightState);
	const setTotalWidth = useSetRecoilState(totalWidthState);

	const theme = GrommetThemeCreator.createGrommetTheme();

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
		<Grommet theme={theme} themeMode={themeMode} full={true}>
			<ResponsiveContext.Consumer>
				{(size) => (size)
					? (
						<div>Velo</div>
					) : (
						<div>Hallo</div>
					)
				}
			</ResponsiveContext.Consumer>
		</Grommet >
	);
};

const App: FC<T_App_Props> = (): JSX.Element => {

	return (
		<Router>
			<RecoilRoot>
				<TabCreator />
			</RecoilRoot>
		</Router>)
}

export default App;
