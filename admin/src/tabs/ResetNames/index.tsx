import React, { FC, useState } from 'react';
import {
	Button,
	Card,
	CardActionArea,
	CardActions,
	CardContent,
	createStyles,
	Grid,
	makeStyles,
	Typography,
} from '@material-ui/core';
import I18n from '@iobroker/adapter-react/i18n';
import TextFormHook from '../../hooks/TextFormHook';
import Connection from '@iobroker/adapter-react/Connection';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import DialogSelectDefaultName from './DialogSelectDefaultName';
import HiddenInputFormHook from '../../hooks/HiddenInputFormHook';
import Helper from '../../helper';

const useStyles = makeStyles((theme) =>
	createStyles({
		card: {
			flexGrow: 1,
			width: '98vw',
			marginBottom: theme.spacing(3),
		},
		warningButton: {
			color: theme.palette.warning.main,
		},
	}),
);

export interface I_ResetNames_Props {
	socket: Connection;
	onToast: any;
	onError: any;
	systemConfig: Record<string, any>;
}

export interface I_ResetNames_FormProps {
	stateID: string;
	stateName: ioBroker.StringOrTranslated;
	defaultStateName: ioBroker.StringOrTranslated;
}

const formSchema: yup.SchemaOf<I_ResetNames_FormProps> = yup.object({
	stateID: yup.string().required(),
	stateName: yup.string().required(),
	defaultStateName: yup.string().required(),
});

const defaultValues = {
	stateID: '',
	stateName: '',
	defaultStateName: '',
};

const ResetNames: FC<I_ResetNames_Props> = (props: I_ResetNames_Props) => {
	const classes = useStyles();
	const [showSearchDialog, setShowSearchDialog] = useState<boolean>(false);
	const methods = useForm<I_ResetNames_FormProps>({
		defaultValues,
		mode: 'onChange',
		reValidateMode: 'onChange',
		resolver: yupResolver(formSchema),
	});

	const handleClose = (values: I_ResetNames_FormProps | undefined) => {
		setShowSearchDialog(false);
		if (!values) return;
		methods.setValue('stateID', values.stateID, {
			shouldValidate: true,
		});
		methods.setValue('stateName', Helper.getName(values.stateName, props.systemConfig.language), {
			shouldValidate: true,
		});
		methods.setValue('defaultStateName', Helper.getName(values.defaultStateName, props.systemConfig.language), {
			shouldValidate: true,
		});
	};

	const submitStateInformation: SubmitHandler<I_ResetNames_FormProps> = async (data: I_ResetNames_FormProps) => {
		props.socket
			.sendTo('thehome.0', 'ConfigChangeListener:resetStateNameToDefault', { id: data.stateID })
			.then((result: ioBroker.Message | undefined) => {
				if (typeof result === 'string' && result === 'ok') {
					props.onToast(I18n.t('Single State Name sucessfully reseted'));
				} else {
					props.onError(I18n.t('Error: ') + JSON.stringify(result));
				}
			})
			.catch((reason) => {
				props.onError(I18n.t('Error: ') + JSON.stringify(reason));
			});
		methods.reset();
	};

	const resetAllStateNames = async () => {
		props.socket
			.sendTo('thehome.0', 'ConfigChangeListener:resetAllStateNamesToDefault', {})
			.then((result: ioBroker.Message | undefined) => {
				if (typeof result === 'string' && result === 'ok') {
					props.onToast(I18n.t('All State Names sucessfully reseted'));
				} else {
					props.onError(I18n.t('Error: ') + JSON.stringify(result));
				}
			})
			.catch((reason) => {
				props.onError(I18n.t('Error: ') + JSON.stringify(reason));
			});
		methods.reset();
	};

	return (
		<>
			<Card className={classes.card}>
				<form onSubmit={methods.handleSubmit(submitStateInformation)}>
					<FormProvider {...methods}>
						<CardActionArea disableRipple>
							<CardContent>
								<Typography gutterBottom variant="h5" component="h2">
									{I18n.t('resetNameTitle')}
								</Typography>
								<HiddenInputFormHook name="stateID" systemConfig={props.systemConfig} />
								<Grid container direction="column" spacing={1} alignItems="stretch">
									<Grid container direction="row" spacing={1} alignItems="stretch">
										<Grid item xs={6}>
											<TextFormHook
												label={I18n.t('State Name')}
												name="stateName"
												placeholder={I18n.t('First Search the State')}
												disabled={true}
												systemConfig={props.systemConfig}
											/>
										</Grid>
										<Grid item xs={6}>
											<TextFormHook
												label={I18n.t('Default State Name')}
												name="defaultStateName"
												placeholder={I18n.t('First Search the State')}
												disabled={true}
												systemConfig={props.systemConfig}
											/>
										</Grid>
									</Grid>
								</Grid>
							</CardContent>
						</CardActionArea>
						<CardActions>
							<Grid container direction="row" justifyContent="space-between" alignItems="stretch">
								<Grid item>
									<Button variant="outlined" onClick={() => setShowSearchDialog(true)}>
										{I18n.t('Search State Name')}
									</Button>
								</Grid>
								<Grid item>
									<Button
										variant="outlined"
										onClick={() => methods.reset()}
										disabled={methods.watch().stateID === '' ? true : false}
									>
										{I18n.t('Clean Forms')}
									</Button>
								</Grid>
								<Grid item>
									<Button
										variant="outlined"
										type="submit"
										className={classes.warningButton}
										disabled={methods.watch().stateID === '' ? true : false}
									>
										{I18n.t('resetName')}
									</Button>
								</Grid>
							</Grid>
						</CardActions>
					</FormProvider>
				</form>
			</Card>
			<Card className={classes.card}>
				<CardActionArea disableRipple>
					<CardContent>
						<Typography gutterBottom variant="h5" component="h2">
							{I18n.t('resetNamesTitle')}
						</Typography>
					</CardContent>
				</CardActionArea>
				<CardActions>
					<Grid container direction="row-reverse" justifyContent="space-between" alignItems="stretch">
						<Grid item>
							<Button
								variant="outlined"
								type="submit"
								className={classes.warningButton}
								onClick={() => resetAllStateNames()}
								// disabled={methods.watch().stateID === '' ? true : false}
							>
								{I18n.t('resetNames')}
							</Button>
						</Grid>
					</Grid>
				</CardActions>
			</Card>
			<DialogSelectDefaultName
				open={showSearchDialog}
				onClose={handleClose}
				systemConfig={props.systemConfig}
				socket={props.socket}
				onError={props.onError}
				onToast={props.onToast}
			/>
		</>
	);
};

export default ResetNames;
