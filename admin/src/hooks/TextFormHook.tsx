import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, TextInput } from 'grommet';

type T_Size =
	| 'xsmall'
	| 'small'
	| 'medium'
	| 'large'
	| 'xlarge'
	| 'xxlarge'
	| '2xl'
	| '3xl'
	| '4xl'
	| '5xl'
	| '6xl'
	| 'string';

export interface I_TextFormHook_Props {
	label: string;
	name: string;
	placeholder?: string;
	disabled?: boolean;
	helperText?: string;
	systemConfig: Record<string, any>;
	onChange?: (value: any, name: string) => void;
	size?: T_Size;
}

const TextFormHook: FC<I_TextFormHook_Props> = ({
	label,
	name,
	disabled,
	helperText,
	size = 'medium',
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
		<FormField
			// label={label}
			error={errors[name]?.message ?? ''}
			// disabled={disabled === undefined ? false : disabled}
			help={label}
			info={helperText ?? ''}
			fill="horizontal"
		>
			<TextInput
				{...register(name)}
				size={size}
				onChange={onChangeNew}
				disabled={disabled === undefined ? false : disabled}
			/>
		</FormField>
	);
};

export default TextFormHook;
