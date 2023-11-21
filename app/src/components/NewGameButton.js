// components/NewGameButton.js

import React from 'react';

const NewGameButton = ({ onClick }) => {
  return <div className="new"><button className="newgame" onClick={onClick}>New Game</button></div>;
};

export default NewGameButton;
