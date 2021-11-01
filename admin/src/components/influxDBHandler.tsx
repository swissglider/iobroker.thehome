import React, { FC, useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import I18n from '@iobroker/adapter-react/i18n';
import { FormProvider, useForm } from 'react-hook-form';
import { Box, Button, CheckBox, FormField, Text } from 'grommet';
import TextFormHook from '../hooks/TextFormHook';
import { T_General_Props } from '../tools/NavigationTabs/Types_States';

const adapterName = 'InfluxDBHandlerAdapter';

export interface I_InfluxDBHandler_FormProps {
	InfluxDBHandlerAdapter_token: string;
	InfluxDBHandlerAdapter_bucketTransformed: string;
}

const formSchema: yup.SchemaOf<I_InfluxDBHandler_FormProps> = yup.object({
	InfluxDBHandlerAdapter_token: yup.string().required(),
	InfluxDBHandlerAdapter_bucketTransformed: yup.string().required(),
});

const InfluxDBHandler: FC<T_General_Props> = (props: T_General_Props): JSX.Element => {
	const [incativeRefreshButton, setIncativeRefreshButton] = useState<boolean>(false);
	const [isInfluxDBAdapterOK, setIsInfluxDBAdapterOK] = useState<boolean>(false);
	const defaultValues = {
		InfluxDBHandlerAdapter_token: props.native['InfluxDBHandlerAdapter_token'],
		InfluxDBHandlerAdapter_bucketTransformed: props.native['InfluxDBHandlerAdapter_bucketTransformed'],
	};

	const methods = useForm<I_InfluxDBHandler_FormProps>({
		defaultValues,
		mode: 'onChange',
		reValidateMode: 'onChange',
		resolver: yupResolver(formSchema),
	});

	const onChange = (name: string, value: any) => {
		props.onChange(name, value);
	};

	useEffect(() => {
		try {
			props
				.sendToWithWaitModul(props.adapterInstanceName, 'isAdapterConnected', { adapterName: 'influxdb' })
				.then((result: ioBroker.Message | undefined) => {
					if (typeof result === 'string' && result === 'ok') {
						setIsInfluxDBAdapterOK(true);
					} else {
						setIsInfluxDBAdapterOK(false);
					}
				});
		} catch (error) {
			console.error(`Uknown error: ${error}`);
			setIsInfluxDBAdapterOK(false);
		}
		methods.setValue('InfluxDBHandlerAdapter_token', props.native['InfluxDBHandlerAdapter_token'], {
			shouldValidate: true,
		});
		methods.setValue(
			'InfluxDBHandlerAdapter_bucketTransformed',
			props.native['InfluxDBHandlerAdapter_bucketTransformed'],
			{
				shouldValidate: true,
			},
		);
	}, []);

	const testConnection = async () => {
		const values = methods.getValues();
		props
			.sendToWithWaitModul(props.adapterInstanceName, 'testInfluxDBConnectionWithToken', {
				adapterName: adapterName,
				token: values.InfluxDBHandlerAdapter_token,
			})
			.then((result: ioBroker.Message | undefined) => {
				if (typeof result === 'string' && result === 'ok') {
					props.onToast({
						title: I18n.t('Test InfluxDB Connection'),
						text: I18n.t('ok'),
					});
				} else {
					props.onError({
						title: I18n.t('Test InfluxDB Connection'),
						text: JSON.stringify(result),
					});
				}
			})
			.catch((reason) => {
				props.onError(I18n.t('Error: ') + JSON.stringify(reason));
			});
	};

	const refreshAllTagsOnInfluxDB = async () => {
		setIncativeRefreshButton(true);
		props
			.sendToWithWaitModul(props.adapterInstanceName, 'refreshAllTagsOnInfluxDB', {
				adapterName: adapterName,
			})
			.then((result: ioBroker.Message | undefined) => {
				if (typeof result === 'string' && result === 'ok') {
					props.onToast({
						title: I18n.t('Result from Adapter'),
						text: I18n.t('All Tags sucessfully reseted'),
					});
				} else {
					props.onError(I18n.t('Error: ') + JSON.stringify(result));
				}

				setIncativeRefreshButton(false);
			})
			.catch((reason) => {
				props.onError(I18n.t('Error: ') + JSON.stringify(reason));
			});
		// methods.reset();
	};
	return (
		<Box fill="horizontal">
			<Box
				border={{ style: 'dotted' }}
				gap="xsmall"
				pad="small"
				margin={{ vertical: 'small', horizontal: 'large' }}
			>
				<form>
					<FormProvider {...methods}>
						<Box direction="row">
							{isInfluxDBAdapterOK ? (
								<Text color="status-success">InfluxDB Adapter running</Text>
							) : (
								<Text color="status-error" weight="bold">
									check InfluxDB Adapter, it is not installed or running correct
								</Text>
							)}
						</Box>
						<Box direction="row">
							<FormField fill="horizontal">
								<CheckBox
									checked={props.native['InfluxDBHandlerAdapter_active']}
									onChange={() =>
										props.onChange(
											'InfluxDBHandlerAdapter_active',
											!props.native['InfluxDBHandlerAdapter_active'],
										)
									}
									label={I18n.t('InfluxDBHandlerAdapter_active')}
									disabled={!isInfluxDBAdapterOK}
								/>
							</FormField>
						</Box>
						<Box direction="row">
							<TextFormHook
								label={I18n.t('Token')}
								name="InfluxDBHandlerAdapter_token"
								placeholder={I18n.t('Same as on InfluxDB Adapter')}
								systemConfig={props.systemConfig}
								onChange={onChange}
								disabled={!props.native['InfluxDBHandlerAdapter_active'] || !isInfluxDBAdapterOK}
								size="xsmall"
							/>
						</Box>
					</FormProvider>
				</form>
			</Box>
			<Box pad="small" margin={{ vertical: 'xsmall', horizontal: 'large' }}>
				<Box align="end">
					<Box direction="row" gap="xsmall">
						<Button
							secondary
							label={I18n.t('Test InfluxDB Connection')}
							disabled={!isInfluxDBAdapterOK}
							onClick={() => testConnection()}
							size="small"
						/>
						<Button
							secondary
							label={I18n.t('Refresh all Tags on InfluxDB')}
							disabled={incativeRefreshButton || !isInfluxDBAdapterOK}
							onClick={() => refreshAllTagsOnInfluxDB()}
							size="small"
						/>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default InfluxDBHandler;
