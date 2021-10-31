import { Box, Grommet, Tabs, Text, Tab, Tip } from 'grommet';
import { deepMerge } from 'grommet/utils';
import React, { FC, useEffect, useState } from 'react';
import getRandomString from '../../helper/GetRandomKey';
import { useRecoilState, useRecoilValue } from 'recoil';
import { selectedTab_State, T_General_Props, T_Tab_Type_Array, selectedSubTabTitle_State } from './Types_States';
import { subTabsTheme } from './SubNavTabsTheme';
import I18n from '@iobroker/adapter-react/i18n';

const SubNavigationTabs: FC<T_General_Props> = (props: T_General_Props): JSX.Element => {
	const selectedTab = useRecoilValue(selectedTab_State);
	const [selectedSubTabTitle, setSelectedSubTabTitle] = useRecoilState(selectedSubTabTitle_State);
	const [index, setIndex] = useState<number>(0);

	useEffect(() => {
		if (selectedTab && selectedTab.subTabs && selectedSubTabTitle) {
			const index_ = selectedTab.subTabs.findIndex((e) => e.title === selectedSubTabTitle);
			setIndex(index_ !== -1 ? index_ : 0);
		}
	}, [selectedSubTabTitle]);

	return (
		<Grommet theme={deepMerge(props.theme, subTabsTheme)} plain>
			<Box elevation="xsmall">
				{selectedTab && selectedTab.subTabs && selectedTab.subTabs.length > 0 && (
					<Tabs
						margin="none"
						activeIndex={index}
						onActive={(index) =>
							setSelectedSubTabTitle((selectedTab.subTabs as T_Tab_Type_Array)[index].title)
						}
					>
						{(selectedTab.subTabs as T_Tab_Type_Array).map((tab) => (
							<Tip
								key={getRandomString(tab.title)}
								plain
								content={
									<Box
										pad="xxsmall"
										background="text" // no opacity
										round="xsmall"
										margin="xsmall"
										overflow="hidden"
										align="center"
									>
										<Text size="xsmall">{I18n.t(tab.title)}</Text>
									</Box>
								}
							>
								<Tab title={!tab.icon ? I18n.t(tab.title) : undefined} icon={tab.icon ?? undefined} />
							</Tip>
						))}
					</Tabs>
				)}
			</Box>
		</Grommet>
	);
};

export default SubNavigationTabs;
