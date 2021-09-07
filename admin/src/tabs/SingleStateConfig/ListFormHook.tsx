import React, { FC } from 'react';
import { FormControl, FormHelperText, InputLabel, MenuItem, Select, Typography } from '@material-ui/core';
import { Controller, useFormContext } from 'react-hook-form';

export interface I_ListFormHook_Props {
	label: string;
	name: string;
	allElements: Record<string, ioBroker.Object>;
	helperText?: string;
}

const ListFormHook: FC<I_ListFormHook_Props> = ({ label, name, allElements, helperText }: I_ListFormHook_Props) => {
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
									{obj.common.name === '__' ? <em>None</em> : obj.common.name}
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
