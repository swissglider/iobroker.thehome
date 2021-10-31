import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './app';
import theme from '@iobroker/adapter-react/Theme';
import Utils from '@iobroker/adapter-react/Components/Utils';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';

let themeName = Utils.getThemeName();

function build(): void {
	ReactDOM.render(
		<StyledEngineProvider injectFirst>
			<ThemeProvider theme={theme(themeName)}>
				<App
					adapterName="thehome"
					onThemeChange={(_theme) => {
						themeName = _theme;
						build();
					}}
				/>
			</ThemeProvider>
		</StyledEngineProvider>,
		document.getElementById('root'),
	);
}

build();
