import React, { FC } from 'react';
import { Menu } from 'grommet';
import { Menu as MenuIcon } from 'grommet-icons';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { allTabsState, selectedTabTitle_State } from './Types_States';
import I18n from '@iobroker/adapter-react/i18n';

const NavigationMenu: FC = (): JSX.Element => {
	const setSelectedTabTitle = useSetRecoilState(selectedTabTitle_State);
	const allTabs = useRecoilValue(allTabsState);

	return (
		<Menu
			dropProps={{
				align: { top: 'bottom', left: 'left' },
				elevation: 'small',
			}}
			icon={<MenuIcon color="brand" />}
			items={allTabs
				.filter((tab) => tab.title !== 'dummy')
				.map((tab) => ({
					label: I18n.t(tab.title),
					onClick: () => setSelectedTabTitle(tab.title),
				}))}
		/>
	);
};

export default NavigationMenu;
