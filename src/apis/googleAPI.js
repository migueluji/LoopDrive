// /src/api/googleAPI.js
/* global gapi, google  */

//const userInfoEndpoint = 'https://www.googleapis.com/oauth2/v1/userinfo';

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
    console.error(`Google API initialization failed: ${error.message}`);
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
    console.error(`Error during login or user info retrieval: ${error.message}`);
  }
}

export async function logout() {
  try {
    google.accounts.id.disableAutoSelect();
  } catch (error) {
    console.error(`Error during logout: ${error.message}`);
  }
}

export async function getUserInfo() {
  try {
    const response = await gapi.client.people.people.get({
      resourceName: 'people/me',
      personFields: 'emailAddresses,names',
    });
    console.log(response); // Verifica la estructura de la respuesta completa
    return { data: response.result, error: null };
  } catch (error) {
    console.error(`Error during user info retrieval: ${error.message}`);
    return { data: null, error };
  }
}


