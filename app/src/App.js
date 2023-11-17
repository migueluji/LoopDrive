import './App.css';
import { useEffect, useState } from 'react';
import { jwtDecode } from "jwt-decode";

const CLIENT_ID = "129246923501-4lk4rkmhin21kcaoul91k300s9ar9n1t.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/drive";

function App() {

  const [user, setUser] = useState({});
  const [tokenClient, setTokenClient] = useState({});

  function handleCallbackResponse(response) {
    console.log(response.credential);
    var userObject = jwtDecode(response.credential);
    console.log(userObject);
    setUser(userObject);
    document.getElementById('signInDiv').hidden = true;
  }

  function handleSignOut(event) {
    setUser({});
    document.getElementById('signInDiv').hidden = false;
  }

  function createDriveFile() {
    tokenClient.requestAccessToken();
  }

  useEffect(() => {
    /* global google */
    const google = window.google;
    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: handleCallbackResponse
    });

    google.accounts.id.renderButton(
      document.getElementById("signInDiv"),
      { theme: "outline", size: "large" }
    );

    // Access Tokens
    setTokenClient(
      google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse) => {
          console.log(tokenResponse);
          if (tokenResponse && tokenResponse.access_token) {
            fetch("https://www.googleapis.com/drive/v3/files", {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenResponse.access_token}`
              },
              body: JSON.stringify({ "name": "loop test", "mimeType": "text/plain" })
            }
            ); // gapi
          }
          // we now have access to a live token to use for GOOGLE DRIVE API
        }
      })
    );
    // tokenClient.requestAccessTokn();
    google.accounts.id.prompt();
  }, []);

  return (
    <div className="App">
      <div id="signInDiv"></div>
      {Object.keys(user).length != 0 &&
        <button onClick={(e) => handleSignOut(e)}>Sign Out</button>
      }
      {user &&
        <div>
          <img src={user.picture}></img>
          <h3>{user.given_name}</h3>
          <input type='submit' onClick={createDriveFile} value="Create File" />
        </div>
      }
    </div>
  );
}

export default App;
