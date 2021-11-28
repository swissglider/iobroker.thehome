import React, { FC, useEffect, useState } from 'react';
import { Box, ColumnConfig, DataTable, Heading } from 'grommet';
import { T_GenericApp } from '../../types/T_GenericApp';
import { useRecoilValue } from 'recoil';
import { totalHeightState } from '../../helper/AtomAndSelectors';
import { useHistory } from 'react-router-dom';

type T_BatteryStatus_Props = {
	genericApp: T_GenericApp;
}

const BatteryStatus: FC<T_BatteryStatus_Props> = ({ genericApp }: T_BatteryStatus_Props) => {
	const [data, setData] = useState<any[]>([]);
	const [rowProps, setRowProps] = useState<any>({});
	const [ready, setReady] = useState<boolean>(false);
	const totalHeight = useRecoilValue(totalHeightState);

	const history = useHistory();

	const tableHeight = `${totalHeight - 350}px`;
	console.log(totalHeight, tableHeight)

	const columns: ColumnConfig<any>[] = [
		{
			header: 'Name',
			primary: true,
			property: 'name',
			sortable: false,
			size: 'xlarge',
			render: (status: any): JSX.Element => {
				const nameArray = status.name.split('_');
				nameArray.length > 1 && nameArray.pop();
				return (
					<span style={{ fontSize: '15px' }}>{nameArray.join(' ')}</span>
				)
			},
		},
		{
			header: 'Value',
			property: 'value',
			sortable: false,
			size: 'xsmall',
			align: 'end',
			render: (status: any): JSX.Element => {
				return (
					<span style={{ fontSize: '15px' }}>{status.value}</span>
				)
			},
		},
	];

	useEffect(() => {
		setReady(false);
		const lowAlert = (genericApp.state.native as any)['BatteryChecker_lowBatPercent_alert'];
		// const lowAlert = 90;
		const lowWarn = (genericApp.state.native as any)['BatteryChecker_lowBatPercent_warning'];
		// const lowWarn = 100;
		genericApp.socket.getState('thehome.0.batteryStati').then((state) => {
			if (state && state.val && typeof state.val == 'string') {
				const filteredV = JSON.parse(state.val).filter((e: any) => e.value_type === 'number' && e.value <= lowWarn);
				const filteredB = JSON.parse(state.val).filter((e: any) => e.value_type === 'boolean' && e.value === 1);
				const _rowPropsV = {};
				for (const stat of filteredV) {
					if (stat.value <= lowAlert) {
						(_rowPropsV as any)[stat.name] = { background: ['status-critical'], pad: 'small' };
					}
					if (
						stat.value <= lowWarn &&
						stat.value > lowAlert
					) {
						(_rowPropsV as any)[stat.name] = { background: ['status-warning'], pad: 'small' };
					}
				}

				const _rowPropsB = {};
				for (const stat of filteredB) {
					if (stat.value === 1) {
						(_rowPropsB as any)[stat.name] = { background: ['status-critical'], pad: 'small' };
					}
				}
				setData([...filteredB, ...filteredV]);
				setRowProps({ ..._rowPropsV, ..._rowPropsB });
				setReady(true);
			}
		});

		return () => {
			't';
		};
	}, []);

	return ready ?
		(
			<>
				<Box gap="xsmall" direction="column" justify="start" pad="none" margin="none">
					<Heading level={2} margin={{ horizontal: 'small', vertical: 'small' }} color="brand">
						Battery with critical level
					</Heading>
					<Box
						height={tableHeight}
						overflow={{ horizontal: 'hidden', vertical: 'auto' }}
					>
						{data.length === 0 ? (
							<Heading level={3} margin={{ horizontal: 'small', vertical: 'small' }} color="status-ok">
								No Battery with critical level
							</Heading>
						) : (
							<DataTable
								fill
								pin
								columns={columns}
								data={data}
								background={{
									header: { color: 'dark-3', opacity: 'strong' },
									body: ['light-1', 'light-3'],
									footer: { color: 'dark-3', opacity: 'strong' },
								}}
								border={{ body: 'bottom' }}
								rowProps={rowProps}
								onClickRow={(value) => {
									value.preventDefault();
									history.push(`/batDetail?details=${JSON.stringify(value.datum)}`);

								}}
								sort={{ direction: "asc", property: "value" }}
							/>
						)}
					</Box>
				</Box >
			</>
		) : (
			<div>wait</div>
		);
};

export default BatteryStatus;
