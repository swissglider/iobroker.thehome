import React, { FC } from 'react';
import { FormControl, FormHelperText, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import I18n from '@iobroker/adapter-react/i18n';
import Helper from '../helper';

export interface I_ListFormHook_Props {
	label: string;
	name: string;
	allElements: Record<string, ioBroker.Object>;
	helperText?: string;
	systemConfig: Record<string, any>;
}

const ListFormHook: FC<I_ListFormHook_Props> = ({
	label,
	name,
	allElements,
	helperText,
	systemConfig,
}: I_ListFormHook_Props) => {
	const { watch, control } = useFormContext();

	return (
		<>
			<FormControl disabled={watch().stateID === '' ? true : false}>
				<InputLabel shrink id="sf2Label">
					<Typography variant="body1" noWrap>
						{label}
					</Typography>
				</InputLabel>
				<Controller
					control={control}
					name={name}
					render={({ field }) => (
						<Select labelId="sf2Label" {...field}>
							{Object.values(allElements).map((obj: ioBroker.Object) => (
								<MenuItem key={obj._id} value={obj._id}>
									{obj.common.name === '__' ? (
										<em>{I18n.t('None')}</em>
									) : (
										Helper.getName(obj.common.name, systemConfig.language)
									)}
								</MenuItem>
							))}
						</Select>
					)}
				/>
				<FormHelperText>{helperText ?? ''}</FormHelperText>
			</FormControl>
		</>
	);
};

export default ListFormHook;
