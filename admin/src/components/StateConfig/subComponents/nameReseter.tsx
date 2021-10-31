import React, { FC, useState } from 'react';
import I18n from '@iobroker/adapter-react/i18n';
import { Box, Button } from 'grommet';
import TextFormHook from '../../../hooks/TextFormHook';
import * as yup from 'yup';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Helper from '../../../helper';
import HiddenInputFormHook from '../../../hooks/HiddenInputFormHook';
import DialogSelectDefaultName from '../helper/dialogSelectDefaultName';
import { T_General_Props } from '../../../tools/NavigationTabs/Types_States';

export interface I_ResetNames_FormProps {
	stateID: string;
	stateName: ioBroker.StringOrTranslated;
	defaultStateName: ioBroker.StringOrTranslated;
}

const formSchema: yup.SchemaOf<I_ResetNames_FormProps> = yup.object({
	stateID: yup.string().required(),
	stateName: yup.string().required(),
	defaultStateName: yup.string().required(),
});

const defaultValues = {
	stateID: '',
	stateName: '',
	defaultStateName: '',
};

const NameReseter: FC<T_General_Props> = (props: T_General_Props): JSX.Element => {
	const [showSearchDialog, setShowSearchDialog] = useState<boolean>(false);
	const methods = useForm<I_ResetNames_FormProps>({
		defaultValues,
		mode: 'onChange',
		reValidateMode: 'onChange',
		resolver: yupResolver(formSchema),
	});

	const handleClose = (values: I_ResetNames_FormProps | undefined) => {
		setShowSearchDialog(false);
		if (!values) return;
		methods.setValue('stateID', values.stateID, {
			shouldValidate: true,
		});
		methods.setValue('stateName', Helper.getName(values.stateName, props.systemConfig.language), {
			shouldValidate: true,
		});
		methods.setValue('defaultStateName', Helper.getName(values.defaultStateName, props.systemConfig.language), {
			shouldValidate: true,
		});
	};

	const submitStateInformation: SubmitHandler<I_ResetNames_FormProps> = async (data: I_ResetNames_FormProps) => {
		props.socket
			.sendTo(props.adapterInstanceName, 'ConfigChangeListener:resetStateNameToDefault', { id: data.stateID })
			.then((result: ioBroker.Message | undefined) => {
				if (typeof result === 'string' && result === 'ok') {
					props.onToast(I18n.t('Single State Name sucessfully reseted'));
				} else {
					props.onError(I18n.t('Error: ') + JSON.stringify(result));
				}
			})
			.catch((reason) => {
				props.onError(I18n.t('Error: ') + JSON.stringify(reason));
			});
		methods.reset();
	};

	const resetAllStateNames = async () => {
		props.socket
			.sendTo(props.adapterInstanceName, 'ConfigChangeListener:resetAllStateNamesToDefault', {})
			.then((result: ioBroker.Message | undefined) => {
				if (typeof result === 'string' && result === 'ok') {
					props.onToast(I18n.t('All State Names sucessfully reseted'));
				} else {
					props.onError(I18n.t('Error: ') + JSON.stringify(result));
				}
			})
			.catch((reason) => {
				props.onError(I18n.t('Error: ') + JSON.stringify(reason));
			});
		methods.reset();
	};

	return (
		<>
			<Box fill="horizontal">
				<form onSubmit={methods.handleSubmit(submitStateInformation)}>
					<FormProvider {...methods}>
						<HiddenInputFormHook name="stateID" systemConfig={props.systemConfig} />
						<Box direction="row">
							<TextFormHook
								label={I18n.t('State Name')}
								name="stateName"
								placeholder={I18n.t('First Search the State')}
								disabled={true}
								systemConfig={props.systemConfig}
							/>
						</Box>
						<TextFormHook
							label={I18n.t('Default State Name')}
							name="defaultStateName"
							placeholder={I18n.t('First Search the State')}
							disabled={true}
							systemConfig={props.systemConfig}
						/>
						<Box
							align="center"
							justify="center"
							direction="row"
							pad="medium"
							gap="medium"
							fill="horizontal"
						>
							<Button onClick={() => setShowSearchDialog(true)} label={I18n.t('Search State Name')} />
							<Button
								onClick={() => methods.reset()}
								disabled={methods.watch().stateID === '' ? true : false}
								label={I18n.t('Clean Forms')}
							/>
							<Button
								type="submit"
								disabled={methods.watch().stateID === '' ? true : false}
								label={I18n.t('resetName')}
							/>
						</Box>
						<Box justify="end" fill="horizontal">
							<Button
								primary
								onClick={() => resetAllStateNames()}
								// disabled={methods.watch().stateID === '' ? true : false}
								label={I18n.t('resetNames')}
								color="status-warning"
							/>
						</Box>
					</FormProvider>
				</form>
			</Box>
			<DialogSelectDefaultName
				open={showSearchDialog}
				onClose={handleClose}
				systemConfig={props.systemConfig}
				socket={props.socket}
				onError={props.onError}
				onToast={props.onToast}
				adapterInstanceName={props.adapterInstanceName}
			/>
		</>
	);
};

export default NameReseter;
