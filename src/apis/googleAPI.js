// /src/api/googleAPI.js
/* global gapi, google  */
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const API_KEY = process.env.REACT_APP_API_KEY;
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let tokenClient;

export function initGoogleAPI() {
  const gapiInitPromise = new Promise((resolve, reject) => {
    gapi.load('client', () => {
      gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOCS
      })
        .then(() => { resolve(); })
        .catch((error) => { reject(error); });
    });
  });

  const gisInitPromise = new Promise((resolve) => {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      access_type: "offline",
      prompt: ''
    });
    resolve();
  });

  return Promise.all([gapiInitPromise, gisInitPromise]);
}

export function logout() {
  return new Promise((resolve) => {
    google.accounts.id.disableAutoSelect();
    resolve({ access_token: '', expires_in: 0 });
  });
}

export function login() {
  return new Promise((resolve) => {
    tokenClient.callback = (token) => {
      // console.log(token);
      getUserInfo(token.access_token)
        .then(userInfo => { resolve({ token, userInfo }); })
    };
    tokenClient.requestAccessToken({ prompt: '' });
  });
}

function getUserInfo(accessToken) {
  const userInfoEndpoint = 'https://www.googleapis.com/oauth2/v1/userinfo';
  return fetch(userInfoEndpoint, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
    .then(response => response.json())
}
