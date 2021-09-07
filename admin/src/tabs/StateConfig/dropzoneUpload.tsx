import React, { FC, useState } from 'react';
import { Button, createStyles, makeStyles } from '@material-ui/core';
import { DropzoneAreaBase, FileObject } from 'material-ui-dropzone';
import YAML from 'yaml';
import Connection from '@iobroker/adapter-react/Connection';

export interface StateInformation {
	stateID: string;
	stateName: string;
	functions?: string;
	rooms?: string;
}

const useStyles = makeStyles(() =>
	createStyles({
		previewChip: {
			minWidth: 160,
			maxWidth: 210,
		},
	}),
);

export interface I_DropzoneDownload_Props {
	socket: Connection;
	onToast: any;
	onError: any;
}

const DropzoneDownload: FC<I_DropzoneDownload_Props> = (props: I_DropzoneDownload_Props) => {
	const classes = useStyles();
	const [upFiles, setUpFiles] = useState<FileObject[]>([]);
	const [config, setConfig] = useState<StateInformation[] | undefined>(undefined);

	const onAdd = (a: FileObject[]): void => {
		if (a.length < 1) return;
		const file = a[0].file;
		const GetFile = new FileReader();
		const type = file.type;
		// const socket = props.socket;
		GetFile.onload = function () {
			let _config: StateInformation[];
			if (typeof GetFile.result === 'string') {
				switch (type) {
					case 'application/x-yaml':
						_config = YAML.parse(GetFile.result);
						break;
					case 'application/json':
						_config = JSON.parse(GetFile.result);
						break;
					default:
						return;
				}
				setUpFiles([]);
				setConfig(undefined);
				// const decodedConfig: E.Either<D.DecodeError, StateInformation[]> = stateInformations.decode(_config);
				// E.isLeft(decodedConfig) ? props.onError('Wrong configuration, please check the file !') : setUpFiles(a),
				// 	setConfig(_config);
				setUpFiles(a);
				setConfig(_config);
			}
		};
		GetFile.readAsText(file);
	};

	const onDelete = () => {
		setUpFiles([]);
	};

	const onUpload = () => {
		props.socket
			.sendTo('thehome.0', 'ConfigAdapter:statesConfigUpload', { config: config })
			.then((result: unknown | undefined) => {
				if (typeof result === 'string' && result === 'ok') {
					props.onToast('State Configuration sucessfully loaded');
				} else {
					props.onError('Error: ' + JSON.stringify(result));
				}
				setUpFiles([]);
			});
	};

	return (
		<>
			<Button onClick={onUpload} disabled={!(upFiles && upFiles.length > 0)} color="primary">
				Upload Config
			</Button>
			<DropzoneAreaBase
				// showPreviews={true}
				showPreviewsInDropzone={true}
				useChipsForPreview
				previewGridProps={{ container: { spacing: 1, direction: 'row', justifyContent: 'center' } }}
				previewChipProps={{ classes: { root: classes.previewChip } }}
				previewText="Selected file"
				acceptedFiles={['application/x-yaml', 'application/json']}
				filesLimit={1}
				dropzoneText="Drag of click to upload a new State Config"
				onAdd={onAdd}
				fileObjects={upFiles}
				onDelete={onDelete}
				showAlerts={['error']}
			/>
		</>
	);
};

export default DropzoneDownload;
