// context.js
import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [expirationTime, setExpirationTime] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [gameID, setGameID] = useState(null);
    const [appFolderID, setAppFolderID] = useState(null);
    const [gameList, setGameList] = useState([]);
    const [gamesLoaded, setGamesLoaded] = useState(false);
    const [savedGameData, setSavedGameData] = useState(null);

    return (
        <AppContext.Provider value={{ 
            token, setToken, 
            expirationTime, setExpirationTime, 
            userInfo, setUserInfo, 
            gameID, setGameID, 
            gameList, setGameList, 
            appFolderID, setAppFolderID, 
            gamesLoaded, setGamesLoaded,
            savedGameData, setSavedGameData}}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);


