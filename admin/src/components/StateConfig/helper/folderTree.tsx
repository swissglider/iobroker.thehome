import I18n from '@iobroker/adapter-react/i18n';
import { TableCell, TableRow, Text, Box, Button } from 'grommet';
import React, { FC, Fragment, useState } from 'react';
import { Document, FormNext, FormDown, Undo } from 'grommet-icons';
import { I_ResetNames_FormProps } from '../subComponents/nameReseter';
import Helper from '../../../helper';
import getRandomString from '../../../helper/GetRandomKey';

export interface I_Tree {
	[key: string]: I_Tree;
}

export type T_StateIDsWithConfig = Record<
	string,
	{ defaultName: ioBroker.StringOrTranslated; names: ioBroker.StringOrTranslated[] }
>;

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
					<TableRow>
						<TableCell>
							<Box direction="row" pad={{ left: `${(level * 8).toString()}px` }}>
								{Object.keys(_obj).length === 0 ? (
									<Button
										plain
										icon={<Document size="small" />}
										label={<Text size="xsmall">{_key}</Text>}
									/>
								) : (
									<Button
										plain
										icon={open[index] ? <FormDown size="small" /> : <FormNext size="small" />}
										label={<Text size="xsmall">{_key}</Text>}
										onClick={() => switchOpen(index)}
									/>
								)}
							</Box>
						</TableCell>
						<TableCell>
							<Text size="xsmall">{getCurrentName(parentName, _key)}</Text>
						</TableCell>
						<TableCell align="left" onClick={() => onClick(parentName, _key)}>
							<Text size="xsmall">{getDefaultName(parentName, _key)}</Text>
						</TableCell>
						<TableCell align="right" onClick={() => onClick(parentName, _key)} plain>
							{getDefaultName(parentName, _key) !== '' && (
								<Button
									icon={<Undo size="small" />}
									margin="none"
									plain
									hoverIndicator={true}
									tip={{
										plain: true,
										dropProps: { align: { right: 'left' } },
										content: (
											<Box
												pad="xxsmall"
												// elevation="small"
												background="text" // no opacity
												round="xsmall"
												margin="xsmall"
												overflow="hidden"
												align="center"
											>
												{I18n.t('Reset2DefaultName')}
											</Box>
										),
									}}
								/>
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

export default FolderTree;
