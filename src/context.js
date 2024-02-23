// context.js
import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();


export const AppContextProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [expirationTime, setExpirationTime] = useState(null);
    const [appFolderID, setAppFolderID] = useState(null);
    const [gameList, setGameList] = useState([]);
    const [gameID, setGameID] = useState(null);
    const [savedGame, setSavedGame] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
    const API_KEY = process.env.REACT_APP_API_KEY;
    const DISCOVERY_DOCS = [process.env.REACT_APP_DISCOVERY_DOCS];
    const SCOPES = process.env.REACT_APP_SCOPES;

    return (
        <AppContext.Provider value={{
            token, setToken,
            userInfo, setUserInfo,
            expirationTime, setExpirationTime,
            appFolderID, setAppFolderID,
            gameList, setGameList,
            gameID, setGameID,
            savedGame, setSavedGame,
            isDialogOpen, setIsDialogOpen,
            CLIENT_ID,
            API_KEY,
            DISCOVERY_DOCS,
            SCOPES
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);


