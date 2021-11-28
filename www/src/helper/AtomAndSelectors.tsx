import { atom } from "recoil";

export const themeModeState = atom({ key: 'themeModeState', default: 'light' as 'dark' | 'light' });
export const totalHeightState = atom({ key: 'totalHeightState', default: 0 as number });
export const totalWidthState = atom({ key: 'totalWidthState', default: 0 as number });

export const titleState = atom({ key: 'titleState', default: '' as string });

export const selectedNavState = atom({ key: 'selectedNavState', default: '' as string })
export const selectedParentIDState = atom({ key: 'selectedParentIDState', default: '' as string })

export const BatteryStatusPercentFilterValuesState = atom({
    key: 'BatteryStatusPercentFilterValuesState',
    default: {} as Record<string, any[]>
})
