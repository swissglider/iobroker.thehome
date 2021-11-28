import React from 'react';
import { Box, Button, Heading, Text } from 'grommet';
import { ContentTree, T_Page } from '../../ContentTree';
import { FormNext } from 'grommet-icons';
import { useHistory } from 'react-router-dom';
import getRandomString from '../../helper/GetRandomKey';

const MorePage = (): JSX.Element => {

    const history = useHistory();

    const data: T_Page[] = []
    const allSubPages: string[] = []

    for (const value of Object.values(ContentTree.mainPages)) {
        if (value.subPages) {
            for (const subPage of value.subPages) {
                allSubPages.push(subPage)
            }
        }
    }

    for (const value of Object.values(ContentTree.mainPages)) {
        if (!value.showAsNav && !allSubPages.includes(value.id) && value.showNotInMore !== true) {
            data.push(value)
        }
    }

    return (
        <Box gap="xsmall" direction="column" justify="start" pad="none" margin="none">
            <Heading level={2} margin={{ horizontal: 'small' }} color="brand">
                More Pages
            </Heading>
            <Box border={[{ side: 'bottom', color: 'brand' }]} margin={{ horizontal: 'small' }} />
            {data.map(e => (
                <Box
                    key={getRandomString(e.id)}
                    margin={{ horizontal: 'small' }}
                    align="center"
                    pad={{ horizontal: 'small', vertical: 'xsmall' }}
                    direction="row"
                    border={[{ side: 'bottom', color: 'brand' }]}
                    gap="medium"
                    onClick={e1 => {
                        e1.preventDefault();
                        history.push(`/${e.id}`);
                    }}
                >
                    <Button
                        plain
                        icon={<FormNext size="large" color="brand" />}
                        onClick={e1 => {
                            e1.preventDefault();
                            history.push(`/${e.id}`);
                        }}
                    />
                    <Text size="large">
                        {e.name}
                    </Text>
                </Box>
            ))
            }
        </Box >
    )
}

export default MorePage;