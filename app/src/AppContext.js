// AppContext.js
import React, { createContext, useContext, useState } from 'react';
import { listDriveGames } from './driveAPI'; // Asegúrate de importar esta función correctamente

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [gameID, setGameID] = useState(null);
    const [games, setGames] = useState([]);

    const loadGames = async () => {
        if (games.length === 0) {
            const loadedGames = await listDriveGames(); // Llamada a la función que obtiene los juegos
            setGames(loadedGames);
        }
    };

    return (
        <AppContext.Provider value={{ token, setToken, userInfo, setUserInfo, gameID, setGameID, games, loadGames }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);

