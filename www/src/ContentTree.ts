import { Add, Connect, Link, More } from 'grommet-icons';
import { GiBatteryPackAlt } from "react-icons/gi";
import BatteryStatus from './pages/BatteryStatus';
import BatteryDetail from './pages/BatteryStatus/detail';
import { BatteryStatusBooleanList, BatteryStatusPercentList } from './pages/BatteryStatus/filteredList';
import MorePage from "./pages/more";
import Test from "./pages/Test";
import { T_GenericApp } from './types/T_GenericApp';

type T_Page_Props = {
	genericApp: T_GenericApp;
}

export type T_Page = {
    id: string,
    name: string,
    icon: React.ComponentType,
    iconType?: 'GrommetIcon' | 'GameIcon',
    showAsNav?:boolean,
    default?: boolean,
    subPages?: string[],
    content: React.ComponentType<T_Page_Props>,
    showNotInMore?:boolean,
}

export type T_Router = {
    mainPages:Record<string,T_Page>,
}

export const ContentTree:T_Router = {
    mainPages: {
        batStatus: {
            id:'batStatus',
            name: 'Battery Status',
            icon: GiBatteryPackAlt,
            iconType: 'GameIcon',
            showAsNav: true,
            content: BatteryStatus,
            default: true,
            subPages:['batListPercent','batListBoolean']
        },
        batDetail: {
            id:'batDetail',
            name: 'Battery Detail',
            icon: GiBatteryPackAlt,
            iconType: 'GameIcon',
            showAsNav: false,
            content: BatteryDetail,
            showNotInMore: true,
        },
        batListPercent: {
            id:'batListPercent',
            name: 'All Batt with %',
            icon: GiBatteryPackAlt,
            iconType: 'GameIcon',
            showAsNav: false,
            content: BatteryStatusPercentList,
        },
        batListBoolean: {
            id:'batListBoolean',
            name: 'All Batt with 1/0',
            icon: GiBatteryPackAlt,
            iconType: 'GameIcon',
            showAsNav: false,
            content: BatteryStatusBooleanList,
        },
        conStatus: {
            id:'conStatus',
            name: 'Connection Status',
            icon: Connect,
            iconType: 'GrommetIcon',
            showAsNav: true,
            content: Test,
        },
        addStatus: {
            id:'addStatus',
            name: 'Add Status',
            icon: Add,
            showAsNav: true,
            content: Test,
        },
        link: {
            id:'link',
            name: 'Link Buttons 2 Lights',
            icon: Link,
            showAsNav: true,
            content: Test,
        },
        more: {
            id:'more',
            name: 'More',
            icon: More,
            showAsNav: true,
            content: MorePage,
        },
        test1: {
            id:'test1',
            name: 'Test1',
            icon: Link,
            content: Test,
        },
        test2: {
            id:'test2',
            name: 'Test2',
            icon: More,
            content: Test,
        },
        test3: {
            id:'test3',
            name: 'Test3',
            icon: GiBatteryPackAlt,
            iconType: 'GameIcon',
            content: Test,
        },
        test4: {
            id:'test4',
            name: 'Test4',
            icon: GiBatteryPackAlt,
            iconType: 'GameIcon',
            content: Test,
        },
        test5: {
            id:'test5',
            name: 'Test5',
            icon: GiBatteryPackAlt,
            iconType: 'GameIcon',
            content: Test,
        },
        test6: {
            id:'test6',
            name: 'Test6',
            icon: GiBatteryPackAlt,
            iconType: 'GameIcon',
            content: Test,
        },
    }
}