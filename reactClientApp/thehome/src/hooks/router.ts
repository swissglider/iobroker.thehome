import React from "react";
import { useLocation } from "react-router-dom";

const useQuery = ():any => {
    const { search } = useLocation();
  
    return React.useMemo(() => new URLSearchParams(search), [search]);
  }

const RouterHooks = {
    useQuery:useQuery,
}

export default RouterHooks;