import I18n from '@iobroker/adapter-react/i18n';
import { Box, Button, Text } from 'grommet';
import React, { FC } from 'react';
import { T_General_Props } from '../../../../tools/NavigationTabs/Types_States';

const adapterName = 'InfluxDBHandlerAdapter';

type T_RefreshInfluxDBTags_Type = {
	generalProps: T_General_Props;
	back: () => void;
	finish: () => void;
};

const RefreshInfluxDBTags: FC<T_RefreshInfluxDBTags_Type> = ({
	generalProps,
	back,
	finish,
}: T_RefreshInfluxDBTags_Type): JSX.Element => {
	const refreshAllTagsOnInfluxDB = async () => {
		generalProps
			.sendToWithWaitModul(generalProps.adapterInstanceName, 'refreshAllTagsOnInfluxDB', {
				adapterName: adapterName,
			})
			.then((result: ioBroker.Message | undefined) => {
				finish();
				if (typeof result === 'string' && result === 'ok') {
					generalProps.onToast({
						title: I18n.t('Result from Adapter'),
						text: I18n.t('All Tags sucessfully reseted'),
					});
				} else {
					generalProps.onError(I18n.t('Error: ') + JSON.stringify(result));
				}
			})
			.catch((reason) => {
				generalProps.onError(I18n.t('Error: ') + JSON.stringify(reason));
			});
	};

	return (
		<Box border={{ style: 'dotted' }} gap="medium" pad="small" margin={{ vertical: 'small', horizontal: 'large' }}>
			<Text>Update Tags on InfluxDB with Changes:</Text>
			<Box direction="row" gap="small" justify="center">
				<Button label="Refresh InfluxDB Tags" onClick={() => refreshAllTagsOnInfluxDB()} />
			</Box>
			<Box direction="row" gap="small" justify="end">
				<Button label="back" onClick={() => back()} size="small" />
				<Button label="finish" onClick={() => finish()} size="small" />
			</Box>
		</Box>
	);
};

export default RefreshInfluxDBTags;
