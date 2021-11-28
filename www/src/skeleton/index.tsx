import { Box, Button, Grid, Heading, ResponsiveContext, Text } from 'grommet';
import React, { FC, useEffect, useState } from 'react';
import { Route, Switch, useHistory, useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { selectedNavState, selectedParentIDState, themeModeState, titleState, totalHeightState, totalWidthState } from '../helper/AtomAndSelectors';
import getRandomString from '../helper/GetRandomKey';
import { ContentTree, T_Page } from '../ContentTree';
import { FormPrevious } from 'grommet-icons';
import { T_GenericApp } from '../types/T_GenericApp';
import Page404 from '../pages/Page404';


type T_Skeleton_Props = {
    genericApp: T_GenericApp;
}

const columns = {
    xsmall: ['auto'],
    small: ['auto', 'auto'],
    medium: ['auto', 'auto', 'auto'],
    large: ['auto', 'auto', 'auto', 'auto', 'auto'],
    xlarge: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
};

const SubBorderLine = (): JSX.Element => {
    return <Box margin={{ vertical: 'small' }} border={[{ side: 'top', style: 'dotted' }]} />
}

const Skeleton: FC<T_Skeleton_Props> = ({ genericApp }: T_Skeleton_Props): JSX.Element => {

    const themeMode = useRecoilValue(themeModeState);
    const totalHeight = useRecoilValue(totalHeightState);
    const totalWidth = useRecoilValue(totalWidthState);
    const [title, setTitle] = useRecoilState(titleState);
    const [defaultPage, setDefaultPage] = useState<T_Page | undefined>(undefined)
    const [selectedNav, setSelectedNav] = useRecoilState(selectedNavState);
    const [parentID, setParentID] = useRecoilState(selectedParentIDState);
    const size = React.useContext(ResponsiveContext) as 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';
    const history = useHistory();
    const location = useLocation();

    let columnsVal = columns;
    if (columns) {
        if (columns[size]) {
            columnsVal = columns[size] as any;
        }
    }

    useEffect(() => {
        let selNav = ''
        setParentID('');
        const _default = Object.values(ContentTree.mainPages).find(e => e.default)
        setDefaultPage(_default)
        if (location.pathname !== '/') {
            const id = location.pathname.slice(1);
            if (ContentTree.mainPages[id]) {
                setSelectedNav(id)
                selNav = id
                setTitle(ContentTree.mainPages[id].name)

                const mainPage = Object.values(ContentTree.mainPages).find(e => e.subPages && e.subPages.includes(id))
                if (mainPage) {
                    setParentID(mainPage.id)
                    setSelectedNav(mainPage.id)
                }
            }
        }
        if ((selNav === '' || location.pathname === '/') && _default) {
            setSelectedNav(_default.id)
            setTitle(_default.name)
        }
    }, [location.pathname]);

    return (
        <>
            <Grid
                fill
                columns={['full']}
                rows={['auto', 'flex', 'auto']}
                areas={[
                    { name: 'header', start: [0, 0], end: [0, 0] },
                    { name: 'main', start: [0, 1], end: [0, 1] },
                    { name: 'footer', start: [0, 2], end: [0, 2] },
                ]}
            >
                <Box
                    direction="column"
                    gap="xsmall"
                    as="header"
                    flex={false}
                    pad={{ horizontal: 'medium', vertical: 'medium' }}
                    border={[{ side: 'bottom', style: 'solid', color: 'brand', size: 'small' }]}
                    background="light-2"
                >
                    <Box direction="row" justify="between">
                        {parentID !== '' ? (
                            <Button
                                plain
                                icon={<FormPrevious color="brand" size="medium" />}
                                onClick={e1 => {
                                    e1.preventDefault();
                                    history.push(`/${parentID}`);
                                }}
                            />
                        ) : (
                            <Button plain icon={<FormPrevious color="light-2" size="medium" />} />
                        )}
                        <Box>
                            <Text></Text>
                        </Box>
                        <Text alignSelf="start" margin="none" size="small" color="brand">TheHome</Text>
                    </Box>
                    <Heading level={2} margin={{ left: 'small', top: 'xxsmall', bottom: 'none' }}>
                        {title}
                    </Heading>
                </Box>
                <Box
                    gridArea="main"
                    as="main"
                    flex="grow"
                    overflow={{ horizontal: 'hidden', vertical: 'auto' }}
                    background="light-2"
                >
                    <Box
                        margin="xsmall"
                        flex="grow"
                        round="small"
                        pad={{ horizontal: 'none', vertical: 'small' }}
                        border={{ style: 'dotted' }}
                    >
                        {
                            parentID === '' &&
                            ContentTree.mainPages[selectedNav] &&
                            ContentTree.mainPages[selectedNav].subPages &&
                            (ContentTree.mainPages[selectedNav].subPages as string[]).length > 0 && (
                                <>
                                    <Box
                                        direction="row"
                                        gap="small"
                                        justify="between"
                                        wrap={true}
                                        pad={{ horizontal: 'small' }}
                                    >
                                        <Box fill>
                                            <Grid alignSelf="stretch" columns={!columnsVal ? size : columnsVal as any} gap="small">
                                                {(ContentTree.mainPages[selectedNav].subPages as string[]).map(e => {
                                                    let _props: Record<string, any> = {}
                                                    if (ContentTree.mainPages[e].icon) {
                                                        _props.icon = ContentTree.mainPages[e].iconType === 'GrommetIcon'
                                                            ? React.createElement(ContentTree.mainPages[e].icon, { size: 'medium' } as any)
                                                            : ContentTree.mainPages[e].iconType === 'GameIcon'
                                                                ? React.createElement(ContentTree.mainPages[e].icon, { size: '1.7em' } as any)
                                                                : React.createElement(ContentTree.mainPages[e].icon, { size: 'medium' } as any)

                                                    }
                                                    return ContentTree.mainPages[e]
                                                        ? (
                                                            < Button
                                                                key={getRandomString(e)}
                                                                size="small"
                                                                justify="start"
                                                                label={ContentTree.mainPages[e].name}
                                                                {..._props}
                                                                primary
                                                                color="dark-2"
                                                                onClick={e1 => {
                                                                    e1.preventDefault();
                                                                    history.push(`/${ContentTree.mainPages[e].id}`);
                                                                }}
                                                            />)
                                                        : (< Button key={getRandomString(e)} size="small" label={e} />)
                                                }

                                                )}
                                            </Grid>
                                        </Box>
                                    </Box>
                                    <SubBorderLine />
                                </>
                            )}
                        <Box pad={{ horizontal: 'small' }}>
                            <Switch>
                                <Route exact path="/">
                                    {
                                        React.createElement(defaultPage ? defaultPage.content : Page404, { genericApp })
                                    }
                                </Route>
                                {Object.entries(ContentTree.mainPages).map(([key, value]) => (
                                    <Route path={`/${key}`} key={getRandomString(key)}>
                                        {React.createElement(value.content, { genericApp })}
                                    </Route>
                                ))}
                            </Switch>
                        </Box>
                    </Box>
                </Box>
                <Box
                    gridArea="footer"
                    align="center"
                    as="footer"
                    direction="row"
                    flex={false}
                    justify="between"
                    gap="small"
                    pad={{ horizontal: 'medium', vertical: 'small', bottom: 'large' }}
                    border={[{ side: 'top', style: 'solid', color: 'brand', size: 'small' }]}
                    background="light-2"
                >
                    {Object.entries(ContentTree.mainPages).filter(([, value]) => value.showAsNav).map(([key, value]) => (
                        <Box
                            onClick={e1 => {
                                e1.preventDefault();
                                history.push(`/${key}`);
                            }}
                            key={getRandomString(key)}
                            border={selectedNav === key ? [{ side: 'bottom', color: 'neutral-3', size: 'medium' }] : []}
                            pad='small'
                        >
                            {value.iconType === 'GrommetIcon'
                                ? React.createElement(value.icon, { size: 'large' } as any)
                                : value.iconType === 'GameIcon'
                                    ? React.createElement(value.icon, { size: '2.5em' } as any)
                                    : React.createElement(value.icon, { size: 'large' } as any)
                            }
                        </Box>
                    ))}
                </Box>
            </Grid>
        </>
    );
};

export default Skeleton;
