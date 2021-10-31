import I18n from '@iobroker/adapter-react/i18n';
import { Box, CheckBox, FormField } from 'grommet';
import React, { FC } from 'react';
import { T_General_Props } from '../../../tools/NavigationTabs/Types_States';

const StateConfigGeneralSettings: FC<T_General_Props> = (props: T_General_Props): JSX.Element => {
	return (
		<Box fill="horizontal" justify="center">
			<form>
				<Box direction="row" justify="center">
					<FormField help={<Box width={{ max: '300px' }}>{I18n.t('StatConfigHelperText')}</Box>}>
						<CheckBox
							checked={props.native['ConfigChangeListener_active']}
							onChange={() =>
								props.onChange(
									'ConfigChangeListener_active',
									!props.native['ConfigChangeListener_active'],
								)
							}
							label={I18n.t('ConfigChangeListener_active')}
						/>
					</FormField>
				</Box>
			</form>
		</Box>
	);
};

export default StateConfigGeneralSettings;
