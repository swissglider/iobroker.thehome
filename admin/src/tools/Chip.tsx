import React from 'react';
import { Add, Trash } from 'grommet-icons';
import { Box, Text, Button } from 'grommet';

type T_Variant = 'delete' | 'add';

interface I_Chip_Props {
	label: string;
	variant: T_Variant;
	disabled?: boolean;
	onClick: (text: string, variant: T_Variant) => void;
}

const getChipIcon = (variant: T_Variant): JSX.Element => {
	return variant === 'delete' ? <Trash size="small" /> : <Add size="small" />;
};

const Chip = (props: I_Chip_Props): JSX.Element => {
	return (
		<Button onClick={() => props.onClick(props.label, props.variant)} plain disabled={props.disabled}>
			{({ disabled, hover, focus }) => (
				<Box
					direction="row"
					align="center"
					gap="medium"
					border={{ color: hover && !disabled ? 'accent-1' : '', size: 'small' }}
					round="xsmall"
					pad={{ horizontal: 'xxsmall', vertical: 'none' }}
					margin="xxsmall"
					// background={hover && !disabled ? { color: 'background-contrast' } : {}}
					// elevation={hover ? 'large' : 'none'}
				>
					<Text size="xxsmall" color={hover && !disabled ? 'accent-1' : ''}>
						{props.label}
					</Text>
					{hover && !disabled
						? React.cloneElement(getChipIcon(props.variant), { color: 'accent-1', weight: 'bold' })
						: React.cloneElement(getChipIcon(props.variant))}
				</Box>
			)}
		</Button>
	);
};

export default Chip;
