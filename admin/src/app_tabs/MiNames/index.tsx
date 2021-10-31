import React, { FC, useState, useEffect } from 'react';
import Connection from '@iobroker/adapter-react/Connection';
import I18n from '@iobroker/adapter-react/i18n';
import DataTable from 'react-data-table-component';
import SpinnerLoader from '../../tools/SpinnerLoader';
import { Card, CardActions, CardContent, Typography, Grid, Button, Paper, Badge, Chip, Box } from '@mui/material';

const columns = [
	{
		name: 'MiHome name',
		selector: (row) => row.name,
		sortable: true,
	},
	{
		name: 'State name',
		selector: (row) => row.stateName,
		sortable: true,
	},
	{
		name: 'Model',
		selector: (row) => row.model,
		sortable: true,
	},
	{
		name: 'Token',
		selector: (row) => row.token,
		sortable: true,
	},
];

const conditionalRowStyles = [
	{
		when: (row) => row.stateName === row.name,
		style: {
			backgroundColor: 'rgba(63, 195, 128, 0.9)',
			color: 'white',
			'&:hover': {
				cursor: 'pointer',
			},
		},
	},
	{
		when: (row) => row.stateName !== row.name,
		style: {
			backgroundColor: 'rgba(248, 148, 6, 0.9)',
			color: 'white',
			'&:hover': {
				cursor: 'pointer',
			},
		},
	},
];

export interface I_MiNames_Props {
	socket: Connection;
	onToast: any;
	onError: any;
	systemConfig: Record<string, any>;
	native: Record<string, any>;
	cardStyle: any;
}

const MiNames: FC<I_MiNames_Props> = (props: I_MiNames_Props) => {
	const [pending, setPending] = React.useState(true);
	const [data, setData] = useState<any[]>([]);
	const [modelCount, setModelCount] = useState<Record<string, number>>({});
	const title = I18n.t('miHomeTabelTitle');

	const loadDataFromMeHomeCloud = (): void => {
		setPending(true);
		props.socket
			.sendTo('thehome.0', 'MiNameAdapter:getMiTokenList', { country: 'cn' })
			.then((result: ioBroker.Message | undefined) => {
				if (result && typeof result === 'object' && Array.isArray(result)) {
					// const dataArray = JSON.parse(result);
					const dataArray = result as any[];
					setData(dataArray);
					const models: Record<string, number> = {};
					dataArray.map((x) => {
						if (typeof models[x.model] == 'undefined') models[x.model] = 0;
						models[x.model]++;
					});
					setModelCount(models);
				} else {
					console.error(result);
					props.onError(result);
				}
			})
			.catch((reason) => {
				console.error(reason);
				props.onError(reason);
			})
			.finally(() => setPending(false));
	};

	useEffect(() => {
		loadDataFromMeHomeCloud();
		return () => {
			t: 't';
		};
	}, []);

	const rearangeSelectedComponents = () => {
		try {
			props.socket
				.sendTo('thehome.0', 'MiNameAdapter:rearangeAllChannelsAndStates', {})
				.then((result: ioBroker.Message | undefined) => {
					if (typeof result === 'string' && result === 'ok') {
						props.onToast(I18n.t('All selected components sucessfully renamed'));
					} else {
						props.onError(I18n.t('Error: ') + JSON.stringify(result));
					}
				})
				.catch((reason) => {
					console.error(reason);
					props.onError(reason);
				})
				.finally(() => loadDataFromMeHomeCloud());
		} catch (error) {
			console.error(error);
			props.onError(error);
		}
	};

	const ExpandedComponent = (props: any) => <pre>{JSON.stringify(props.data, null, 2)}</pre>;

	return (
		<Card sx={props.cardStyle}>
			<CardActions>
				<CardContent>
					<Typography gutterBottom variant="h5" component="h2">
						{I18n.t('miNames')}
					</Typography>
					{pending && <SpinnerLoader spinnerText={I18n.t('loadingMIHomeNamesFromCloud')} />}
					{!pending && (
						<Grid container direction="column" spacing={1} justifyContent="center" alignItems="stretch">
							<Grid item>
								<Button variant="outlined" color="primary" onClick={() => rearangeSelectedComponents()}>
									{I18n.t('miHomeRenameButton')}
								</Button>
							</Grid>
							<Grid item>
								<>
									<Typography gutterBottom variant="subtitle2" component="h6">
										{I18n.t('amoundMeHomeDevices')}
									</Typography>

									<Paper variant="outlined" square sx={{ padding: 2 }}>
										<Grid container direction="row" spacing={1} alignItems="stretch">
											{Object.entries(modelCount)
												.sort((e1, e2) => e2[1] - e1[1])
												.map(([key, amount]) => (
													<Grid item key={key}>
														<Badge
															badgeContent={amount}
															color="primary"
															anchorOrigin={{
																vertical: 'top',
																horizontal: 'left',
															}}
														>
															<Chip label={key} size="small" />
														</Badge>
													</Grid>
												))}
										</Grid>
									</Paper>
								</>
							</Grid>
							<Grid item>
								<Box style={{ overflow: 'scroll', width: '100vw' }}>
									<DataTable
										title={title}
										columns={columns}
										data={data}
										conditionalRowStyles={conditionalRowStyles}
										defaultSortFieldId={3}
										defaultSortAsc={true}
										theme="ioBorker"
										expandableRows={true}
										expandableRowsComponent={ExpandedComponent}
										expandOnRowClicked={false}
										expandOnRowDoubleClicked={false}
										expandableRowsHideExpander={false}
									/>
								</Box>
							</Grid>
						</Grid>
					)}
				</CardContent>
			</CardActions>
		</Card>
	);
};

export default MiNames;
