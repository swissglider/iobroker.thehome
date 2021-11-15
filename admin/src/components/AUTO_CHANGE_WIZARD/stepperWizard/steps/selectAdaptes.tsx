import { Box, Button, CheckBox, Text } from 'grommet';
import React, { FC } from 'react';
import getRandomString from '../../../../helper/GetRandomKey';

type T_SelectAdapters_Type = {
	selectedAdapters: Record<string, boolean>;
	setAdapterSelected: (adapterName: string, selected: boolean) => void;
	selectAllAdapters: () => void;
	unSelectAllAdapters: () => void;
	next: () => void;
};

const SelectAdapters: FC<T_SelectAdapters_Type> = ({
	selectedAdapters,
	setAdapterSelected,
	selectAllAdapters,
	unSelectAllAdapters,
	next,
}: T_SelectAdapters_Type): JSX.Element => {
	return (
		<Box border={{ style: 'dotted' }} gap="small" pad="small" margin={{ vertical: 'small', horizontal: 'large' }}>
			<Text>Select Adapters to Rename:</Text>
			<Box direction="row" gap="small" justify="end">
				<Button label="select all" onClick={() => selectAllAdapters()} size="small" />
				<Button label="unselect all" onClick={() => unSelectAllAdapters()} size="small" />
			</Box>
			<Box gap="xsmall">
				{Object.entries(selectedAdapters).map(([adapterName, adapterSelected]) => (
					<Box key={getRandomString(adapterName)} border={{ color: 'dark-6' }} pad="xsmall" round="xsmall">
						<Box direction="row" gap="small">
							<Box align="start">
								<CheckBox
									checked={adapterSelected}
									onChange={() => setAdapterSelected(adapterName, !adapterSelected)}
								/>
							</Box>
							<Box align="start">{adapterName}</Box>
						</Box>
					</Box>
				))}
			</Box>
			<Box direction="row" gap="small" justify="end">
				<Button
					label="next"
					onClick={() => next()}
					size="small"
					disabled={Object.values(selectedAdapters).every((e) => !e)}
				/>
			</Box>
		</Box>
	);
};

export default SelectAdapters;
