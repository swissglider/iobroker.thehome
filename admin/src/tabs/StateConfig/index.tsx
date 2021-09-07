import React from 'react';
import { Button, ButtonGroup, createStyles, Grid, makeStyles, Theme } from '@material-ui/core';
import YAML from 'yaml';
import 'regenerator-runtime/runtime';
import Connection from '@iobroker/adapter-react/Connection';
import DropzoneUpload from './dropzoneUpload';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			margin: theme.spacing(1),
			padding: theme.spacing(1),
			width: '50ch',
			flexGrow: 1,
		},
	}),
);

export interface I_StateConfig_Props {
	socket: Connection;
	onToast: any;
	onError: any;
}

const StateConfig = (props: I_StateConfig_Props): JSX.Element => {
	const classes = useStyles({ classesProps1: '' });

	const downloadStatesConfiguration = (type: 'json' | 'yaml'): void => {
		props.socket
			.sendTo('thehome.0', 'ConfigAdapter:statesConfigDownload', { type: type })
			.then((result: ioBroker.Message | undefined) => {
				const a = document.createElement('a');
				if (typeof result == 'string') {
					switch (type) {
						case 'json':
							const blob1 = new Blob([result], { type: 'application/json' });
							a.download = 'BackupConfig.json';
							a.href = URL.createObjectURL(blob1);
							break;
						case 'yaml':
							const blob2 = new Blob([YAML.stringify(JSON.parse(result))], {
								type: 'application/x-yaml',
							});
							a.download = 'BackupConfig.yaml';
							a.href = URL.createObjectURL(blob2);
							break;
					}
				} else {
					props.onError('Error: ' + JSON.stringify(result));
				}
				a.addEventListener('click', () => {
					setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
				});
				a.click();
			});
	};

	return (
		<div className={classes.root}>
			<Grid container spacing={1}>
				<Grid item xs={12}>
					<ButtonGroup variant="text" color="primary" aria-label="text primary button group">
						<Button onClick={() => downloadStatesConfiguration('json')}>Download Config as JSON</Button>
						<Button onClick={() => downloadStatesConfiguration('yaml')}>Download Config as YAML</Button>
					</ButtonGroup>
				</Grid>
				<Grid item xs={12}>
					<DropzoneUpload socket={props.socket} onToast={props.onToast} onError={props.onError} />
				</Grid>
			</Grid>
		</div>
	);
};

export default StateConfig;
