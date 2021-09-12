import React, { FC } from 'react';
import { Checkbox, FormControlLabel } from '@material-ui/core';
import { Controller, useFormContext } from 'react-hook-form';

export interface I_CheckboxFormHook_Props {
	label: string;
	name: string;
	disabled?: boolean;
	systemConfig: Record<string, any>;
}

const CheckboxFormHook: FC<I_CheckboxFormHook_Props> = ({ label, name, disabled }: I_CheckboxFormHook_Props) => {
	const { control } = useFormContext();

	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => (
				<FormControlLabel
					control={
						<Checkbox
							disabled={disabled === undefined ? false : disabled}
							onChange={(e) => field.onChange(e.target.checked)}
							checked={field.value}
						/>
					}
					label={label}
				/>
			)}
		/>
	);
};

export default CheckboxFormHook;
