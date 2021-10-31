import React, { FC, useState } from 'react';

import GenericApp from '@iobroker/adapter-react/GenericApp';
import Settings from './components/settings';
import { GenericAppProps, GenericAppSettings } from '@iobroker/adapter-react/types';
import Loader from '@iobroker/adapter-react/Components/Loader';
import I18n from '@iobroker/adapter-react/i18n';
import GrommetThemeCreator from './helper/GrommetThemeCreator';
import { Grommet, Box, ResponsiveContext, Notification, Heading, Grid, Layer, Spinner, Text } from 'grommet';
import { Download, Edit, Undo, SettingsOption } from 'grommet-icons';
import { useEffect } from 'react';
import { MuiThemeProvider } from '@material-ui/core';
import BatteryChecker from './components/batteryChecker';
import AppHeader from './appHeader';
import {
	allTabsState,
	selectedSubTabTitle_State,
	selectedSubTab_State,
	selectedTabTitle_State,
	selectedTab_State,
	titleState,
	T_General_Props,
	T_General_Props_T,
	T_Tab_Type_Array,
} from './tools/NavigationTabs/Types_States';
import StateConfigGeneralSettings from './components/StateConfig/subComponents/stateConfigGeneralSettings';
import MultiStateConfig from './components/StateConfig/subComponents/multiStateConfig';
import SingleStateConfigForm from './components/StateConfig/subComponents/singleStateConfigForm';
import NameReseter from './components/StateConfig/subComponents/nameReseter';
import { RecoilRoot, useRecoilState, useRecoilValue } from 'recoil';
import SubNavigationTabs from './tools/NavigationTabs/SubNavTabs';
import AutoChangeNameWizard from './components/autoChangeWizard';
import MiNameAdapter from './components/AUTO_CHANGE_WIZARD/MiNameAdapter';
import InfluxDBHandler from './components/influxDBHandler';

const defaultTabs: T_Tab_Type_Array = [
	{
		title: 'Auto Change Name WIZARD',
		subTabs: [
			{
				title: 'Auto Change Name WIZARD',
				child: AutoChangeNameWizard,
				icon: <Edit />,
			},
			{ title: 'MiNameAdapter', child: MiNameAdapter, icon: <SettingsOption /> },
		],
	},
	{ title: 'InfluxDBHandlerAdapter', child: InfluxDBHandler },
	{ title: 'batteryChecker', child: BatteryChecker },
	{
		title: 'Status Config',
		subTabs: [
			{
				title: 'stateGeneralConfig',
				child: StateConfigGeneralSettings,
				icon: <SettingsOption />,
			},
			{ title: 'stateConfig', child: MultiStateConfig, icon: <Download /> },
			{
				title: 'singleStateUpload',
				child: SingleStateConfigForm,
				icon: <Edit />,
			},
			{ title: 'resetNames', child: NameReseter, icon: <Undo /> },
		],
	},
	{ title: 'options', child: Settings },
];

