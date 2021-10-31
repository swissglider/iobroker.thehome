import { Grid } from '@mui/material';
import React, { FC } from 'react';
import styled, { keyframes } from 'styled-components';

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.div`
	margin: 16px;
	animation: ${rotate360} 1s linear infinite;
	transform: translateZ(0);
	border-top: 2px solid grey;
	border-right: 2px solid grey;
	border-bottom: 2px solid grey;
	border-left: 4px solid black;
	background: transparent;
	width: 80px;
	height: 80px;
	border-radius: 50%;
`;

export interface I_SpinnerLoader_Props {
	spinnerText: string;
}

const SpinnerLoader: FC<I_SpinnerLoader_Props> = (props: I_SpinnerLoader_Props) => {
	return (
		<div style={{ padding: '24px' }}>
			<Grid container direction="column" spacing={1} justifyContent="space-between" alignItems="center">
				<Grid item xs={12}>
					<Spinner />
				</Grid>
				<Grid item xs={12}>
					<div>{props.spinnerText}</div>
				</Grid>
			</Grid>
		</div>
	);
};

export default SpinnerLoader;
