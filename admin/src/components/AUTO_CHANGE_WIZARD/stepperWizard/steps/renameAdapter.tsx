import { Box, Button, Text } from 'grommet';
import React, { FC } from 'react';
import getRandomString from '../../../../helper/GetRandomKey';
import { T_General_Props } from '../../../../tools/NavigationTabs/Types_States';

type T_RenameAdapter_Type = {
	selectedAdapters: Record<string, boolean>;
	setRenameResult: (results: Record<string, Record<string, string> | string>) => void;
	generalProps: T_General_Props;
	back: () => void;
	setLoading: (value: boolean) => void;
};

const RenameAdapter: FC<T_RenameAdapter_Type> = ({
	selectedAdapters,
	setRenameResult,
	generalProps,
	back,
	setLoading,
}: T_RenameAdapter_Type): JSX.Element => {
	const rename = (): void => {
		setLoading(true);
		try {
			const promises: Promise<ioBroker.Message | undefined>[] = [];
			const selectedAdapterNames: string[] = Object.entries(selectedAdapters)
				.filter(([, adapterSelected]) => adapterSelected)
				.map(([adapterName]) => adapterName);
			for (const adapterName of selectedAdapterNames) {
				promises.push(
					generalProps.socket.sendTo(generalProps.adapterInstanceName, 'rename', {
						adapterName: adapterName,
					}),
				);
			}
			Promise.all(promises).then((values) => {
				const results = values as unknown as Record<string, string>[];
				const returnResults: Record<string, Record<string, string> | string> = {};
				results.forEach((result, index) => {
					returnResults[selectedAdapterNames[index]] = result;
				});
				setRenameResult(returnResults);
				setLoading(false);
			});
		} catch (error) {
			generalProps.onError(error);
			setLoading(false);
		}
	};

	return (
		<Box border={{ style: 'dotted' }} gap="small" pad="small" margin={{ vertical: 'small', horizontal: 'large' }}>
			<Text>Select Adapters to Rename:</Text>
			<Box gap="xsmall">
				{Object.entries(selectedAdapters)
					.filter(([, adapterSelected]) => adapterSelected)
					.map(([adapterName]) => (
						<Box
							key={getRandomString(adapterName)}
							border={{ color: 'dark-6' }}
							pad="xsmall"
							round="xsmall"
						>
							<Box direction="row" gap="small">
								<Box align="start">{adapterName}</Box>
							</Box>
						</Box>
					))}
			</Box>
			<Box direction="row" gap="small" justify="end">
				<Button label="back" onClick={() => back()} size="small" />
				<Button label="rename" onClick={() => rename()} size="small" color="status-critical" />
			</Box>
		</Box>
	);
};
export default RenameAdapter;
