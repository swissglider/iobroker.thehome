import { Box, Heading } from 'grommet';
import React, { FC } from 'react';

type Props = {
	title: string;
	children?: React.ReactNode;
	disabled?: boolean;
};
const ChipResponsiveContainer: FC<Props> = ({ title, children, disabled }: Props): JSX.Element => {
	return (
		<Box
			pad="xsmall"
			border={{ size: 'small' }}
			fill="horizontal"
			direction="row-responsive"
			justify="start"
			alignContent="start"
			wrap
			background={disabled ? { color: 'background' } : { color: 'background-contrast' }}
		>
			<Box
				fill="horizontal"
				border={{
					size: 'xsmall',
					style: 'solid',
					side: 'bottom',
					color: disabled ? 'background-contrast' : '',
				}}
				margin={{ bottom: 'xsmall' }}
			>
				<Heading
					margin={{ top: 'none', bottom: 'xsmall' }}
					color={disabled ? 'background-contrast' : ''}
					level={5}
				>
					{title}
				</Heading>
			</Box>

			{children}
		</Box>
	);
};

export default ChipResponsiveContainer;
