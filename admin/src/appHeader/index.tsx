import React, { FC } from 'react';
import { Box, Button, Grid, Header, ResponsiveContext } from 'grommet';
import Logo from '@iobroker/adapter-react/Components/Logo';
import NavigationMenu from '../tools/NavigationTabs/NavigationMenu';
import NavigationTabs from '../tools/NavigationTabs/NavigationTabs';
import { T_General_Props } from '../tools/NavigationTabs/Types_States';

type T_AppHeader = {
	gridAreaHeader: string;
	generalProps: T_General_Props;
};

const AppHeader: FC<T_AppHeader> = (props: T_AppHeader): JSX.Element => {
	const size = React.useContext(ResponsiveContext);
	return (
		<Header gridArea={props.gridAreaHeader}>
			<Grid
				fill="horizontal"
				align="center"
				columns={['auto', 'flex', 'auto']}
				rows={['auto', 'auto']}
				gap="none"
				margin="none"
				pad={{ right: 'small' }}
				areas={[
					{ name: 'logo', start: [0, 0], end: [0, 0] },
					{ name: 'save', start: [1, 0], end: [1, 0] },
					{ name: 'menu', start: [2, 0], end: [2, 0] },
					{ name: 'tabs', start: [0, 1], end: [2, 1] },
				]}
			>
				<Box gridArea="logo">
					{!['xsmall', 'small'].includes(size.toString()) ? (
						<Logo
							instance={props.generalProps.instance}
							classes={{ buttons: '', logo: '' }}
							common={props.generalProps.common}
							native={props.generalProps.state.native}
							onError={(text) => alert(text)}
							onLoad={(native) => props.generalProps.onLoadConfig(native)}
						/>
					) : (
						<Box />
					)}
				</Box>
				<Box
					gridArea="save"
					direction="row"
					flex={false}
					gap="medium"
					justify={['xsmall', 'small', 'medium'].includes(size.toString()) ? 'center' : 'end'}
					wrap
				>
					<Button
						plain
						label="Save"
						disabled={!props.generalProps.state.changed}
						onClick={() => props.generalProps.onSave(false)}
					/>
					<Button
						plain
						label="Save & Close"
						disabled={!props.generalProps.state.changed}
						onClick={() => props.generalProps.onSave(true)}
					/>
					<Button plain label="Close" onClick={() => props.generalProps.onClose()} />
				</Box>
				{['xsmall', 'small', 'medium'].includes(size.toString()) && (
					<Box gridArea="menu">
						<NavigationMenu />
					</Box>
				)}
				{!['xsmall', 'small', 'medium'].includes(size.toString()) && (
					<Box gridArea="tabs">
						<NavigationTabs />
					</Box>
				)}
			</Grid>
		</Header>
	);
};

export default AppHeader;
