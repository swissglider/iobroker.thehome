import React, { FC, useEffect, useState } from 'react';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import {
	Grid,
	Card,
	createStyles,
	makeStyles,
	CardActionArea,
	CardContent,
	CardActions,
	Button,
	Typography,
} from '@material-ui/core';
import DialogSelectID from '@iobroker/adapter-react/Dialogs/SelectID';
import Connection from '@iobroker/adapter-react/Connection';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import TextFormHook from './TextFormHook';
import ListFormHook from './ListFormHook';
import Helper from './helper';
import CheckboxFormHook from './CheckboxFormHook';

const useStyles = makeStyles(() =>
	createStyles({
		card: {
			flexGrow: 1,
			width: '98vw',
		},
	}),
);

export interface I_SingleStateConfigForm_Props {
	socket: Connection;
	onToast: any;
	onError: any;
}

interface I_SingleStateConfigForm_FormProps {
	stateID: string;
	stateName: string;
	room: string | undefined;
	sensorFunction: string | undefined;
	store2DB: boolean;
}

const formSchema: yup.SchemaOf<I_SingleStateConfigForm_FormProps> = yup.object({
	stateID: yup.string().required('Please search a State ID on clicking the "Search"-Button'),
	stateName: yup
		.string()
		.required('State Name is required')
		.min(3, 'Der Name muss aus mindestens 3 Buchstaben bestehen'),
	room: yup.string().optional(),
	sensorFunction: yup.string().optional(),
	store2DB: yup.boolean().required(),
});

const defaultValues = {
	stateID: '',
	stateName: '',
	room: '__',
	sensorFunction: '__',
	store2DB: false,
};

const SingleStateConfigForm: FC<I_SingleStateConfigForm_Props> = (props: I_SingleStateConfigForm_Props) => {
	const classes = useStyles();
	const [showSearchDialog, setShowSearchDialog] = useState<boolean>(false);
	const methods = useForm<I_SingleStateConfigForm_FormProps>({ defaultValues, resolver: yupResolver(formSchema) });

	const submitStateInformation: SubmitHandler<I_SingleStateConfigForm_FormProps> = async (
		data: I_SingleStateConfigForm_FormProps,
	) => {
		const socket = props.socket;
		const config = {
			stateID: data.stateID,
			stateName: data.stateName,
			functions: data.sensorFunction === '__' ? undefined : data.sensorFunction,
			rooms: data.room === '__' ? undefined : data.room,
			store2DB: data.store2DB,
		};
		socket
			.sendTo('thehome.0', 'ConfigAdapter:singleStateConfigUpload', { config: config })
			.then((result: ioBroker.Message | undefined) => {
				if (typeof result === 'string' && result === 'ok') {
					props.onToast('State Configuration sucessfully loaded');
				} else {
					props.onError('Error: ' + JSON.stringify(result));
				}
			});
	};

	const [allRooms, setAllRooms] = useState<Record<string, ioBroker.Object>>({});
	const [allFunction, setAllFunctions] = useState<Record<string, ioBroker.Object>>({});

	useEffect(() => {
		props.socket.getForeignObjects('enum.functions.*', 'enum').then((enums: Record<string, ioBroker.Object>) => {
			enums['__'] = { _id: '__', common: { name: '__' }, native: {}, type: 'enum' };
			setAllFunctions(enums);
		});
		props.socket.getForeignObjects('enum.rooms.*', 'enum').then((enums: Record<string, ioBroker.Object>) => {
			enums['__'] = { _id: '__', common: { name: '__' }, native: {}, type: 'enum' };
			setAllRooms(enums);
		});
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		return () => {};
	}, []);

	return (
		<>
			<Card className={classes.card}>
				<form onSubmit={methods.handleSubmit(submitStateInformation)}>
					<FormProvider {...methods}>
						<CardActionArea disableRipple>
							<CardContent>
								<Typography gutterBottom variant="h5" component="h2">
									Change Single State Configuration
								</Typography>
								<Grid container direction="column" spacing={1} alignItems="stretch">
									<Grid item xs={12}>
										<TextFormHook
											label="State ID"
											name="stateID"
											placeholder="First Search the State"
											disabled
										/>
									</Grid>
									<Grid item xs={12}>
										<TextFormHook
											label="State Name"
											name="stateName"
											placeholder="First Search the State"
											disabled={methods.watch().stateID === '' ? true : false}
										/>
									</Grid>
									<Grid item xs={12}>
										<Grid container justifyContent="space-evenly">
											<Grid item>
												<ListFormHook
													label="Select Room"
													name="room"
													allElements={allRooms}
													helperText="For no Room, select None"
												/>
											</Grid>
											<Grid item>
												<ListFormHook
													label="Select Func"
													name="sensorFunction"
													allElements={allFunction}
													helperText="For no Function, select None"
												/>
											</Grid>
										</Grid>
									</Grid>
									<Grid item xs={12}>
										<CheckboxFormHook
											label="Should state changes be stored to InfluxDB"
											name="store2DB"
											disabled={methods.watch().stateID === '' ? true : false}
										/>
									</Grid>
								</Grid>
							</CardContent>
						</CardActionArea>
						<CardActions>
							<Grid container direction="row" justifyContent="space-between" alignItems="stretch">
								<Grid item>
									<Button variant="outlined" onClick={() => setShowSearchDialog(true)}>
										Search State
									</Button>
								</Grid>
								<Grid item>
									<Button
										variant="outlined"
										onClick={() => methods.reset()}
										disabled={methods.watch().stateID === '' ? true : false}
									>
										Clean Forms
									</Button>
								</Grid>
								<Grid item>
									<Button
										variant="contained"
										color="secondary"
										type="submit"
										disabled={methods.watch().stateID === '' ? true : false}
									>
										Change
									</Button>
								</Grid>
							</Grid>
						</CardActions>
					</FormProvider>
				</form>
			</Card>
			{showSearchDialog && (
				<DialogSelectID
					socket={props.socket}
					statesOnly={false}
					onClose={() => setShowSearchDialog(false)}
					onOk={(selected: string | string[] | undefined) => {
						setShowSearchDialog(false);
						if (typeof selected === 'string') {
							props.socket
								.sendTo('thehome.0', 'getObjectWithEnums', { id: selected })
								.then((result: unknown | undefined) => {
									const obj = result as ioBroker.Object;
									methods.reset();
									methods.setValue('stateID', obj._id, { shouldValidate: true });
									if (obj) {
										methods.setValue('stateName', Helper.getName(obj.common.name), {
											shouldValidate: true,
										});
										methods.setValue(
											'store2DB',
											obj.native?.swissglider?.theHome?.store2DB ?? false,
											{
												shouldValidate: true,
											},
										);
										if (obj.enums) {
											for (const [key, value] of Object.entries(obj.enums)) {
												if (
													key.startsWith('enum.rooms.') &&
													typeof key === 'string' &&
													typeof value === 'string'
												) {
													methods.setValue('room', key, { shouldValidate: true });
												}
												if (
													key.startsWith('enum.functions.') &&
													typeof key === 'string' &&
													typeof value === 'string'
												) {
													methods.setValue('sensorFunction', key, { shouldValidate: true });
												}
											}
										}
									}
								});
						}
					}}
					key="IOBrokerSearchDialog"
					dialogName="dialogName"
					title="Bitte öffne"
					multiSelect={false}
					foldersFirst={true}
					showExpertButton={true}
					types={['state', 'instance', 'channel']}
					columns={['name', 'room', 'func']}
					// selected={props.defaultValue}
					selected={undefined}
				/>
			)}
		</>
	);
};

export default SingleStateConfigForm;
