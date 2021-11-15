import * as React from 'react';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import { Box, Layer, Text, Button, Spinner } from 'grommet';
import { FormClose } from 'grommet-icons';
import I18n from '@iobroker/adapter-react/i18n';
import { useEffect } from 'react';
import { T_AdapterSingleStates } from '../../../tools/AdapterSingleStates';
import SelectAdapters from './steps/selectAdaptes';
import RenameAdapter from './steps/renameAdapter';
import { T_General_Props } from '../../../tools/NavigationTabs/Types_States';
import RenameResults from './steps/renameResults';
import RefreshInfluxDBTags from './steps/refreshInfluxDBTags';

const steps = [
	I18n.t('Select Adapter to Rename'),
	I18n.t('Rename'),
	I18n.t('Rename Results'),
	I18n.t('Refresh InfluxDB Tags'),
];

export interface I_AutoChangeWizardStepper_Props {
	onClose: () => void;
	open: boolean;
	generalProps: T_General_Props;
	adapterNames: string[];
}

const AutoChangeWizardStepper: React.FC<I_AutoChangeWizardStepper_Props> = (props: I_AutoChangeWizardStepper_Props) => {
	const [activeStep, setActiveStep] = React.useState(0);
	const [loading, setLoading] = React.useState<boolean>(true);

	const [selectedAdapters, setSelectedAdapters] = React.useState<Record<string, boolean>>({});
	const [renameResults, setRenameResults] = React.useState<Record<string, Record<string, string> | string>>({});

	const setAdapterSelected = (adapterName: string, selected: boolean): void => {
		const tmpSelectedAdapters = { ...selectedAdapters };
		tmpSelectedAdapters[adapterName] = selected;
		setSelectedAdapters(tmpSelectedAdapters);
	};

	const selectAllAdapters = (): void => {
		const tmpSelectedAdapters = { ...selectedAdapters };
		for (const name of Object.keys(tmpSelectedAdapters)) {
			tmpSelectedAdapters[name] = true;
		}
		setSelectedAdapters(tmpSelectedAdapters);
	};

	const unSelectAllAdapters = (): void => {
		const tmpSelectedAdapters = { ...selectedAdapters };
		for (const name of Object.keys(tmpSelectedAdapters)) {
			tmpSelectedAdapters[name] = false;
		}
		setSelectedAdapters(tmpSelectedAdapters);
	};

	useEffect(() => {
		try {
			const promises: Promise<ioBroker.Message | undefined>[] = [];
			for (const adapterName of props.adapterNames) {
				promises.push(
					props.generalProps.socket.sendTo(props.generalProps.adapterInstanceName, 'getHealthStati', {
						adapterName: adapterName,
					}),
				);
			}
			Promise.all(promises).then((values) => {
				const result = values as unknown as T_AdapterSingleStates[];
				const tmpResult: Record<string, boolean> = {};
				result.forEach((value, index) => {
					if (Object.values(value).every((e) => e === true)) {
						tmpResult[props.adapterNames[index]] = false;
					}
				});
				setSelectedAdapters(tmpResult);
				setLoading(false);
			});
		} catch (error) {
			props.generalProps.onError(error);
		}
	}, []);

	const handleNext = () => {
		const newActiveStep = activeStep + 1;
		setActiveStep(newActiveStep);
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	const setRenameResult = (results: Record<string, Record<string, string> | string>): void => {
		setRenameResults(results);
		handleNext();
	};

	return (
		<>
			{props.open && (
				<>
					<Layer
						position="center"
						onClickOutside={() => props.onClose()}
						onEsc={() => props.onClose()}
						full={true}
					>
						<Box
							margin="small"
							border={{ style: 'solid', color: 'headerBorder' }}
							round="xsmall"
							elevation="small"
						>
							<Box
								direction="row"
								align="center"
								as="header"
								justify="between"
								background={{ color: 'headerBorder' }}
							>
								<Text margin={{ left: 'small' }}>{I18n.t('Select State Name to reset')}</Text>
								<Button alignSelf="end" icon={<FormClose />} onClick={() => props.onClose()} />
							</Box>
							<Box pad={{ top: 'medium', horizontal: 'medium' }}>
								<Stepper nonLinear activeStep={activeStep}>
									{steps.map((label) => (
										<Step key={label}>
											<StepButton color="inherit">{label}</StepButton>
										</Step>
									))}
								</Stepper>
							</Box>
							<Box as="main" flex overflow="auto" margin={{ vertical: 'small', horizontal: 'none' }}>
								<React.Fragment>
									{activeStep === 0 && (
										<SelectAdapters
											selectedAdapters={selectedAdapters}
											setAdapterSelected={setAdapterSelected}
											selectAllAdapters={selectAllAdapters}
											unSelectAllAdapters={unSelectAllAdapters}
											next={handleNext}
										/>
									)}
									{activeStep === 1 && (
										<RenameAdapter
											selectedAdapters={selectedAdapters}
											generalProps={props.generalProps}
											setRenameResult={setRenameResult}
											back={handleBack}
											setLoading={setLoading}
										/>
									)}
									{activeStep === 2 && (
										<RenameResults
											renameResults={renameResults}
											back={handleBack}
											next={handleNext}
										/>
									)}
									{activeStep === 3 && (
										<RefreshInfluxDBTags
											generalProps={props.generalProps}
											back={handleBack}
											finish={props.onClose}
										/>
									)}
								</React.Fragment>
							</Box>
						</Box>
					</Layer>
					{loading && (
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
				</>
			)}
		</>
	);
};

export default AutoChangeWizardStepper;
