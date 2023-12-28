// AppContext.js
import React, { createContext, useContext, useState } from 'react';
import { folderExists, createFolder, listDriveGames } from './driveAPI'; 

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [gameID, setGameID] = useState(null);
    const [appFolderID, setAppFolderID] = useState(null);
    const [gameList, setGameList] = useState([]);

    const loadGames = async () => {
        if (!gameList || gameList.length === 0) {
            if (!appFolderID) {
                const folderID = await folderExists("Loop Games", token?.access_token);
                if (!folderID) {
                    const newFolderID = await createFolder("Loop Games", 'root', token?.access_token);
                    setAppFolderID(newFolderID);
                } else {
                    setAppFolderID(folderID);
                }
            }
            const gameList = await listDriveGames(appFolderID);
            setGameList(gameList);
        }
    };

    return (
        <AppContext.Provider value={{ token, setToken, userInfo, setUserInfo, gameID, setGameID, gameList, setGameList, loadGames, appFolderID }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);

