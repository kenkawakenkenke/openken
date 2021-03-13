import React, { createContext, useState, useContext, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const UuidContext = createContext();

export const useUuid = () => useContext(UuidContext);

export const UuidContextProvider = ({ children }) => {
    const [storedUuid, setStoredUuid] = useState();

    useEffect(() => {
        const uuid = uuidv4();
        console.log("compute uuid", uuid);
        setStoredUuid(uuid);
    }, []);

    return <UuidContext.Provider value={storedUuid}>
        {children}
    </UuidContext.Provider>;
}
