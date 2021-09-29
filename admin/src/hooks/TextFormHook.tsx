import React, { FC } from 'react';
import { TextField } from '@material-ui/core';
import { useFormContext } from 'react-hook-form';

export interface I_TextFormHook_Props {
	label: string;
	name: string;
	placeholder?: string;
	disabled?: boolean;
	systemConfig: Record<string, any>;
	onChange?: (value: any, name: string) => void;
}

const TextFormHook: FC<I_TextFormHook_Props> = ({
	label,
	name,
	placeholder,
	disabled,
	onChange: onChangeProps,
}: I_TextFormHook_Props) => {
	const {
		register,
		formState: { errors },
	} = useFormContext();

	const { onChange } = register('lastChange');

	const onChangeNew = (e: any) => {
		if (onChangeProps) onChangeProps(name, e.target.value);
		onChange(e);
	};

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
			onChange={onChangeNew}
		/>
	);
};

export default TextFormHook;