const TheHomeAdminApp: FC<T_General_Props_T> = (props: T_General_Props_T): JSX.Element => {
	const [allTabs, setAllTabs] = useRecoilState(allTabsState);
	const [selectedTabTitle, setSelectedTabTitle] = useRecoilState(selectedTabTitle_State);
	const [selectedSubTabTitle, setSelectedSubTabTitle] = useRecoilState(selectedSubTabTitle_State);
	const selectedTab_ = useRecoilValue(selectedTab_State);
	const selectedSubTab_ = useRecoilValue(selectedSubTab_State);

	const [title, setTitle] = useRecoilState(titleState);
	const [visibleToast, setVisibleToast] = useState<boolean>(false);
	const [textToast, setTextToast] = useState<{ title: string; text: string }>({ title: '', text: '' });
	const [visibleError, setVisibleError] = useState<boolean>(false);
	const [textError, setTextError] = useState<{ title: string; text: string }>({ title: '', text: '' });
	const [isInfluxDBInstalled, setIsInfluxDBInstalled] = useState<boolean>(false);
	const [openSendToWithWaitModul, setOpenSendToWithWaitModul] = React.useState<boolean>(false);

	const hasSubTabs = (): boolean => {
		return selectedTab_ &&
			selectedTab_.subTabs &&
			selectedSubTab_ &&
			(selectedSubTab_.title === 'dummy' ? false : true)
			? true
			: false;
	};

	const onToast = (message: { title: string; text: string } | string): void => {
		if (typeof message === 'string') {
			setTextToast({ title: '', text: message });
		} else {
			setTextToast(message);
		}
		setVisibleToast(true);
	};

	const onError = (message: { title: string; text: string } | string): void => {
		if (typeof message === 'string') {
			setTextError({ title: '', text: message });
		} else {
			setTextError(message);
		}
		setVisibleError(true);
	};

	const sendToWithWaitModul = async (
		instance: string,
		command?: string | undefined,
		data?: ioBroker.MessagePayload | undefined,
	): Promise<ioBroker.Message | undefined> => {
		setOpenSendToWithWaitModul(true);
		return await props.socket.sendTo(instance, command, data).then((msg) => {
			setOpenSendToWithWaitModul(false);
			return msg;
		});
	};

	const newProps: T_General_Props = {
		...props,
		...{ onToast: onToast, onError: onError, theme: props.theme, sendToWithWaitModul: sendToWithWaitModul },
	};

	const setDefaultSubTabs = () => {
		if (selectedTab_ && selectedTab_.subTabs) {
			for (const _subTab of selectedTab_.subTabs) {
				if (_subTab.title !== 'dummy') {
					setSelectedSubTabTitle(_subTab.title);
					return;
				}
			}
			setSelectedSubTabTitle('dummy');
		}
	};

	const setDefaultTabs = () => {
		for (const _tab of allTabs) {
			if (_tab.title !== 'dummy') {
				setSelectedTabTitle(_tab.title);
				if (_tab.subTabs) {
					for (const _subTab of _tab.subTabs) {
						if (_subTab.title !== 'dummy') {
							setSelectedSubTabTitle(_subTab.title);
							return;
						}
					}
					setSelectedSubTabTitle('dummy');
				}
				return;
			}
		}
		setSelectedTabTitle('dummy');
	};

	useEffect(() => {
		setAllTabs(defaultTabs);
		props.socket
			.sendTo(props.adapterInstanceName, 'isAdapterInstalled', { adapterName: 'influxdb' })
			.then((result: ioBroker.Message | undefined) => {
				if (typeof result === 'string' && result === 'ok') {
					setIsInfluxDBInstalled(true);
				} else {
					console.error(`InfluxDB installed: ${result}`);
					setIsInfluxDBInstalled(false);
				}
			})
			.catch((reason) => {
				console.error(`Uknown error: ${reason}`);
				setIsInfluxDBInstalled(false);
			});
	}, []);

	useEffect(() => {
		// check if selectedTabTitle and selected subTabTitle still exists, if not ok --> set new default ones
		if (!allTabs.some((e) => e.title === selectedTabTitle)) {
			setDefaultTabs();
			return;
		}
		if (
			selectedTab_ &&
			selectedTab_.subTabs &&
			!selectedTab_.subTabs.some((e) => e.title === selectedSubTabTitle)
		) {
			setDefaultSubTabs();
			return;
		}
	}, [allTabs]);

	useEffect(() => {
		// check if subTabs if yes set it if not correct it and set the title
		if (
			selectedTab_ &&
			selectedTab_.subTabs &&
			!selectedTab_.subTabs.some((e) => e.title === selectedSubTabTitle)
		) {
			setDefaultSubTabs();
			return;
		}
		setTitle(selectedTabTitle);
	}, [selectedTabTitle]);

	useEffect(() => {
		setTitle(selectedSubTabTitle);
	}, [selectedSubTabTitle]);

	return (
		<>
			{!isInfluxDBInstalled ? (
				<Grommet theme={props.theme} themeMode={props.state.themeType as 'dark' | 'light'}>
					<Box fill pad="large">
						<Box
							border={{ style: 'solid', color: 'status-error', size: 'large' }}
							pad="large"
							align="center"
						>
							<Heading level="2" color="status-error">
								{I18n.t('Influxdb Adapter must be installed!')}
							</Heading>
						</Box>
					</Box>
				</Grommet>
			) : (
				<Grommet theme={props.theme} themeMode={props.state.themeType as 'dark' | 'light'}>
					<Grid
						fill
						rows={['auto', 'auto', 'auto', 'flex']}
						columns={['auto']}
						gap="xxsmall"
						areas={[
							{ name: 'header', start: [0, 0], end: [0, 0] },
							{ name: 'title', start: [0, 1], end: [0, 1] },
							{ name: 'subTabs', start: [0, 2], end: [0, 2] },
							{ name: 'main', start: [0, 3], end: [0, 3] },
						]}
					>
						<AppHeader gridAreaHeader="header" generalProps={{ ...newProps }} />
						<Box gridArea="title" background="light-5" align="center">
							<ResponsiveContext.Consumer>
								{(size) =>
									selectedTabTitle && (
										<Heading
											level={['xsmall', 'small'].includes(size.toString()) ? '5' : '3'}
											margin="xxsmall"
										>
											{I18n.t(title)}
										</Heading>
									)
								}
							</ResponsiveContext.Consumer>
						</Box>
						{hasSubTabs() && (
							<Box gridArea="subTabs">
								<SubNavigationTabs {...newProps} />
							</Box>
						)}
						{selectedTab_ && (
							<Box
								gridArea="main"
								pad={{ top: 'small' }}
								flex
								overflow={{ horizontal: 'hidden', vertical: 'auto' }}
							>
								{hasSubTabs() && selectedSubTab_ ? (
									selectedSubTab_.child ? (
										React.createElement(selectedSubTab_.child, { ...newProps })
									) : (
										<></>
									)
								) : selectedTab_.child ? (
									React.createElement(selectedTab_.child, { ...newProps })
								) : (
									<></>
								)}
							</Box>
						)}
					</Grid>
					{visibleToast && (
						<Notification
							toast
							title={textToast.title}
							message={textToast.text}
							onClose={() => setVisibleToast(false)}
							status="normal"
						/>
					)}
					{visibleError && (
						<Notification
							toast
							title={textError.title}
							message={textError.text}
							onClose={() => setVisibleError(false)}
							status="critical"
						/>
					)}
					{openSendToWithWaitModul && (
						<Layer>
							<Box
								align="center"
								justify="center"
								gap="small"
								direction="row"
								alignSelf="center"
								pad="large"
							>
								<Spinner />
								<Text>Loading...</Text>
							</Box>
						</Layer>
					)}
				</Grommet>
			)}
		</>
	);
};

