import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';

export interface I_HiddenInputFormHook_Props {
	name: string;
	systemConfig: Record<string, any>;
}

const HiddenInputFormHook: FC<I_HiddenInputFormHook_Props> = ({ name }: I_HiddenInputFormHook_Props) => {
	const { register } = useFormContext();

	return <input {...register(name)} type="hidden" />;
};

export default HiddenInputFormHook;
