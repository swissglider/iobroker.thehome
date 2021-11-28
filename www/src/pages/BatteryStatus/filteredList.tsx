import React, { FC, useEffect, useState } from 'react';
import { Box, Button, CheckBox, ColumnConfig, DataTable, Heading, Layer, Select, Text } from 'grommet';
import { T_GenericApp } from '../../types/T_GenericApp';
import { useHistory } from 'react-router-dom';
import { Filter, FormClose, Trash, Checkmark } from 'grommet-icons';
import { useRecoilState } from 'recoil';
import { BatteryStatusBooleanFilterValuesState, BatteryStatusPercentFilterValuesState } from '../../helper/AtomAndSelectors';

type T_BatteryStatusFilteredList_Props = {
	genericApp: T_GenericApp;
	valueType: 'percent' | 'boolean'
}

const Option = React.memo(({ value, selected }: any) => (
	<Box direction="row" gap="small" align="center" pad="xsmall">
		<CheckBox tabIndex={-1} checked={selected} onChange={() => { }} />
		{value}
	</Box>
));

const BatteryStatusFilteredList: FC<T_BatteryStatusFilteredList_Props> = ({ genericApp, valueType }: T_BatteryStatusFilteredList_Props) => {
	const [data, setData] = useState<any[]>([]);
	const [rowProps, setRowProps] = useState<any>({});
	const [ready, setReady] = useState<boolean>(false);
	const [filterOpen, setFilterOpen] = useState<boolean>(false);
	const [filterMap, setFilterMap] = useState<Record<string, any[]>>({})
	const [selectedfilterMap, setSelectedFilterMap] = useState<Record<string, number[]>>({})
	const [percentFilterValues, setPercentFilterValues] = useRecoilState(BatteryStatusPercentFilterValuesState);
	const [booleanFilterValues, setBooleanFilterValues] = useRecoilState(BatteryStatusBooleanFilterValuesState);

	const setSelectedFilter = (selected: any, type: string): void => {
		const selectedfilterMap_ = { ...selectedfilterMap }
		selectedfilterMap_[type] = selected;
		setSelectedFilterMap(selectedfilterMap_)
	}

	const changeFilterValues = (): void => { }

	const history = useHistory();

	const openFilter = (): void => setFilterOpen(true);

	const cleanFilter = (): void => {
		setSelectedFilterMap({});
	}

	const setFilter = (): void => setFilterOpen(false);

	const resetFilter = (): void => {
		setFilterOpen(false)
	}

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
		const lowWarn = (genericApp.state.native as any)['BatteryChecker_lowBatPercent_warning'];
		genericApp.socket.getState('thehome.0.batteryStati').then((state) => {
			if (state && state.val && typeof state.val == 'string') {
				const data_ = (valueType === 'percent')
					? JSON.parse(state.val).filter((e: any) => e.value_type === 'number')
					: JSON.parse(state.val).filter((e: any) => e.value_type === 'boolean');
				const _rowProps_ = {}
				for (const stat of data_) {
					if (valueType === 'percent') {
						if (stat.value <= lowAlert) {
							(_rowProps_ as any)[stat.name] = { background: ['status-critical'], pad: 'small' };
						}
						if (
							stat.value <= lowWarn &&
							stat.value > lowAlert
						) {
							(_rowProps_ as any)[stat.name] = { background: ['status-warning'], pad: 'small' };
						}
					}
					if (valueType === 'boolean') {
						if (stat.value === 1) {
							(_rowProps_ as any)[stat.name] = { background: ['status-critical'], pad: 'small' };
						}
					}
				}
				setData(data_);
				setRowProps(_rowProps_);

				const filterMap_: Record<string, any[]> = {}
				Object.values(data_).forEach((da: any) => {
					Object.entries(da).forEach(([key, value]) => {
						if (key in filterMap_ && Array.isArray(filterMap_[key]) && !filterMap_[key].includes(value)) {
							filterMap_[key].push(value)
						}
						else if (!(key in filterMap_ && Array.isArray(filterMap_[key]))) {
							filterMap_[key] = [value]
						}
					})
				})
				// console.log(filterMap_);
				setFilterMap(filterMap_);

				setReady(true);
			}
		});
	}, []);

	return ready ?
		(
			<>
				<Box gap="xsmall" direction="column" justify="start" pad="none" margin="none">
					<Box direction="row" gap="medium">
						<Text>Filters:</Text>
						<Button
							icon={<Filter color={Object.values(selectedfilterMap).some(e => e.length > 0) ? 'brand' : ''} />}
							size="small"
							plain
							onClick={() => openFilter()}
						/>
						<Button
							icon={<Trash />}
							size="small"
							plain
							onClick={() => cleanFilter()}
							disabled={Object.values(selectedfilterMap).some(e => e.length > 0) ? false : true}
						/>
					</Box>
					<Box
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
				{filterOpen && (
					<Layer
						position="center"
						onClickOutside={() => resetFilter()}
						onEsc={() => resetFilter()}
						full={true}
					>
						<Box
							margin="small"
							border={{ style: 'solid', color: 'headerBorder' }}
							round="xsmall"
							elevation="small"
						>
							<Box
								direction="row"
								align="center"
								as="header"
								justify="between"
								background={{ color: 'headerBorder' }}
							>
								<Text margin={{ left: 'small' }}>Set Filters</Text>
								<Button alignSelf="end" icon={<FormClose />} onClick={() => resetFilter()} />
							</Box>
							<Box as="main" flex overflow="auto" margin={{ vertical: 'small', horizontal: 'small' }} gap="xsmall">
								{Object.entries(filterMap).filter(([key,]) => !['id', 'name'].includes(key)).map(([key, values]) => (
									<Box as="header" key={key} direction="row" gap="large" justify="between">
										<Text size="small">{key}</Text>
										<Select
											multiple
											size="small"
											closeOnChange={false}
											placeholder={`select an ${key}...`}
											options={values.sort()}
											dropHeight="small"
											selected={selectedfilterMap[key]}
											onChange={({ selected: nextSelected }) => {
												setSelectedFilter(nextSelected, key);
											}}
										>
											{(option, index: number) => (
												<Option value={option} selected={(selectedfilterMap[key] ?? ([] as number[])).indexOf(index) !== -1} />
											)}
										</Select>
									</Box>
								))}
							</Box>
							<Box align="end" margin="small">
								<Box direction="row" gap="large">
									<Button
										icon={<Checkmark />}
										size="small"
										plain
										onClick={() => setFilter()}
									/>
								</Box>
							</Box>
						</Box>
					</Layer>
				)}
			</>
		) : (
			<div>wait</div>
		);
};

type T_BatteryStatusXList_Props = {
	genericApp: T_GenericApp;
}

export const BatteryStatusPercentList: FC<T_BatteryStatusXList_Props> = ({ genericApp }: T_BatteryStatusXList_Props) => {
	return <BatteryStatusFilteredList genericApp={genericApp} valueType="percent" />
}

export const BatteryStatusBooleanList: FC<T_BatteryStatusXList_Props> = ({ genericApp }: T_BatteryStatusXList_Props) => {
	return <BatteryStatusFilteredList genericApp={genericApp} valueType="boolean" />
}
