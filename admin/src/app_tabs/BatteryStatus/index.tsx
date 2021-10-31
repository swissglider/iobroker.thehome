import React, { FC, useEffect, useState } from 'react';
import I18n from '@iobroker/adapter-react/i18n';
import { Box, ColumnConfig, DataTable, Heading, ResponsiveContext } from 'grommet';
import { GENERIC_APP } from '../../tab-app';

const columns: ColumnConfig<any>[] = [
	{
		header: 'Name',
		primary: true,
		property: 'name',
		sortable: true,
		size: 'xlarge',
		// dataScope: 'row',
		// render: (status: any): JSX.Element => (
		// 	<span style={{ fontSize: '15px' }}>{status.name.replaceAll('_', ' ')}</span>
		// ),
	},
	{
		header: 'Value',
		property: 'value',
		sortable: true,
		size: 'xsmall',
		align: 'end',
		// render: (status: any): JSX.Element => <span style={{ fontSize: '15px' }}>{status.value}</span>,
	},
	{
		header: 'Room',
		property: 'room',
		sortable: true,
		size: 'xsmall',
		align: 'end',
		// render: (status: any): JSX.Element => <span style={{ fontSize: '15px' }}>{status.room}</span>,
	},
];

const BatteryStatus: FC<any> = () => {
	const size = React.useContext(ResponsiveContext);
	const fontSizeHeader = size === 'small' ? '10px' : '16px';
	const fontSizeBody = size === 'small' ? '9px' : '15px';
	const [dataNumber, setDataNumber] = useState<any>([]);
	const [dataBoolean, setDataBoolean] = useState<any>([]);
	const [sortV, setSortV] = React.useState<any>({
		property: 'value',
		direction: 'asc',
	});
	const [sortB, setSortB] = React.useState<any>({
		property: 'value',
		direction: 'desc',
	});
	const [rowPropsV, setRowPropsV] = useState<any>({});
	const [rowPropsB, setRowPropsB] = useState<any>({});

	useEffect(() => {
		GENERIC_APP.socket.getState('thehome.0.batteryStati').then((state) => {
			if (state && state.val && typeof state.val == 'string') {
				const filteredV = JSON.parse(state.val).filter((e: any) => e.value_type === 'number');
				const filteredB = JSON.parse(state.val).filter((e: any) => e.value_type === 'boolean');
				setDataNumber(filteredV);
				setDataBoolean(filteredB);
				const _rowPropsV = {};
				for (const stat of filteredV) {
					if (stat.value <= GENERIC_APP.state.native['BatteryChecker_lowBatPercent_alert']) {
						_rowPropsV[stat.name] = { background: ['status-critical'], pad: 'small' };
					}
					if (
						stat.value <= GENERIC_APP.state.native['BatteryChecker_lowBatPercent_warning'] &&
						stat.value > GENERIC_APP.state.native['BatteryChecker_lowBatPercent_alert']
					) {
						_rowPropsV[stat.name] = { background: ['status-warning'], pad: 'small' };
					}
				}
				setRowPropsV(_rowPropsV);

				const _rowPropsB = {};
				for (const stat of filteredB) {
					if (stat.value === 1) {
						_rowPropsB[stat.name] = { background: ['status-critical'], pad: 'small' };
					}
				}
				setRowPropsB(_rowPropsB);
			}
		});

		return () => {
			t: 't';
		};
	}, []);

	const ExpandedComponent = (props: any) => (
		<Box>
			<pre>{JSON.stringify(props, null, 2)}</pre>
		</Box>
	);

	return (
		<>
			<Heading margin="small" level={5}>
				{I18n.t('batterStatus')} in % - {size}
			</Heading>
			<DataTable
				// sortable={true}
				// columns={columns.map((c) => ({
				// 	...c,
				// 	search: c.property === 'name' || c.property === 'room',
				// }))}
				columns={columns.map((c) => {
					return {
						...c,
						header: <span style={{ fontSize: fontSizeHeader }}>{c.property}</span>,
						// eslint-disable-next-line react/display-name
						render: (status: any): JSX.Element =>
							c.property === 'name' ? (
								<span style={{ fontSize: fontSizeBody }}>{status.name.replaceAll('_', ' ')}</span>
							) : (
								<span style={{ fontSize: fontSizeBody }}>{status[c.property]}</span>
							),
					};
				})}
				data={dataNumber}
				step={5}
				sort={sortV}
				onSort={setSortV}
				background={{
					header: { color: 'dark-3', opacity: 'strong' },
					body: ['light-1', 'light-3'],
					footer: { color: 'dark-3', opacity: 'strong' },
				}}
				border={{ body: 'bottom' }}
				rowDetails={ExpandedComponent}
				rowProps={rowPropsV}
				paginate={{ size: 'small' }}
			/>
			<Heading margin="small" level={5}>
				{I18n.t('batterStatus')} in lowBat
			</Heading>
			<DataTable
				// sortable={true}
				// columns={columns.map((c) => ({
				// 	...c,
				// 	search: c.property === 'name' || c.property === 'room',
				// }))}
				columns={columns.map((c) => {
					return {
						...c,
						header: <span style={{ fontSize: fontSizeHeader }}>{c.property}</span>,
						// eslint-disable-next-line react/display-name
						render: (status: any): JSX.Element =>
							c.property === 'name' ? (
								<span style={{ fontSize: fontSizeBody }}>{status.name.replaceAll('_', ' ')}</span>
							) : (
								<span style={{ fontSize: fontSizeBody }}>{status[c.property]}</span>
							),
					};
				})}
				data={dataBoolean}
				step={5}
				paginate={{ size: 'small' }}
				sort={sortB}
				onSort={setSortB}
				background={{
					header: { color: 'dark-3', opacity: 'strong' },
					body: ['light-1', 'light-3'],
					footer: { color: 'dark-3', opacity: 'strong' },
				}}
				rowDetails={ExpandedComponent}
				border={{ body: 'bottom' }}
				rowProps={rowPropsB}
			/>
		</>
	);
};

export default BatteryStatus;
