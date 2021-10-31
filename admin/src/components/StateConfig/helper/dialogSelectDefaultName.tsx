import Connection from '@iobroker/adapter-react/Connection';
import I18n from '@iobroker/adapter-react/i18n';
import React, { FC, useEffect, useState } from 'react';
import { I_ResetNames_FormProps } from '../subComponents/nameReseter';
import { FormClose } from 'grommet-icons';
import { Box, Button, Text, Layer, Table, TableRow, TableCell, TableBody, TableHeader } from 'grommet';
import FolderTree, { I_Tree, T_StateIDsWithConfig } from './folderTree';

export interface I_DialogSelectDefaultName_Props {
	onClose: (values: I_ResetNames_FormProps | undefined) => void;
	open: boolean;
	systemConfig: Record<string, any>;
	socket: Connection;
	onError: any;
	onToast: any;
	adapterInstanceName: string;
}

const DialogSelectDefaultName: FC<I_DialogSelectDefaultName_Props> = (props: I_DialogSelectDefaultName_Props) => {
	const [readyToShow, setReadyToShow] = useState<boolean>(false);
	const [objectStateTree, setObjectStateTree] = useState<I_Tree>({});
	const [stateIDsWithConfig, setStateIDsWithConfig] = useState<T_StateIDsWithConfig>({});

	const handleClose = (values: I_ResetNames_FormProps | undefined) => {
		props.onClose(values);
	};

	const createTree = (tree: I_Tree, idSegment: string[]) => {
		const firstElement = idSegment.shift();
		if (firstElement && idSegment.length > 0) {
			if (!(firstElement in tree)) {
				tree[firstElement] = {};
			}
			createTree(tree[firstElement], idSegment);
		} else if (firstElement) {
			if (!(firstElement in tree)) tree[firstElement] = {};
		}
	};

	useEffect(() => {
		try {
			props.socket
				.getState(props.adapterInstanceName + '.objectStateInformations')
				.then((state: ioBroker.State | null | undefined) => {
					if (state && 'val' in state && typeof state.val === 'string') {
						const stateIDsWithConf: T_StateIDsWithConfig = JSON.parse(state.val);
						const objStateTree: I_Tree = {};
						for (const [key, value] of Object.entries(stateIDsWithConf)) {
							if (
								JSON.stringify(value.defaultName) !==
								JSON.stringify(value.names[value.names.length - 1])
							) {
								const idSegment = key.split('.');
								createTree(objStateTree, idSegment);
							}
						}
						setObjectStateTree(objStateTree);
						setStateIDsWithConfig(stateIDsWithConf);
						setReadyToShow(true);
					}
				})
				.catch((reason: any) => {
					props.onError(I18n.t('Error: ') + JSON.stringify(reason));
				});
		} catch (error) {
			props.onError(I18n.t('Error: ') + JSON.stringify(error));
		}

		return () => {
			t: 't';
		};
	}, [props.open]);

	return (
		<>
			{props.open && (
				<Layer
					full={true}
					position="center"
					background={{ color: 'headerBorder', size: 'contain', opacity: 98 }}
					onClickOutside={() => handleClose(undefined)}
					onEsc={() => handleClose(undefined)}
				>
					<Box>
						<Box direction="row" align="center" as="header" elevation="small" justify="between">
							<Text margin={{ left: 'small' }}>{I18n.t('Select State Name to reset')}</Text>
							<Button alignSelf="end" icon={<FormClose />} onClick={() => handleClose(undefined)} />
						</Box>
						<Box as="main" flex overflow="auto" margin={{ vertical: 'small', horizontal: 'none' }}>
							{readyToShow && (
								<Table margin="none">
									<TableHeader>
										<TableRow>
											<TableCell>
												<Text size="small">ID</Text>
											</TableCell>
											<TableCell align="left">
												<Text size="small">Current Name</Text>
											</TableCell>
											<TableCell align="left">
												<Text size="small">Default name</Text>
											</TableCell>
											<TableCell align="left" />
										</TableRow>
									</TableHeader>
									<TableBody>
										<FolderTree
											tree={objectStateTree}
											level={0}
											stateIDsWithConfig={stateIDsWithConfig}
											systemConfig={props.systemConfig}
											onClose={handleClose}
										/>
									</TableBody>
								</Table>
							)}
						</Box>
						<Box justify="end" fill="horizontal" as="footer">
							<Button
								onClick={() => handleClose(undefined)}
								// disabled={methods.watch().stateID === '' ? true : false}
								label="Cancel"
							/>
						</Box>
					</Box>
				</Layer>
			)}
		</>
	);
};

export default DialogSelectDefaultName;
