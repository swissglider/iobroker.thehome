import React from 'react';
import { Theme, withStyles, MuiThemeProvider } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import GenericApp from '@iobroker/adapter-react/GenericApp';
import Settings from './components/settings';
import { GenericAppProps, GenericAppSettings } from '@iobroker/adapter-react/types';
import Loader from '@iobroker/adapter-react/Components/Loader';
import { StyleRules } from '@material-ui/core/styles';
import I18n from '@iobroker/adapter-react/i18n';
import StateConfig from './tabs/StateConfig';
import Logo from '@iobroker/adapter-react/Components/Logo';
import SingleStateConfigForm from './tabs/SingleStateConfig';
import ResetNames from './tabs/ResetNames';
import InfluxDBHandler from './tabs/InfluxDBHandler';

const styles = (_theme: Theme): StyleRules => ({
	root: {},
	tabContent: {
		padding: 10,
		height: 'calc(100% - 64px - 48px - 20px)',
		overflow: 'auto',
	},
	tabContentIFrame: {
		padding: 10,
		height: 'calc(100% - 64px - 48px - 20px - 38px)',
		overflow: 'auto',
	},
});

class App extends GenericApp {
	constructor(props: GenericAppProps) {
		const extendedProps: GenericAppSettings = {
			...props,
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
	}

	onConnectionReady(): void {
		// executed when connection is ready
	}

	getSelectedTab() {
		const tab = this.state.selectedTab;
		if (!tab || tab === 'options') {
			return 0;
		} else if (tab === 'stateConfig') {
			return 1;
		} else if (tab === 'singleStateUpload') {
			return 2;
		} else if (tab === 'resetNames') {
			return 3;
		} else if (tab === 'influxDBHandler') {
			return 4;
		}
	}

	onError = (text) =>
		this.setState({
			errorText: (text || text === 0) && typeof text !== 'string' ? text.toString() : text,
		});

	onToast = (text) =>
		this.setState({
			toast: (text || text === 0) && typeof text !== 'string' ? text.toString() : text,
		});

	render() {
		if (!this.state.loaded) {
			return (
				<MuiThemeProvider theme={this.state.theme}>
					<Loader theme={this.state.themeType} />
				</MuiThemeProvider>
			);
		}
		return (
			<MuiThemeProvider theme={this.state.theme}>
				<div
					className="App"
					style={{
						background: this.state.theme.palette.background.default,
						color: this.state.theme.palette.text.primary,
					}}
				>
					<Logo
						instance={this.instance}
						classes={{ buttons: '', logo: '' }}
						common={this.common}
						native={this.state.native}
						onError={(text) => alert(text)}
						onLoad={(native) => this.onLoadConfig(native)}
					/>
					<AppBar position="static">
						<Tabs
							value={this.getSelectedTab()}
							onChange={(e, index) => this.selectTab(e.target.parentNode.dataset.name, index)}
							scrollButtons="auto"
						>
							<Tab label={I18n.t('options')} data-name="options" />
							<Tab label={I18n.t('stateConfig')} data-name="stateConfig" />
							<Tab label={I18n.t('singleStateUpload')} data-name="singleStateUpload" />
							<Tab label={I18n.t('resetNames')} data-name="resetNames" />
							<Tab label={I18n.t('influxDBHandler')} data-name="influxDBHandler" />
						</Tabs>
					</AppBar>
					<div
						className={this.isIFrame ? this.props.classes.tabContentIFrame : this.props.classes.tabContent}
					>
						{(this.state.selectedTab === 'options' || !this.state.selectedTab) && (
							<div>
								<Settings
									native={this.state.native}
									onChange={(attr, value) => this.updateNativeValue(attr, value)}
								/>
							</div>
						)}
						{this.state.selectedTab === 'stateConfig' && (
							<StateConfig
								socket={this.socket}
								onToast={this.onToast}
								onError={this.onError}
								systemConfig={this._systemConfig}
							/>
						)}
						{this.state.selectedTab === 'singleStateUpload' && (
							<SingleStateConfigForm
								socket={this.socket}
								onToast={this.onToast}
								onError={this.onError}
								systemConfig={this._systemConfig}
							/>
						)}
						{this.state.selectedTab === 'resetNames' && (
							<ResetNames
								socket={this.socket}
								onToast={this.onToast}
								onError={this.onError}
								systemConfig={this._systemConfig}
							/>
						)}
						{this.state.selectedTab === 'influxDBHandler' && (
							<InfluxDBHandler
								socket={this.socket}
								onToast={this.onToast}
								onError={this.onError}
								native={this.state.native}
								onChange={(attr, value) => this.updateNativeValue(attr, value)}
								systemConfig={this._systemConfig}
							/>
						)}
					</div>
					{this.renderError()}
					{this.renderToast()}
					{this.renderSaveCloseButtons()}
				</div>
			</MuiThemeProvider>
		);
	}
}

export default withStyles(styles)(App);
