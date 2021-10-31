import * as React from 'react';
import { Text, Box, Meter, DataTable } from 'grommet';
const columns = [
	{
		property: 'name',
		header: <Text>Foods and Drinks</Text>,
		primary: true,
	},
	{
		property: 'Calories',
		header: 'Calories',
	},
	{
		property: 'Fat',
		header: 'Fat',
	},
	{
		property: 'Carbs',
		header: 'Carbs',
	},
	{
		property: 'Good',
		header: 'Good for you',
		render: (datum: any): JSX.Element => (
			<Box pad={{ vertical: 'xsmall' }}>
				<Meter values={[{ value: datum.percent }]} thickness="medium" size="small" round={true} />
			</Box>
		),
	},
];
const DATA = [
	{
		name: 'GingerBread',
		Calories: '356',
		Fat: '16',
		Carbs: '49',
		percent: 25,
	},
	{
		name: 'Frozen Yoghurt',
		Calories: '159',
		Fat: '6',
		Carbs: '24',
		percent: 72,
	},
	{
		name: ' Vanilla Ice Cream',
		Calories: '205',
		Fat: '32',
		Carbs: '43',
		percent: 31,
	},
	{
		name: 'Chicken',
		Calories: '150',
		Fat: '10',
		Carbs: '12',
		percent: 95,
	},
	{
		name: 'Soda',
		Calories: '160',
		Fat: '0',
		Carbs: '41',
		percent: 10,
	},
	{
		name: 'Apple Juice',
		Calories: '210',
		Fat: '0',
		Carbs: '28',
		percent: 40,
	},
];

const Test = (props: any): JSX.Element => {
	return (
		<DataTable
			resizeable={true}
			sortable={true}
			size="small"
			columns={columns.map((c) => ({
				...c,
				search: c.property === 'name' || c.property === 'location',
			}))}
			// columns={columns}
			data={DATA}
			step={3}
			paginate={true}
		/>
	);
};

export default Test;
