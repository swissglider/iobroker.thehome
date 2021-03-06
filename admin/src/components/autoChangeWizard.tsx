import React, { FC, useEffect, useState } from 'react';
import { Box, Button, Grid, Spinner, Text } from 'grommet';
import {
	selectedSubTabTitle_State,
	selectedTab_State,
	selectedTabTitle_State,
	T_General_Props,
} from '../tools/NavigationTabs/Types_States';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { defaultAdapterSingleStates, T_AdapterSingleStates } from '../tools/AdapterSingleStates';
import Circle from '../tools/Circle';
import { Configure, Update } from 'grommet-icons';
import I18n from '@iobroker/adapter-react/i18n';
import getRandomString from '../helper/GetRandomKey';
import AutoChangeWizardStepper from './AUTO_CHANGE_WIZARD/stepperWizard';

type T_GridComponent_Type = { adapterName: string; generalProps: T_General_Props };

const influxDBAdapterName = 'InfluxDBHandlerAdapter';

const adapterNames = [
	'MiNameAdapter',
	'NetatmoAdapter',
	'HMIPAdapter',
	'ShellyAdapter',
	'SonoffAdapter',
	'WeatherundergroundAdapter',
	'SwissWeahterApiAdapter',
	'DasWetterAdapter',
	'JeelinkAdapter',
	'HueAdapter',
];

const GridComponent: FC<T_GridComponent_Type> = ({ adapterName, generalProps }: T_GridComponent_Type): JSX.Element => {
	const setSelectedTabTitle = useSetRecoilState(selectedTabTitle_State);
	const setSelectedSubTabTitle = useSetRecoilState(selectedSubTabTitle_State);
	const selectedTab = useRecoilValue(selectedTab_State);
	const [errorStatus, setErrorStatus] = useState<string>('loading...');
	const [singleAdapterState, setSingleAdapterState] = useState<T_AdapterSingleStates>(defaultAdapterSingleStates);
	const [hasConfigSite, setHasConfigSite] = useState<boolean>(false);
	const [canUpdate, setCanUpdate] = useState<boolean>(false);

	const goto = (tabTitle: string): void => {
		if (tabTitle === influxDBAdapterName) {
			setSelectedTabTitle(tabTitle);
		} else {
			setSelectedSubTabTitle(tabTitle);
		}
	};

	const rename = (adapterName: string): void => {
		try {
			generalProps
				.sendToWithWaitModul(generalProps.adapterInstanceName, 'rename', { adapterName: adapterName })
				.then((result: ioBroker.Message | undefined) => {
					if ((result as any).error) {
						setErrorStatus((result as any).error);
						generalProps.onError({ title: 'Error on rename', text: (result as any).error });
					} else {
						generalProps.onToast('Successfully renamed');
					}
				});
		} catch (error) {
			setErrorStatus(error);
			generalProps.onError(error);
		}
	};

	useEffect(() => {
		try {
			generalProps.socket
				.sendTo(generalProps.adapterInstanceName, 'getHealthStati', { adapterName: adapterName })
				.then((result: ioBroker.Message | undefined) => {
					if (result as unknown as T_AdapterSingleStates) {
						setSingleAdapterState(result as unknown as T_AdapterSingleStates);
						if (result && adapterName !== influxDBAdapterName) {
							setCanUpdate(Object.values(result).every((e) => e === true));
						}
						setErrorStatus(result && 'error' in result ? (result as any).error : '');
					} else {
						setErrorStatus(result ? result.toString() : 'Unknown Error');
					}
				});
		} catch (error) {
			setErrorStatus(error);
		}
		if (adapterName === influxDBAdapterName) {
			setHasConfigSite(true);
		} else {
			if (selectedTab && selectedTab.subTabs) {
				setHasConfigSite(selectedTab.subTabs.some((e) => e.title === adapterName));
			} else {
				setHasConfigSite(false);
			}
		}
	}, []);

	const getStatusColor = (): string => {
		return errorStatus === 'loading...'
			? 'status-warning'
			: singleAdapterState.isAdapterInstalled &&
			  singleAdapterState.isAdapterRunning &&
			  singleAdapterState.isAdapterConnected &&
			  singleAdapterState.adapterFullReady
			? 'status-ok'
			: singleAdapterState.isAdapterInstalled
			? 'status-warning'
			: 'status-error';
	};

	return (
		<Box background={getStatusColor()} pad="xsmall" round="xsmall">
			<Grid
				fill="horizontal"
				align="center"
				columns={['flex', 'auto', 'auto']}
				rows={['flex']}
				gap="large"
				margin="none"
				pad={{ right: 'small', left: 'large' }}
				areas={[
					{ name: 'titel', start: [0, 0], end: [0, 0] },
					{ name: 'status', start: [1, 0], end: [1, 0] },
					{ name: 'link', start: [2, 0], end: [2, 0] },
				]}
			>
				<Box align="start" gridArea="titel">
					{adapterName}
				</Box>
				<Box align="end" gridArea="status">
					{status === 'loading...' ? (
						<Spinner color="dark-1" message="Start Built-in Spinner Announcement" />
					) : errorStatus !== '' ? (
						errorStatus
					) : (
						<Box direction="row" gap="small">
							<Circle tip="installed" status={singleAdapterState.isAdapterInstalled} />
							<Circle tip="running" status={singleAdapterState.isAdapterRunning} />
							<Circle tip="connected" status={singleAdapterState.isAdapterConnected} />
							<Circle tip="fullReady" status={singleAdapterState.adapterFullReady} />
						</Box>
					)}
				</Box>
				<Box align="end" gridArea="link">
					<Box direction="row" gap="small">
						<Button
							tip={I18n.t('Rename the States')}
							disabled={canUpdate ? false : true}
							icon={<Update color={canUpdate ? undefined : getStatusColor()} />}
							size="small"
							plain
							onClick={() => (canUpdate ? rename(adapterName) : undefined)}
						/>
						<Button
							tip={I18n.t('GoTo Configuration')}
							disabled={hasConfigSite ? false : true}
							icon={<Configure color={hasConfigSite ? undefined : getStatusColor()} />}
							size="small"
							plain
							onClick={() => (hasConfigSite ? goto(adapterName) : undefined)}
						/>
					</Box>
				</Box>
			</Grid>
		</Box>
	);
};

