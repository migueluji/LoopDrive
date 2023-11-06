var CLIENT_ID = '129246923501-4lk4rkmhin21kcaoul91k300s9ar9n1t.apps.googleusercontent.com';
var API_KEY = 'AIzaSyCfXON-94Onk-fLyihh8buKZcFIjynGRTc';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
var SCOPES = 'https://www.googleapis.com/auth/drive ';

var tokenClient;

function gisInit() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    prompt: ''
  });
  var signinButton = document.querySelector('.signin');
  signinButton.style.display = 'block';
}

function signIn() {
  tokenClient.callback = (token) => {
     // Enviar el token al Service Worker
     if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'storeToken', token });
    }
    // Redirigir al usuario a su área personal después de la autenticación
    window.location.href = 'dashboard.html'; 
  };

  tokenClient.requestAccessToken({ prompt: '' });
}

// Otro código relacionado con la autenticación y Drive puede seguir aquí
