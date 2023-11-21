import React from 'react';

const Home = ({ user }) => {
  return (
    <div>
      <h1> Welcome to Loop Game Engine</h1>
      {user && <p>Hello, {user}!</p>}
    </div>
  );
};

export default Home;
