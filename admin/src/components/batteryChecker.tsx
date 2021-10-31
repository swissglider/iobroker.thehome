import React, { FC, useEffect, useState } from 'react';
import I18n from '@iobroker/adapter-react/i18n';
import { Box, CheckBox, FormField } from 'grommet';
import TextFormHook from '../hooks/TextFormHook';
import * as yup from 'yup';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Chip from '../tools/Chip';
import ChipResponsiveContainer from '../tools/ChipResponsiveContainer';
import { T_General_Props } from '../tools/NavigationTabs/Types_States';

export interface I_BatteryChecker_FormProps {
	BatteryChecker_timerMS: number;
	BatteryChecker_roles: string;
	BatteryChecker_lowBatPercent_alert: number;
	BatteryChecker_lowBatPercent_warning: number;
}

const BatteryChecker: FC<T_General_Props> = (props: T_General_Props): JSX.Element => {
	const [allRoles, setAllRoles] = useState<string[]>([]);
	const tyErNumb = I18n.t('Amount must be a number');
	const formSchema: yup.SchemaOf<I_BatteryChecker_FormProps> = yup.object({
		BatteryChecker_timerMS: yup.number().typeError(tyErNumb).min(1000).integer().required(),
		BatteryChecker_roles: yup.string().required(),
		BatteryChecker_lowBatPercent_alert: yup.number().typeError(tyErNumb).max(100).min(0).integer().required(),
		BatteryChecker_lowBatPercent_warning: yup.number().typeError(tyErNumb).max(100).min(0).integer().required(),
	});

	const defaultValues = {
		BatteryChecker_timerMS: props.native['BatteryChecker_timerMS'],
		BatteryChecker_roles: props.native['BatteryChecker_roles'],
		BatteryChecker_lowBatPercent_alert: props.native['BatteryChecker_lowBatPercent_alert'],
		BatteryChecker_lowBatPercent_warning: props.native['BatteryChecker_lowBatPercent_warning'],
	};

	const methods = useForm<I_BatteryChecker_FormProps>({
		defaultValues,
		mode: 'onChange',
		reValidateMode: 'onChange',
		resolver: yupResolver(formSchema),
	});

	const handleDelete = (name: string) => {
		props.onChange(
			'BatteryChecker_roles',
			props.native['BatteryChecker_roles'].filter((e) => e != name),
		);
	};

	const handleAdd = (name: string) => {
		props.onChange('BatteryChecker_roles', [...props.native['BatteryChecker_roles'], name]);
	};

	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		props.socket.getForeignObjects('*').then((allObj) => {
			const _allRoles: string[] = [];
			for (const obj of Object.values(allObj)) {
				if (obj && obj.common.role) _allRoles.push(obj.common.role);
			}
			setAllRoles(_allRoles.filter((item, index) => _allRoles.indexOf(item) === index));
		});
		methods.setValue('BatteryChecker_timerMS', props.native['BatteryChecker_timerMS'], {
			shouldValidate: true,
		});
		methods.setValue('BatteryChecker_roles', props.native['BatteryChecker_roles'], {
			shouldValidate: true,
		});
		methods.setValue('BatteryChecker_lowBatPercent_alert', props.native['BatteryChecker_lowBatPercent_alert'], {
			shouldValidate: true,
		});
		methods.setValue('BatteryChecker_lowBatPercent_warning', props.native['BatteryChecker_lowBatPercent_warning'], {
			shouldValidate: true,
		});

		return () => {
			t: 't';
		};
	}, []);

	return (
		<Box fill="horizontal">
			<form>
				<FormProvider {...methods}>
					<Box direction="row">
						<FormField fill="horizontal">
							<CheckBox
								checked={props.native['BatteryChecker_active']}
								onChange={() =>
									props.onChange('BatteryChecker_active', !props.native['BatteryChecker_active'])
								}
								label={I18n.t('BatteryChecker_active')}
							/>
						</FormField>
					</Box>
					<Box direction="row">
						<TextFormHook
							label={I18n.t('Time to check regularly the batteries in ms')}
							name="BatteryChecker_timerMS"
							placeholder={I18n.t('Time to check regularly the batteries in ms')}
							// helperText="hallo Helper Text"
							systemConfig={props.systemConfig}
							onChange={props.onChange}
							disabled={!props.native['BatteryChecker_active']}
						/>
					</Box>
					<Box direction="row" gap="small">
						<TextFormHook
							label={I18n.t('Battery Percentage that should be marked as warn')}
							name="BatteryChecker_lowBatPercent_warning"
							placeholder={I18n.t('Battery Percentage that should be marked as low')}
							systemConfig={props.systemConfig}
							onChange={props.onChange}
							disabled={!props.native['BatteryChecker_active']}
						/>
						<TextFormHook
							label={I18n.t('Battery Percentage that should be marked as low')}
							name="BatteryChecker_lowBatPercent_alert"
							placeholder={I18n.t('Battery Percentage that should be marked as low')}
							systemConfig={props.systemConfig}
							onChange={props.onChange}
							disabled={!props.native['BatteryChecker_active']}
						/>
					</Box>
					<Box direction="row" fill="horizontal" gap="small" flex="grow">
						<ChipResponsiveContainer
							title={I18n.t('Selected Roles for Battery Check')}
							disabled={!props.native['BatteryChecker_active']}
						>
							{props.native['BatteryChecker_roles'].map((e) => (
								<Chip
									key={e}
									label={e}
									variant="delete"
									onClick={() => handleDelete(e)}
									disabled={!props.native['BatteryChecker_active']}
								/>
							))}
						</ChipResponsiveContainer>
						<ChipResponsiveContainer
							title={I18n.t('Addable Roles for Battery Check')}
							disabled={!props.native['BatteryChecker_active']}
						>
							{allRoles
								.filter((e) => !props.native['BatteryChecker_roles'].includes(e))
								.map((e) => (
									<Chip
										key={e}
										label={e}
										variant="add"
										onClick={() => handleAdd(e)}
										disabled={!props.native['BatteryChecker_active']}
									/>
								))}
						</ChipResponsiveContainer>
					</Box>
				</FormProvider>
			</form>
		</Box>
	);
};

export default BatteryChecker;
