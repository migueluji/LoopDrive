// /src/api/googleAPI.js
/* global gapi, google  */

const userInfoEndpoint = 'https://www.googleapis.com/oauth2/v1/userinfo';

let tokenClient;

export async function initGoogleAPI(CLIENT_ID, API_KEY, DISCOVERY_DOCS, SCOPES) {
  try {
    await new Promise((resolve, reject) => {
      gapi.load('client', () => {
        gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: DISCOVERY_DOCS,
        }).then(resolve).catch(reject);
      });
    });
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      prompt: '',
    });
  } catch (error) {
    throw new Error(`Google API initialization failed: ${error.message}`);
  }
}

export async function login() {
  try {
    const token = await new Promise((resolve, reject) => {
      tokenClient.callback = (response) => {
        if (response.error) {
          reject(`Login failed: ${response.error}`);
        } else {
          resolve(response);
        }
      };
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    });
    return token;
  } catch (error) {
    throw new Error(`Error during login or user info retrieval: ${error.message}`);
  }
}

export async function logout() {
  google.accounts.id.disableAutoSelect();
}

export async function getUserInfo(accessToken) {
  try {
    const response = await fetch(userInfoEndpoint, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!response.ok) throw new Error('Failed to fetch user info');
    return await response.json();
  } catch (error) {
    throw new Error(`Error during user info retrieval: ${error.message}`);
  }
}
