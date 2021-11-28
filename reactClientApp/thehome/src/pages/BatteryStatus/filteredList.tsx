import React, { FC, useEffect, useState } from 'react';
import { Box, Button, CheckBox, ColumnConfig, DataTable, Heading, Layer, Select, Text } from 'grommet';
import { T_GenericApp } from '../../types/T_GenericApp';
import { useHistory } from 'react-router-dom';
import { Filter, FormClose, Trash, FormCheckmark } from 'grommet-icons';
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

const BatteryStatusFilteredList: FC<T_BatteryStatusFilteredList_Props> = ({ genericApp, valueType }: T_BatteryStatusFilteredList_Props) => {
	const [dataFromStat, setDataFromState] = useState<any[]>([]);
	const [filteredData, setFilteredData] = useState<any[]>([]);
	const [rowProps, setRowProps] = useState<any>({});
	const [ready, setReady] = useState<boolean>(false);
	const [filterOpen, setFilterOpen] = useState<boolean>(false);
	const [filterMap, setFilterMap] = useState<Record<string, any[]>>({})
	const [selectedfilterMap, setSelectedFilterMap] = useState<Record<string, number[]>>({})
	const [percentFilterValuesRecoil, setPercentFilterValuesRecoil] = useRecoilState(BatteryStatusPercentFilterValuesState);
	const [booleanFilterValuesRecoil, setBooleanFilterValuesRecoil] = useRecoilState(BatteryStatusBooleanFilterValuesState);

	const setSelectedFilter = (selected: any, type: string): void => {
		const selectedfilterMap_ = { ...selectedfilterMap }
		selectedfilterMap_[type] = selected;
		setSelectedFilterMap(selectedfilterMap_)
	}

	const changeFilterValuesToRecoil = (selectedfilterMap_?: Record<string, number[]>): void => {
		const _selectedfilterMap = selectedfilterMap_ ?? selectedfilterMap;
		const tempMap: Record<string, any[]> = {}
		Object.entries(_selectedfilterMap).forEach(([key, values]) => {
			values.forEach(i => {
				if (filterMap[key] && filterMap[key][i]) {
					if (!tempMap[key]) {
						tempMap[key] = []
					}
					tempMap[key].push(filterMap[key][i])
				}
			})
		})
		if (valueType === 'percent') {
			setPercentFilterValuesRecoil(tempMap);
		} else {
			setBooleanFilterValuesRecoil(tempMap);
		}
	}

	const updateFilterValuesFromRecoil = (filterMap_?: Record<string, any[]>): Record<string, number[]> => {
		const _filterMap = filterMap_ ?? filterMap;
		const tempMapRecoil = (valueType === 'percent') ? { ...percentFilterValuesRecoil } : { ...booleanFilterValuesRecoil }
		const tempSelectedFilterMap: Record<string, number[]> = {}

		Object.entries(tempMapRecoil).forEach(([key, values]) => {
			values.forEach(value => {
				if (!tempSelectedFilterMap[key]) {
					tempSelectedFilterMap[key] = [] as number[];
				}
				const tempIndex = _filterMap[key].indexOf(value);
				if (_filterMap[key] && tempIndex !== -1) {
					tempSelectedFilterMap[key].push(tempIndex)
				}
			})
		})
		setSelectedFilterMap(tempSelectedFilterMap);
		return tempSelectedFilterMap;
	}

	const history = useHistory();

	const openFilter = (): void => setFilterOpen(true);

	const cleanFilter = (): void => {
		setSelectedFilterMap({});
		changeFilterValuesToRecoil({});
		setFilterOpen(false);
	}

	const setFilter = (): void => {
		changeFilterValuesToRecoil();
		setFilterOpen(false);
	}

	const resetFilter = (): void => {
		updateFilterValuesFromRecoil();
		setFilterOpen(false)
	}

	const filterData = (_rowData?: any[]): void => {
		console.log('filterData')
		const rowData: any[] = _rowData ?? dataFromStat;
		const lowAlert = (genericApp.state.native as any)['BatteryChecker_lowBatPercent_alert'];
		const lowWarn = (genericApp.state.native as any)['BatteryChecker_lowBatPercent_warning'];
		const tempMap = (valueType === 'percent') ? { ...percentFilterValuesRecoil } : { ...booleanFilterValuesRecoil }


		const isInFilter = (struct: Record<string, any>): boolean => {
			const t = Object.entries(struct).every(([key, value]) => {
				if (!tempMap[key] || tempMap[key].length === 0) return true
				return (tempMap[key].indexOf(value) !== -1)
			})
			console.log(struct, t)
			return t;
		}

		const filteredData: any[] = rowData.filter(isInFilter)

		// ToDo filter rowData to filteredData --> filter are in tempMap

		const _rowProps_ = {}
		for (const stat of filteredData) {
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
		setFilteredData(filteredData);
		setRowProps(_rowProps_);
	}

	useEffect(() => {
		setReady(false);
		genericApp.socket.getState('thehome.0.batteryStati').then((state) => {
			if (state && state.val && typeof state.val == 'string') {
				const rowData = (valueType === 'percent')
					? JSON.parse(state.val).filter((e: any) => e.value_type === 'number')
					: JSON.parse(state.val).filter((e: any) => e.value_type === 'boolean');

				setDataFromState(rowData)

				// create Filter Map and update selected Filter from Recoil
				const filterMap_: Record<string, any[]> = {}
				Object.values(rowData).forEach((da: any) => {
					Object.entries(da).forEach(([key, value]) => {
						if (key in filterMap_ && Array.isArray(filterMap_[key]) && !filterMap_[key].includes(value)) {
							filterMap_[key].push(value)
						}
						else if (!(key in filterMap_ && Array.isArray(filterMap_[key]))) {
							filterMap_[key] = [value]
						}
						filterMap_[key].sort();
					})
				})
				setFilterMap(filterMap_);
				updateFilterValuesFromRecoil(filterMap_);
				filterData(rowData);

				setReady(true);
			}
		});
	}, []);

	useEffect(() => {
		filterData();
	}, [percentFilterValuesRecoil, booleanFilterValuesRecoil])

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
						{filteredData.length === 0 ? (
							<Heading level={3} margin={{ horizontal: 'small', vertical: 'small' }} color="status-ok">
								No Battery found with {valueType}
							</Heading>
						) : (
							<DataTable
								fill
								pin
								columns={columns}
								data={filteredData}
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
								<Box direction="row" gap="medium">
									<Button
										icon={<FormCheckmark />}
										size="small"
										plain
										onClick={() => setFilter()}
									/>
									<Button alignSelf="end" icon={<FormClose />} onClick={() => resetFilter()} />
								</Box>
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
											options={values}
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