class App extends GenericApp {
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
		this.onSave = this.onSave.bind(this);
		this.onClose = this.onClose.bind(this);
		this.onLoadConfig = this.onLoadConfig.bind(this);
	}

	onClose(): void {
		if (typeof window.parent !== 'undefined' && window.parent) {
			try {
				if (
					(window.parent as any).$iframeDialog &&
					typeof (window.parent as any).$iframeDialog.close === 'function'
				) {
					(window.parent as any).$iframeDialog.close();
				} else {
					window.parent.postMessage('close', '*');
				}
			} catch (e) {
				window.parent.postMessage('close', '*');
			}
		}
	}

	render(): JSX.Element {
		const theme = GrommetThemeCreator.createGrommetTheme(this.state.theme);
		if (!this.state.loaded) {
			return (
				<MuiThemeProvider theme={this.state.theme}>
					<Loader theme={this.state.themeType} />
				</MuiThemeProvider>
			);
		} else {
			return (
				<MuiThemeProvider theme={this.state.theme}>
					<RecoilRoot>
						<TheHomeAdminApp
							socket={this.socket}
							native={this.state.native}
							onChange={(attr, value, cb?) => this.updateNativeValue(attr, value, cb)}
							systemConfig={this._systemConfig}
							state={this.state}
							onLoadConfig={this.onLoadConfig}
							instance={this.instance}
							common={this.common}
							onClose={this.onClose}
							onSave={this.onSave}
							theme={theme}
							adapterName={this.adapterName}
							instanceId={this.instanceId}
							adapterInstanceName={`${this.adapterName}.${this.instance}`}
						/>
						{this.renderError()}
						{this.renderToast()}
					</RecoilRoot>
				</MuiThemeProvider>
			);
		}
	}
}

export default App;
