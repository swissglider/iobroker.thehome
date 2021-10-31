import React, { FC, useEffect, useState } from 'react';
import { Tab, Tabs } from 'grommet';
import { useRecoilState, useRecoilValue } from 'recoil';
import getRandomString from '../../helper/GetRandomKey';
import { allTabsState, selectedTabTitle_State } from './Types_States';
import I18n from '@iobroker/adapter-react/i18n';

const NavigationTabs: FC = (): JSX.Element => {
	const [selectedTabTitle, setSelectedTabTitle] = useRecoilState(selectedTabTitle_State);
	const allTabs = useRecoilValue(allTabsState);
	const [index, setIndex] = useState<number>(0);

	useEffect(() => {
		if (allTabs && selectedTabTitle) {
			const index_ = allTabs.findIndex((e) => e.title === selectedTabTitle);
			setIndex(index_ !== -1 ? index_ : 0);
		}
	}, [selectedTabTitle]);

	return (
		<Tabs margin="none" activeIndex={index} onActive={(index) => setSelectedTabTitle(allTabs[index].title)}>
			{allTabs
				.filter((tab) => tab.title !== 'dummy')
				.map((slide) => (
					<Tab key={getRandomString(slide.title)} title={I18n.t(slide.title)} />
				))}
		</Tabs>
	);
};

export default NavigationTabs;
