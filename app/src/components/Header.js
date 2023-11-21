// components/Header.js

import React from 'react';

const Header = ({ user }) => {
  return (
    <div className="header">
      <div className="title">Loop: {user}</div>
    </div>
  );
};

export default Header;
