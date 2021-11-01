import React, { FC, useEffect, useState } from 'react';
import I18n from '@iobroker/adapter-react/i18n';
import { Box, Button, FormField, Text, TextInput } from 'grommet';
import TextFormHook from '../../hooks/TextFormHook';
import * as yup from 'yup';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { T_General_Props } from '../../tools/NavigationTabs/Types_States';
import { DownloadOption } from 'grommet-icons';

export interface I_MiNameAdapter_FormProps {
	MiNameAdapter_login: string;
	MiNameAdapter_password: string;
	MiNameAdapter_defaultCountry: string;
}

const formSchema: yup.SchemaOf<I_MiNameAdapter_FormProps> = yup.object({
	MiNameAdapter_login: yup.string().required(),
	MiNameAdapter_password: yup.string().required(),
	MiNameAdapter_defaultCountry: yup.string().required(),
});

const MiNameAdapter: FC<T_General_Props> = (props: T_General_Props): JSX.Element => {
	const [isMiHomeDBAdapterConnected, setIsMiHomeDBAdapterConnected] = useState<boolean>(false);
	const [token, setToken] = useState<string>('');
	const [validated, setValidated] = useState<boolean>(false);
	const defaultValues = {
		MiNameAdapter_login: props.native['MiNameAdapter_login'],
		MiNameAdapter_password: props.native['MiNameAdapter_password'],
		MiNameAdapter_defaultCountry: props.native['MiNameAdapter_defaultCountry'],
	};

	const methods = useForm<I_MiNameAdapter_FormProps>({
		defaultValues,
		mode: 'onChange',
		reValidateMode: 'onChange',
		resolver: yupResolver(formSchema),
	});

	const testConnection = async () => {
		const values = methods.getValues();
		props
			.sendToWithWaitModul(props.adapterInstanceName, 'testConnectionWithNewParameter', {
				adapterName: 'MiNameAdapter',
				// config: {
				login: values.MiNameAdapter_login,
				password: values.MiNameAdapter_password,
				country: values.MiNameAdapter_defaultCountry,
				// },
			})
			.then((result: ioBroker.Message | undefined) => {
				if (typeof result === 'string' && result === 'ok') {
					props.onToast({
						title: I18n.t('Test MiHome Connection'),
						text: I18n.t('ok'),
					});
				} else {
					props.onError({
						title: I18n.t('Test MiHome Connection'),
						text: JSON.stringify(result),
					});
				}
			})
			.catch((reason) => {
				props.onError(I18n.t('Error: ') + JSON.stringify(reason));
			});
	};

	const getGatewayToken = async () => {
		const values = methods.getValues();
		props
			.sendToWithWaitModul(props.adapterInstanceName, 'getGatewayToken', {
				adapterName: 'MiNameAdapter',
				login: values.MiNameAdapter_login,
				password: values.MiNameAdapter_password,
				country: values.MiNameAdapter_defaultCountry,
			})
			.then((result: ioBroker.Message | undefined) => {
				if (typeof result === 'string') {
					setToken(result);
				} else {
					setToken('');
					props.onError({
						title: I18n.t('Get Token from Cloud'),
						text: JSON.stringify(result),
					});
				}
			})
			.catch((reason) => {
				props.onError(I18n.t('Error: ') + JSON.stringify(reason));
			});
	};

	const onChange = (name: string, value: any) => {
		props.onChange(name, value);
	};

	useEffect(() => {
		try {
			props
				.sendToWithWaitModul(props.adapterInstanceName, 'isAdapterConnected', { adapterName: 'mihome' })
				.then((result: ioBroker.Message | undefined) => {
					if (typeof result === 'string' && result === 'ok') {
						setIsMiHomeDBAdapterConnected(true);
					} else {
						setIsMiHomeDBAdapterConnected(false);
					}
				});
		} catch (error) {
			console.error(`Uknown error: ${error}`);
			setIsMiHomeDBAdapterConnected(false);
		}

		methods.setValue('MiNameAdapter_login', props.native['MiNameAdapter_login'], { shouldValidate: true });
		methods.setValue('MiNameAdapter_password', props.native['MiNameAdapter_password'], { shouldValidate: true });
		methods.setValue('MiNameAdapter_defaultCountry', props.native['MiNameAdapter_defaultCountry'], {
			shouldValidate: true,
		});
	}, []);

	useEffect(() => {
		setValidated(methods.formState.isValid);
	}, [methods.formState]);

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
							{isMiHomeDBAdapterConnected ? (
								<Text color="status-success">MIHome Adapter installed</Text>
							) : (
								<Text color="status-error" weight="bold">
									check MIHome Adapter, it is not installed or running
								</Text>
							)}
						</Box>
						<Box direction="row">
							<TextFormHook
								label={I18n.t('MiNameAdapter_login')}
								name="MiNameAdapter_login"
								placeholder={I18n.t('MiNameAdapter_login')}
								systemConfig={props.systemConfig}
								onChange={onChange}
							/>
						</Box>
						<Box direction="row">
							<TextFormHook
								label={I18n.t('MiNameAdapter_password')}
								name="MiNameAdapter_password"
								placeholder={I18n.t('MiNameAdapter_password')}
								systemConfig={props.systemConfig}
								onChange={onChange}
							/>
						</Box>
						<Box direction="row">
							<TextFormHook
								label={I18n.t('MiNameAdapter_defaultCountry')}
								name="MiNameAdapter_defaultCountry"
								placeholder={I18n.t('MiNameAdapter_defaultCountry')}
								systemConfig={props.systemConfig}
								onChange={onChange}
							/>
						</Box>
						{validated && (
							<Box direction="row">
								<FormField help="MiHome Gateway Token from Cloud" fill="horizontal">
									<TextInput value={token} size="xsmall" disabled={true} />
								</FormField>
								<Button
									size="small"
									plain
									icon={<DownloadOption />}
									tip="Get Token"
									onClick={() => getGatewayToken()}
								/>
							</Box>
						)}
					</FormProvider>
				</form>
			</Box>
			<Box pad="small" margin={{ vertical: 'xsmall', horizontal: 'large' }}>
				<Box align="end">
					<Box direction="row" gap="xsmall">
						<Button size="small" label="Test MiHome Cloud Connection" onClick={() => testConnection()} />
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default MiNameAdapter;
