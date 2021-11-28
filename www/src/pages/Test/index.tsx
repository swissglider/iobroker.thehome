import React from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';

const Test = (): JSX.Element => {
    const location = useLocation();
    return <div>Test {location.pathname}</div>
}

export default Test;