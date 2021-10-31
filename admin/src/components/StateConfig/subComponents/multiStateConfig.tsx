import React, { ChangeEventHandler, FC, useState } from 'react';
import I18n from '@iobroker/adapter-react/i18n';
import { Box, Button, FileInput } from 'grommet';
import YAML from 'yaml';
import { T_General_Props } from '../../../tools/NavigationTabs/Types_States';

interface StateInformation {
	stateID: string;
	stateName: string;
	functions?: string;
	rooms?: string;
}

const MultiStateConfig: FC<T_General_Props> = (props: T_General_Props): JSX.Element => {
	const [upFiles, setUpFiles] = useState<any[]>([]);
	const [config, setConfig] = useState<StateInformation[] | undefined>(undefined);

	const downloadStatesConfiguration = (type: 'json' | 'yaml'): void => {
		props.socket
			.sendTo(props.adapterInstanceName, 'ConfigAdapter:statesConfigDownload', { type: type })
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
	const onUpload = () => {
		props.socket
			.sendTo(props.adapterInstanceName, 'ConfigAdapter:statesConfigUpload', { config: config })
			.then((result: unknown | undefined) => {
				if (typeof result === 'string' && result === 'ok') {
					props.onToast(I18n.t('State Configuration sucessfully loaded'));
				} else {
					props.onError(I18n.t('Error: ') + JSON.stringify(result));
				}
				setUpFiles([]);
			});
	};
	const onDelete = () => {
		setUpFiles([]);
	};
	const onAdd = (a: any[]): void => {
		if (a.length < 1) return;
		const file = a[0];
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
				setUpFiles(a);
				setConfig(_config);
			}
		};
		GetFile.readAsText(file);
	};
	return (
		<Box fill="horizontal">
			<Box align="center" justify="center" direction="row" pad="medium" gap="medium">
				<Button
					size="small"
					onClick={() => downloadStatesConfiguration('json')}
					label={I18n.t('Download Config as JSON')}
				/>
				<Button
					size="small"
					onClick={() => downloadStatesConfiguration('yaml')}
					label={I18n.t('Download Config as YAML')}
				/>
			</Box>
			<Box direction="column" gap="medium" align="center" justify="center" margin="none" pad="none">
				<FileInput
					onChange={(event, { files }) => (files.length === 0 ? onDelete() : onAdd(files))}
					messages={{
						browse: 'browse',
						dropPrompt: I18n.t('Drag or click to upload a Config File'),
						dropPromptMultiple: 'Drop files here or',
						files: 'files',
						remove: 'remove',
						removeAll: 'remove all',
						maxFile: 'Attach a maximum of {max} files only.',
					}}
				/>
				<Button
					onClick={onUpload}
					primary
					disabled={!(upFiles && upFiles.length > 0)}
					label={I18n.t('Upload Config')}
					size="small"
				/>
			</Box>
		</Box>
	);
};

export default MultiStateConfig;
