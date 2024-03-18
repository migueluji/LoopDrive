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
    return { error: null };
  } catch (error) {
    console.error(`Google API initialization failed: ${error.message}`);
    return { error };
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
    return { data: token, error: null };
  } catch (error) {
    console.error(`Error during login or user info retrieval: ${error.message}`);
    return { error };
  }
}

export async function logout() {
  try {
    google.accounts.id.disableAutoSelect();
    return { data: true, error: null };
  } catch (error) {
    console.error(`Error during logout: ${error.message}`);
    return { data: null, error };
  }
}


export async function getUserInfo() {
  console.log(gapi.client);
  try {
    // Asegúrate de que el endpoint de userinfo está incluido en tus documentos de descubrimiento.
    const response = await gapi.client.people.people.connections.list({
      resourceName: 'people/me',
      personFields: 'emailAddresses,names',
    });
    if (response.error) {
      // Esto manejará específicamente errores relacionados con la API, incluidos los de autenticación.
      console.error('Error during user info retrieval:', response.error.message);
      return { data: null, error: response.error };
    }
    // Retorna los datos de usuario directamente obtenidos de la respuesta de `gapi.client`.
    return { data: response.result, error: null };
  } catch (error) {
    console.error(`Error during user info retrieval: ${error.message}`);
    return { data: null, error };
  }
}

