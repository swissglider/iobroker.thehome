import { Box, Button, FormField, TextInput } from 'grommet';
import React from 'react';
import { useSetRecoilState } from 'recoil';
import { selectedNavState, selectedParentIDState, titleState } from '../../helper/AtomAndSelectors';
import RouterHooks from '../../hooks/router';
import { Copy } from 'grommet-icons';

const BatteryDetail = (): JSX.Element => {

    const setParentID = useSetRecoilState(selectedParentIDState);
    const setSelectedNav = useSetRecoilState(selectedNavState);
    const setTitle = useSetRecoilState(titleState);

    const query = RouterHooks.useQuery();
    const selectedValue = JSON.parse(query.get('details'));

    // name
    const nameArray = selectedValue.name.split('_');
    nameArray.length > 1 && nameArray.pop();
    const name = nameArray.join(' ');

    setParentID('batStatus');
    setSelectedNav('batStatus');
    setTitle('BatteryStatus: ' + name);

    const copyToClipboard = (): void => {
        navigator.clipboard.writeText(selectedValue.id);
    }

    return (
        <Box margin="medium">
            <FormField label="ID:" disabled>
                <Box direction="row" gap="small">
                    <TextInput
                        value={selectedValue.id}
                        size="xsmall"

                    />
                    <Button plain icon={<Copy />} onClick={() => copyToClipboard()} />
                </Box>
            </FormField>
            <FormField label="Adapter Name:" disabled>
                <TextInput
                    value={selectedValue.adapterName + '.' + selectedValue.instanceNumber}
                />
            </FormField>
            <FormField label="Channel Name:" disabled>
                <TextInput
                    value={selectedValue.channelName}
                />
            </FormField>
            <FormField label="Device Name:" disabled>
                <TextInput
                    value={selectedValue.deviceName}
                />
            </FormField>
            <FormField label="Name:" disabled>
                <TextInput
                    value={selectedValue.name}
                />
            </FormField>
            <FormField label="Function:" disabled>
                <TextInput
                    value={selectedValue.function}
                />
            </FormField>
            <FormField label="Room:" disabled>
                <TextInput
                    value={selectedValue.room}
                />
            </FormField>
            <FormField label="Role:" disabled>
                <TextInput
                    value={selectedValue.role}
                />
            </FormField>
            <FormField label="Unit:" disabled>
                <TextInput value={selectedValue.unit} />
            </FormField>
            <FormField label="Value Type:" disabled>
                <TextInput value={selectedValue.value_type} />
            </FormField>
            <FormField label="Baterry Value:" disabled>
                <TextInput value={selectedValue.value} />
            </FormField>
        </Box>
    )
}

export default BatteryDetail;