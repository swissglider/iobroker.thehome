import React, { FC, useEffect } from 'react';
import I18n from '@iobroker/adapter-react/i18n';
import { GENERIC_APP } from '../../tab-app';
import { Heading, Button, Box } from 'grommet';

const NetatmoReAranger: FC<any> = () => {
	// const [pending, setPending] = React.useState(true);

	const rearangeDeviceAndStates = () => {
		try {
			GENERIC_APP.socket
				.sendTo('thehome.0', 'NetatmoAdapter:rearangeAllChannelsAndStates', {})
				.then((result: ioBroker.Message | undefined) => {
					if (typeof result === 'string' && result === 'ok') {
						GENERIC_APP.onToast(I18n.t('Netatmo Names and Enums sucessfully rearanged'));
					} else {
						GENERIC_APP.onError(I18n.t('Error: ') + result);
					}
				})
				.catch((reason) => {
					console.error(reason);
					GENERIC_APP.onError(reason);
				});
		} catch (error) {
			console.error(error);
			GENERIC_APP.onError(error);
		}
	};

	const loadCountDeviceTypes = () => {
		try {
			GENERIC_APP.socket
				.sendTo('thehome.0', 'NetatmoAdapter:getCountDeviceTypes', {})
				.then((result: ioBroker.Message | undefined) => {
					if (typeof result === 'string' && result === 'ok') {
						GENERIC_APP.onToast(I18n.t('Netatmo Names and Enums sucessfully rearanged'));
					} else {
						GENERIC_APP.onError(I18n.t('Error: ') + result);
					}
				})
				.catch((reason) => {
					console.error(reason);
					GENERIC_APP.onError(reason);
				})
				.finally(() => setPending(false));
		} catch (error) {
			console.error(error);
			GENERIC_APP.onError(error);
		}
	};

	useEffect(() => {
		// loadDataFromMeHomeCloud();
		loadCountDeviceTypes();
		return () => {
			t: 't';
		};
	}, []);

	return (
		<>
			<Heading margin="small" level={3}>
				{I18n.t('netatmoReAranger')}
			</Heading>
			<Box direction="row" margin="none" pad="none" gap="medium">
				<Button
					label={I18n.t('Rearange Netatmo Names and Enums')}
					onClick={() => rearangeDeviceAndStates()}
					fill={false}
					size="small"
				/>
			</Box>
		</>
	);
};

export default NetatmoReAranger;
