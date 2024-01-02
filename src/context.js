// /src/context.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import { folderExists, createFolder, listDriveGames } from './apis/driveAPI';

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [gameID, setGameID] = useState(null);
    const [appFolderID, setAppFolderID] = useState(null);
    const [gameList, setGameList] = useState([]);

    const loadGames = useCallback(async () => {
        let folderID = appFolderID;
        if (!folderID) {
            folderID = await folderExists("Loop Games", token?.access_token);
            if (!folderID) {
                folderID = await createFolder("Loop Games", 'root', token?.access_token);
            }
            setAppFolderID(folderID);
        }
        const updatedGameList = await listDriveGames(folderID, token);
        setGameList(updatedGameList);
    }, [token, appFolderID]);
    

    return (
        <AppContext.Provider value={{ token, setToken, userInfo, setUserInfo, gameID, setGameID, gameList, setGameList, loadGames, appFolderID }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);

