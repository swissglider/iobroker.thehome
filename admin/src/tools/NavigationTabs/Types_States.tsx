import Connection from '@iobroker/adapter-react/Connection';
import { ThemeType } from 'grommet';
import React, { FC } from 'react';
import { atom, selector, useRecoilValue } from 'recoil';

/**
 * Types
 */

export type T_General_Props_T = {
	socket: Connection;
	native: Record<string, any>;
	onChange: (attr: string, value: any, cb?: any) => void;
	systemConfig: Record<string, any>;
	state: Record<string, any>;
	onLoadConfig: (newNative: Record<string, any>) => void;
	instance: number;
	common: any;
	onClose: () => void;
	onSave: (isClose: boolean) => void;
	theme: ThemeType;
	adapterName: string;
	instanceId: string;
	adapterInstanceName: string;
};

export type T_General_Props = T_General_Props_T & {
	onToast: (message: { title: string; text: string } | string) => void;
	onError: (message: { title: string; text: string } | string) => void;
	sendToWithWaitModul: (
		instance: string,
		command?: string | undefined,
		data?: ioBroker.MessagePayload | undefined,
	) => Promise<ioBroker.Message | undefined>;
};

export type T_Tab_Type = {
	title: string;
	child?: React.FC<T_General_Props>;
	icon?: JSX.Element;
	subTabs?: T_Tab_Type[];
	disabled?: boolean;
	visible?: boolean;
};
export type T_Tab_Type_Array = T_Tab_Type[];

/**
 * Dummies
 */

const DummyPage: FC<T_General_Props> = (): JSX.Element => <></>;

export const dummySelectedTabState: T_Tab_Type = { title: 'dummy', child: DummyPage };

/**
 * States
 */

export const titleState = atom({ key: 'titleState', default: '' as string });

export const selectedTabTitle_State = atom({ key: 'selectedTabTitle_State', default: 'dummy' });

export const selectedSubTabTitle_State = atom({ key: 'selectedSubTabTitle_State', default: 'dummy' });

export const allTabsState = atom({ key: 'allTabsState', default: [dummySelectedTabState] as T_Tab_Type_Array });

export const selectedTab_State = selector({
	key: 'selectedTab_State',
	get: ({ get }) => {
		const allTabs = get(allTabsState);
		const selectedTabTitle = get(selectedTabTitle_State);

		return allTabs.find((e) => e.title === selectedTabTitle);
	},
});

export const selectedSubTab_State = selector({
	key: 'selectedSubTab_State',
	get: ({ get }) => {
		const selectedTab = get(selectedTab_State);
		const selectedTabSubTitle = get(selectedSubTabTitle_State);

		if (!(selectedTab && selectedTab.subTabs && Array.isArray(selectedTab.subTabs))) return;

		return selectedTab.subTabs.find((e) => e.title === selectedTabSubTitle);
	},
});

/**
 * add and replace subTab to the end of the subtabs
 *
 * @param parentTabName tab on first level
 * @param subTabName subTab to be added to the parent subTab Array
 * @param allTabs allTabs
 * @param setAllTabs setter for allTabs
 */
export const addAndReplaceSubTab = (
	parentTabName: string,
	subTabName: string,
	newTab: T_Tab_Type,
	allTabs: T_Tab_Type_Array,
	setAllTabs: (array: T_Tab_Type_Array) => void,
): void => {
	console.log(parentTabName, subTabName, allTabs);
	const _allTabs = [...allTabs];
	const tab = _allTabs.find((e) => e.title === parentTabName);
	const otherTabs = _allTabs.filter((e) => e.title !== parentTabName);
	if (tab) {
		// filter out existing subTab to replace or if no subTab available create it
		const exclusiveSubTab: T_Tab_Type_Array = tab.subTabs ? tab.subTabs.filter((e) => e.title !== subTabName) : [];

		// merge the filtered subTab with the new one
		const tmpSubTab = [...exclusiveSubTab, newTab];

		// build the new allTabs and adds it
		const tmpTab = { ...tab, ...{ subTabs: tmpSubTab } };
		const tmpTaps = [tmpTab, ...otherTabs];
		setAllTabs(tmpTaps);
	}
};
