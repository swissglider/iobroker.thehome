import React, { FC, Fragment, useState } from 'react';
import {
	Button,
	createStyles,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Icon,
	IconButton,
	makeStyles,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Theme,
	Tooltip,
} from '@material-ui/core';
import { I_ResetNames_FormProps } from '.';
import Helper from '../../helper';
import Connection from '@iobroker/adapter-react/Connection';
import I18n from '@iobroker/adapter-react/i18n';
import { loadCSS } from 'fg-loadcss';

type T_StateIDsWithConfig = Record<
	string,
	{ defaultName: ioBroker.StringOrTranslated; names: ioBroker.StringOrTranslated[] }
>;

interface I_Tree {
	[key: string]: I_Tree;
}

const getRandomString = (id: string): string => {
	return `${id} - ${(Math.random() + 1).toString(36).substring(7)}`;
};

const useStylesFolderTree = makeStyles((theme: Theme) =>
	createStyles({
		textRow: {
			textAlign: 'center',
		},
		indent: ({ level }: { level: number }) => {
			return {
				paddingLeft: theme.spacing(level * 1.5),
				// '&:hover': {
				// 	backgroundColor: 'transparent',
				// },
			};
		},
		span: {
			paddingLeft: theme.spacing(1),
		},
		cell: {
			borderBottom: 'none',
		},
		tableRow: {
			'&:hover': {
				// backgroundColor: 'blue !important',
			},
		},
	}),
);

export interface I_FolderTree_Props {
	tree: I_Tree;
	parentName?: string;
	level: number;
	stateIDsWithConfig: T_StateIDsWithConfig;
	onClose: (values: I_ResetNames_FormProps | undefined) => void;
	systemConfig: Record<string, any>;
}

const FolderTree: FC<I_FolderTree_Props> = (props: I_FolderTree_Props) => {
	const { tree = {}, parentName, level, stateIDsWithConfig, ...other } = props;
	const classes = useStylesFolderTree({ level: level });
	const [open, setOpen] = useState<Record<number, boolean>>({});
	const createParentName = (parentName: string | undefined, _key: string): string => {
		return parentName ? `${parentName}.${_key}` : _key;
	};
	const switchOpen = (index: number) => {
		const tempOpen = { ...open };
		tempOpen[index] = tempOpen[index] ? !tempOpen[index] : true;
		setOpen(tempOpen);
	};

	const getCurrentName = (parentName: string | undefined, key: string): string => {
		const fullID = createParentName(parentName, key);
		if (fullID in stateIDsWithConfig) {
			const obj = stateIDsWithConfig[fullID];
			const name = obj.names[obj.names.length - 1];
			return Helper.getName(name, props.systemConfig.language);
		}
		return '';
	};

	const getDefaultName = (parentName: string | undefined, key: string): string => {
		const fullID = createParentName(parentName, key);
		if (fullID in stateIDsWithConfig) {
			const obj = stateIDsWithConfig[fullID];
			const name = obj.names[obj.names.length - 1];
			const defaultName = obj.defaultName;
			if (JSON.stringify(obj.defaultName) !== JSON.stringify(name)) {
				return Helper.getName(defaultName, props.systemConfig.language);
			}
		}
		return '';
	};

	const onClick = (parentName: string | undefined, key: string) => {
		props.onClose({
			stateID: createParentName(parentName, key),
			stateName: getCurrentName(parentName, key),
			defaultStateName: getDefaultName(parentName, key),
		});
	};

	return (
		<>
			{Object.entries(tree).map(([_key, _obj], index) => (
				<Fragment key={getRandomString(createParentName(parentName, _key))}>
					<TableRow hover={true} className={classes.tableRow}>
						<TableCell onClick={() => switchOpen(index)} className={classes.cell}>
							{Object.keys(_obj).length === 0 ? (
								<IconButton
									className={classes.indent}
									size="small"
									disableFocusRipple
									disableRipple
									style={{ backgroundColor: 'transparent' }}
								>
									<Icon className="far fa-file" color="primary" fontSize="small" />
								</IconButton>
							) : (
								<IconButton
									className={classes.indent}
									size="small"
									disableFocusRipple
									disableRipple
									style={{ backgroundColor: 'transparent' }}
								>
									{open[index] ? (
										<Icon className="fas fa-folder-open" color="primary" fontSize="small" />
									) : (
										<Icon className="fas fa-folder" color="primary" fontSize="small" />
									)}
								</IconButton>
							)}
							<span className={classes.span}>{_key}</span>
						</TableCell>
						<TableCell component="th" scope="row" className={classes.cell}>
							<span>{getCurrentName(parentName, _key)}</span>
						</TableCell>
						<TableCell align="left" className={classes.cell}>
							<Tooltip title={I18n.t('Reset2DefaultName')}>
								<span onClick={() => onClick(parentName, _key)}>
									{getDefaultName(parentName, _key)}
								</span>
							</Tooltip>
						</TableCell>
						<TableCell align="right" className={classes.cell}>
							{getDefaultName(parentName, _key) !== '' && (
								<Tooltip title={I18n.t('Reset2DefaultName')}>
									<IconButton
										size="small"
										onClick={() => onClick(parentName, _key)}
										disableFocusRipple
										disableRipple
										style={{ backgroundColor: 'transparent' }}
									>
										<Icon className="fa fa-redo" color="primary" fontSize="small" />
									</IconButton>
								</Tooltip>
							)}
						</TableCell>
					</TableRow>
					{open[index] && (
						<FolderTree
							tree={_obj}
							parentName={createParentName(parentName, _key)}
							level={level + 1}
							stateIDsWithConfig={stateIDsWithConfig}
							{...other}
						/>
					)}
				</Fragment>
			))}
		</>
	);
};

export interface I_DialogSelectDefaultName_Props {
	onClose: (values: I_ResetNames_FormProps | undefined) => void;
	open: boolean;
	systemConfig: Record<string, any>;
	socket: Connection;
	onError: any;
	onToast: any;
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

	React.useEffect(() => {
		const node = loadCSS(
			'https://use.fontawesome.com/releases/v5.12.0/css/all.css',
			document.querySelector('#font-awesome-css'),
		);

		try {
			props.socket
				.getState('thehome.0.objectStateInformations')
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
			node.parentNode!.removeChild(node);
		};
	}, [props.open]);

	return (
		<Dialog aria-labelledby="simple-dialog-title" open={props.open} fullWidth={true} maxWidth="xl">
			<DialogTitle id="simple-dialog-title">{I18n.t('Select State Name to reset')}</DialogTitle>
			<DialogContent>
				{readyToShow && (
					<Table padding="none" size="small" stickyHeader={true}>
						<TableHead>
							<TableRow>
								<TableCell>ID</TableCell>
								<TableCell align="left">Current Name</TableCell>
								<TableCell align="left" padding="none">
									Default name
								</TableCell>
								<TableCell align="left" padding="none" />
							</TableRow>
						</TableHead>
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
			</DialogContent>
			<DialogActions>
				<Button onClick={() => handleClose(undefined)}>Cancel</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DialogSelectDefaultName;
