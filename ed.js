window.onload = () => {
    gapiLoaded();
    gisLoaded()
}

var CLIENT_ID = '129246923501-4lk4rkmhin21kcaoul91k300s9ar9n1t.apps.googleusercontent.com';
var API_KEY = 'AIzaSyCfXON-94Onk-fLyihh8buKZcFIjynGRTc';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
var SCOPES = 'https://www.googleapis.com/auth/drive.file'; // access to files created by the application
let tokenClient;
let gapiInited = false;
let gisInited = false;


function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOCS,
    });
    gapiInited = true;
    maybeEnableButtons();
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: ''
    });
    gisInited = true;
    maybeEnableButtons();
}

function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        gapi.client.setToken(JSON.parse(localStorage.getItem('access_token')));
       writeJson();
    }
}


var text = document.querySelector('.text');

function writeJson(){
    text.innerHTML = localStorage.getItem("edit_game");
}

