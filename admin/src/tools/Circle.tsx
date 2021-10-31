import { Tip } from 'grommet';
import React, { FC } from 'react';

type T_Circle_Props = {
	tip?: string;
	status?: boolean;
	color?: string;
};

const Circle: FC<T_Circle_Props> = (props: T_Circle_Props): JSX.Element => {
	return (
		<Tip content={props.tip ?? ''}>
			<span
				style={{
					height: '25px',
					width: '25px',
					backgroundColor:
						props.status !== undefined ? (props.status ? 'green' : 'red') : props.color ?? '#bbb',
					borderRadius: '50%',
					display: 'inline-block',
				}}
			></span>
		</Tip>
	);
};

export default Circle;
