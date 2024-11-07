import React, { useState } from 'react';
import Chat from './components/Chat';
import Login from './components/Login';

function App() {
  const [token, setToken] = useState(null);

  return (
    <div className="App">
      {token ? <Chat /> : <Login onLogin={setToken} />}
    </div>
  );
}

export default App;
