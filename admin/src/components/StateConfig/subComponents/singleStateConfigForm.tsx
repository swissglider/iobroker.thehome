import React, { FC, useEffect, useState } from 'react';
import I18n from '@iobroker/adapter-react/i18n';
import { Box, Button, CheckBox, FormField, Select } from 'grommet';
import * as yup from 'yup';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import DialogSelectID from '@iobroker/adapter-react/Dialogs/SelectID';
import 'regenerator-runtime/runtime';
import Helper from '../../../helper';
import TextFormHook from '../../../hooks/TextFormHook';
import { T_General_Props } from '../../../tools/NavigationTabs/Types_States';

interface I_SingleStateConfigForm_FormProps {
	stateID: string;
	stateName: string;
}

const formSchema: yup.SchemaOf<I_SingleStateConfigForm_FormProps> = yup.object({
	stateID: yup.string().required(I18n.t('Please search a State ID on clicking the Search-Button')),
	stateName: yup.string().required(I18n.t('State Name is required')).min(3, 'State Name needs at least 3 letters'),
});

const defaultValues = {
	stateID: '',
	stateName: '',
};

const SingleStateConfigForm: FC<T_General_Props> = (props: T_General_Props): JSX.Element => {
	const [showSearchDialog, setShowSearchDialog] = useState<boolean>(false);
	const [selectedRoom, setSelectedRoom] = useState<ioBroker.Object | undefined>();
	const [selectedFunction, setSelectedFunction] = useState<ioBroker.Object | undefined>();
	const [store2DB, setStore2DB] = useState<boolean>(false);
	const [allRooms, setAllRooms] = useState<Record<string, ioBroker.Object>>({});
	const [allFunction, setAllFunctions] = useState<Record<string, ioBroker.Object>>({});

	const methods = useForm<I_SingleStateConfigForm_FormProps>({
		defaultValues,
		mode: 'onChange',
		reValidateMode: 'onChange',
		resolver: yupResolver(formSchema),
	});

	const submitStateInformation: SubmitHandler<I_SingleStateConfigForm_FormProps> = async (
		data: I_SingleStateConfigForm_FormProps,
	) => {
		const socket = props.socket;
		const config = {
			stateID: data.stateID,
			stateName: data.stateName,
			functions: selectedFunction?._id ?? undefined,
			rooms: selectedRoom?._id ?? undefined,
			store2DB: store2DB,
		};
		socket
			.sendTo(props.adapterInstanceName, 'ConfigAdapter:singleStateConfigUpload', { config: config })
			.then((result: ioBroker.Message | undefined) => {
				if (typeof result === 'string' && result === 'ok') {
					props.onToast(I18n.t('State Configuration sucessfully changed'));
				} else {
					props.onError(I18n.t('Error: ') + JSON.stringify(result));
				}
			})
			.catch((reason) => {
				props.onError(I18n.t('Error: ') + JSON.stringify(reason));
			});
	};

	const setSelectedState = (selected: string | string[] | undefined): void => {
		setShowSearchDialog(false);
		if (typeof selected === 'string') {
			props.socket
				.sendTo(props.adapterInstanceName, 'getObjectWithEnums', { id: selected })
				.then((result: unknown | undefined) => {
					const obj = result as ioBroker.Object;
					methods.reset();
					methods.setValue('stateID', obj._id, { shouldValidate: true });
					setSelectedRoom(undefined);
					setSelectedFunction(undefined);
					setStore2DB(false);
					if (obj) {
						methods.setValue('stateName', Helper.getName(obj.common.name, props.systemConfig.language), {
							shouldValidate: true,
						});
						let storeP = false;
						if (obj.common.custom && typeof obj.common.custom === 'object') {
							const tEntries = Object.entries(obj.common.custom).find(([key]) =>
								key.startsWith('influxdb'),
							);
							storeP = tEntries && tEntries[1].enabled;
						}
						setStore2DB(typeof storeP === 'boolean' ? storeP : false);
						if (obj.enums) {
							for (const [key] of Object.entries(obj.enums)) {
								if (key.startsWith('enum.rooms.') && typeof key === 'string') {
									setSelectedRoom(allRooms[key] ?? undefined);
								}
								if (key.startsWith('enum.functions.') && typeof key === 'string') {
									setSelectedFunction(allFunction[key] ?? undefined);
								}
							}
						}
					}
				});
		}
	};

	useEffect(() => {
		props.socket.getForeignObjects('enum.functions.*', 'enum').then((enums: Record<string, ioBroker.Object>) => {
			// enums['__'] = { _id: '__', common: { name: '__' }, native: {}, type: 'enum' };
			setAllFunctions(enums);
		});
		props.socket.getForeignObjects('enum.rooms.*', 'enum').then((enums: Record<string, ioBroker.Object>) => {
			// enums['__'] = { _id: '__', common: { name: '__' }, native: {}, type: 'enum' };
			setAllRooms(enums);
		});
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		return () => {};
	}, []);

	return (
		<Box fill="horizontal">
			<form onSubmit={methods.handleSubmit(submitStateInformation)}>
				<FormProvider {...methods}>
					<Box direction="row" gap="small">
						<TextFormHook
							label={I18n.t('State ID')}
							name="stateID"
							placeholder={I18n.t('First Search the State')}
							disabled
							systemConfig={props.systemConfig}
						/>
						<TextFormHook
							label={I18n.t('State Name')}
							name="stateName"
							placeholder={I18n.t('First Search the State')}
							disabled={methods.watch().stateID === '' ? true : false}
							systemConfig={props.systemConfig}
						/>
					</Box>
					<Box direction="row" gap="small">
						<FormField fill="horizontal" help={I18n.t('select room')}>
							<Select
								placeholder="clear"
								value={selectedRoom}
								options={Object.values(allRooms)}
								valueKey="_id"
								labelKey={(obj: ioBroker.Object) =>
									Helper.getName(obj.common.name, props.systemConfig.language)
								}
								onChange={({ value: nextValue }) => setSelectedRoom(nextValue)}
								clear
								disabled={methods.watch().stateID === '' ? true : false}
							/>
						</FormField>
						<FormField fill="horizontal" help={I18n.t('select func')}>
							<Select
								placeholder="clear"
								value={selectedFunction}
								options={Object.values(allFunction)}
								valueKey="_id"
								labelKey={(obj: ioBroker.Object) =>
									Helper.getName(obj.common.name, props.systemConfig.language)
								}
								onChange={({ value: nextValue }) => setSelectedFunction(nextValue)}
								clear
								disabled={methods.watch().stateID === '' ? true : false}
							/>
						</FormField>
					</Box>
					<Box direction="row" gap="small">
						<CheckBox
							checked={store2DB ?? true}
							onChange={(event) => setStore2DB(event.target.checked)}
							disabled={methods.watch().stateID === '' ? true : false}
							label={I18n.t('Should state changes be stored to InfluxDB')}
						/>
					</Box>
					<Box align="center" justify="center" direction="row" pad="medium" gap="medium" fill="horizontal">
						<Button secondary label={I18n.t('Search State')} onClick={() => setShowSearchDialog(true)} />
						<Button
							size="small"
							label={I18n.t('Clean Forms')}
							onClick={() => {
								methods.reset();
								setSelectedRoom(undefined);
								setSelectedFunction(undefined);
								setStore2DB(false);
							}}
							disabled={methods.watch().stateID === '' ? true : false}
						/>
						<Button
							size="small"
							primary
							type="submit"
							disabled={methods.watch().stateID === '' ? true : false}
							label={I18n.t('Save changes to State')}
						/>
					</Box>
				</FormProvider>
			</form>
			{showSearchDialog && (
				<DialogSelectID
					socket={props.socket}
					statesOnly={false}
					onClose={() => setShowSearchDialog(false)}
					onOk={setSelectedState}
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
		</Box>
	);
};

export default SingleStateConfigForm;
