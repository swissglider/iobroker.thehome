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
	Theme,
	Typography,
} from '@material-ui/core';
import I18n from '@iobroker/adapter-react/i18n';
import TextFormHook from '../../hooks/TextFormHook';
import Connection from '@iobroker/adapter-react/Connection';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FormProvider, useForm } from 'react-hook-form';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		classes1: {
			display: 'flex',
			paddingLeft: theme.spacing(1),
			flexDirection: 'column',
			flexWrap: 'nowrap',
			alignItems: 'center',
		},
		classes2: ({ classesProps1 }: { classesProps1?: string }) => {
			return {
				alignItems: classesProps1 ?? '',
			};
		},
		card: {
			flexGrow: 1,
			width: '98vw',
			marginBottom: theme.spacing(3),
		},
	}),
);

export interface I_InfluxDBHandler_FormProps {
	InfluxDBHandlerAdapter_token: string;
	InfluxDBHandlerAdapter_bucketTransformed: string;
}

const formSchema: yup.SchemaOf<I_InfluxDBHandler_FormProps> = yup.object({
	InfluxDBHandlerAdapter_token: yup.string().required(),
	InfluxDBHandlerAdapter_bucketTransformed: yup.string().required(),
});

export interface I_InfluxDBHandler_Props {
	socket: Connection;
	onToast: any;
	onError: any;
	systemConfig: Record<string, any>;
	native: Record<string, any>;

	onChange: (attr: string, value: any) => void;
}

const InfluxDBHandler: FC<I_InfluxDBHandler_Props> = (props: I_InfluxDBHandler_Props) => {
	const classes = useStyles({ classesProps1: '' });
	const [incativeRefreshButton, setIncativeRefreshButton] = useState<boolean>(false);
	const defaultValues = {
		InfluxDBHandlerAdapter_token: props.native['InfluxDBHandlerAdapter_token'],
		InfluxDBHandlerAdapter_bucketTransformed: props.native['InfluxDBHandlerAdapter_bucketTransformed'],
	};

	const methods = useForm<I_InfluxDBHandler_FormProps>({
		defaultValues,
		mode: 'onChange',
		reValidateMode: 'onChange',
		resolver: yupResolver(formSchema),
	});

	const onChange = (name: string, value: any) => {
		props.onChange(name, value);
		console.log(name, value);
	};

	const refreshAllTagsOnInfluxDB = async () => {
		setIncativeRefreshButton(true);
		props.socket
			.sendTo('thehome.0', 'InfluxDBHandlerAdapter:refreshAllTagsOnInfluxDB', {})
			.then((result: ioBroker.Message | undefined) => {
				if (typeof result === 'string' && result === 'ok') {
					props.onToast(I18n.t('All Tags sucessfully reset'));
				} else {
					props.onError(I18n.t('Error: ') + JSON.stringify(result));
				}
				setIncativeRefreshButton(false);
			})
			.catch((reason) => {
				props.onError(I18n.t('Error: ') + JSON.stringify(reason));
			});
		methods.reset();
	};

	return (
		<>
			<Card className={classes.card}>
				{/* <form onSubmit={methods.handleSubmit(submitStateInformation)}> */}
				<form>
					<FormProvider {...methods}>
						<CardActionArea disableRipple>
							<CardContent>
								<Typography gutterBottom variant="h5" component="h2">
									{I18n.t('influxDBHandlerTitle')}
								</Typography>
								<Grid container direction="row" spacing={1} alignItems="stretch">
									<Grid item xs={12}>
										<TextFormHook
											label={I18n.t('Token')}
											name="InfluxDBHandlerAdapter_token"
											placeholder={I18n.t('Same as on InfluxDB Adapter')}
											systemConfig={props.systemConfig}
											onChange={onChange}
										/>
									</Grid>
									{/* <Grid item xs={12}>
										<TextFormHook
											label={I18n.t('Transformed Bucket')}
											name="InfluxDBHandlerAdapter_bucketTransformed"
											placeholder={I18n.t(
												'To use in Grafana or so, this it the new Bucket that will be created',
											)}
											systemConfig={props.systemConfig}
											onChange={onChange}
										/>
									</Grid> */}
								</Grid>
							</CardContent>
						</CardActionArea>
						<CardActions>
							<Grid container direction="row" justifyContent="space-between" alignItems="stretch">
								<Grid item>
									<Button
										variant="outlined"
										onClick={() => refreshAllTagsOnInfluxDB()}
										disabled={incativeRefreshButton}
									>
										{I18n.t('Refresh all Tags on InfluxDB')}
									</Button>
								</Grid>
							</Grid>
						</CardActions>
					</FormProvider>
				</form>
			</Card>
		</>
	);
};

export default InfluxDBHandler;