const AutoChangeNameWizard: FC<T_General_Props> = (props: T_General_Props): JSX.Element => {
	const setSelectedTabTitle = useSetRecoilState(selectedTabTitle_State);
	const [showSearchDialog, setShowSearchDialog] = useState<boolean>(false);
	const [dbOK, setDBOK] = useState<boolean>(false);

	const handleClose = () => {
		setShowSearchDialog(false);
	};

	useEffect(() => {
		try {
			props.socket
				.sendTo(props.adapterInstanceName, 'getHealthStati', { adapterName: influxDBAdapterName })
				.then((result: ioBroker.Message | undefined) => {
					const _result = result as unknown as T_AdapterSingleStates;
					setDBOK(Object.values(_result).every((e) => e === true));
				});
		} catch (error) {
			setDBOK(false);
		}
	}, []);

	return (
		<>
			<Box fill="horizontal">
				<Box
					border={{ style: 'dotted' }}
					gap="xsmall"
					pad="small"
					margin={{ vertical: 'small', horizontal: 'large' }}
				>
					<Text>DB Status:</Text>
					<GridComponent adapterName={influxDBAdapterName} generalProps={props} />
				</Box>
				{dbOK ? (
					<>
						<Box
							border={{ style: 'dotted' }}
							gap="xsmall"
							pad="small"
							margin={{ vertical: 'small', horizontal: 'large' }}
						>
							<Text>Adapter Status:</Text>
							{adapterNames.map((adapterName) => (
								<React.Fragment key={getRandomString(adapterName)}>
									<GridComponent adapterName={adapterName} generalProps={props} />
								</React.Fragment>
							))}
						</Box>
						<Box gap="xsmall" pad="small" margin={{ vertical: 'xsmall', horizontal: 'large' }}>
							<Box align="end">
								<Button size="small" label="start Wizard" onClick={() => setShowSearchDialog(true)} />
							</Box>
						</Box>
					</>
				) : (
					<Box
						border={{ style: 'dotted' }}
						gap="xsmall"
						pad="small"
						margin={{ vertical: 'small', horizontal: 'large' }}
					>
						<Text>
							First {influxDBAdapterName} must be fully running, go to the {influxDBAdapterName}{' '}
							Configuration Page :{' '}
							<Button
								tip={I18n.t('GoTo Configuration')}
								size="small"
								plain
								icon={<Configure />}
								onClick={() => setSelectedTabTitle(influxDBAdapterName)}
							/>
						</Text>
					</Box>
				)}
			</Box>
			<AutoChangeWizardStepper
				open={showSearchDialog}
				onClose={handleClose}
				adapterNames={adapterNames}
				generalProps={props}
			/>
		</>
	);
};

export default AutoChangeNameWizard;
