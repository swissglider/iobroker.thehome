import React, { FC } from 'react';
import I18n from '@iobroker/adapter-react/i18n';
import { Box, Button, CheckBox } from 'grommet';
import { T_General_Props } from '../tools/NavigationTabs/Types_States';

const Settings: FC<T_General_Props> = (props: T_General_Props): JSX.Element => {
	const renderCheckbox = (title: AdminWord, attr: string): JSX.Element => {
		return (
			<CheckBox
				checked={props.native[attr]}
				onChange={() => props.onChange(attr, !props.native[attr])}
				label={I18n.t(title)}
			/>
		);
	};

	const onClick = () => {
		// props.onToast({ title: 'Hallo Toast', text: 'this is the text' });
		props.onToast('this is the text');
	};

	const onClickError = () => {
		props.onError({ title: 'Hallo Error', text: 'this is the error' });
	};

	return (
		<Box fill="horizontal" justify="center">
			<form>
				<Box direction="row" justify="center">
					{renderCheckbox('ConnectionChecker_disabled', 'ConnectionChecker_disabled')}
				</Box>
			</form>
			<Box align="center" justify="center" direction="row" pad="medium" gap="medium" fill>
				<Button label="Toast" onClick={() => onClick()} />
				<Button secondary label="Error" onClick={() => onClickError()} />
			</Box>
		</Box>
	);
};

export default Settings;
