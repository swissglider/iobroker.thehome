import React, { FC } from 'react';
import { TextField } from '@material-ui/core';
import { useFormContext } from 'react-hook-form';

export interface I_TextFormHook_Props {
	label: string;
	name: string;
	placeholder?: string;
	disabled?: boolean;
	systemConfig: Record<string, any>;
}

const TextFormHook: FC<I_TextFormHook_Props> = ({ label, name, placeholder, disabled }: I_TextFormHook_Props) => {
	const {
		register,
		formState: { errors },
	} = useFormContext();

	return (
		<TextField
			label={label}
			style={{ margin: 8 }}
			placeholder={placeholder ?? ''}
			error={!!errors[name]}
			helperText={errors[name]?.message ?? ''}
			fullWidth
			margin="normal"
			InputLabelProps={{
				shrink: true,
			}}
			disabled={disabled === undefined ? false : disabled}
			{...register(name)}
		/>
	);
};

export default TextFormHook;
