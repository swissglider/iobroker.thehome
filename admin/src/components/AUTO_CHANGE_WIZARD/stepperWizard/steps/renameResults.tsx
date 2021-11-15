import { Box, Button, Text } from 'grommet';
import React, { FC } from 'react';
import getRandomString from '../../../../helper/GetRandomKey';

type T_RenameResults_Type = {
	renameResults: Record<string, Record<string, string> | string>;
	next: () => void;
	back: () => void;
};

const RenameResults: FC<T_RenameResults_Type> = ({ renameResults, next, back }: T_RenameResults_Type): JSX.Element => {
	console.log(renameResults);
	return (
		<Box border={{ style: 'dotted' }} gap="small" pad="small" margin={{ vertical: 'small', horizontal: 'large' }}>
			<Text>Results from Rename:</Text>
			<Box gap="xsmall">
				{Object.entries(renameResults).map(([adapterName, result]) => (
					<Box
						key={getRandomString(adapterName)}
						border={{ color: 'dark-6' }}
						pad="xsmall"
						round="xsmall"
						background={result === 'ok' ? { color: 'status-ok' } : { color: 'status-error' }}
					>
						<Box
							direction="row"
							gap="small"
							background={result === 'ok' ? { color: 'status-ok' } : { color: 'status-error' }}
						>
							<Box align="start">{adapterName}:</Box>
							<Box align="start">{result === 'ok' ? 'ok' : JSON.stringify(result)}</Box>
						</Box>
					</Box>
				))}
			</Box>
			<Box direction="row" gap="small" justify="end">
				<Button label="back" onClick={() => back()} size="small" />
				<Button label="next" onClick={() => next()} size="small" />
			</Box>
		</Box>
	);
};

export default RenameResults;
