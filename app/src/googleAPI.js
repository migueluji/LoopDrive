// api.js
/* global gapi, google  */
import { useState } from 'react';

const CLIENT_ID = '129246923501-4lk4rkmhin21kcaoul91k300s9ar9n1t.apps.googleusercontent.com';
const API_KEY = 'AIzaSyCfXON-94Onk-fLyihh8buKZcFIjynGRTc';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/drive ';

let tokenClient;
let gapiInited = false;
let gisInited = false;
let user;

export function initGoogleAPI() {
  console.log("Loading and initializing gapi and gis...");

  const gapiInitPromise = new Promise((resolve, reject) => {
    gapi.load('client', () => {
      gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOCS
      })
        .then(() => {
          gapiInited = true;
          resolve(); // Resuelve la promesa cuando gapi está inicializado
        })
        .catch((error) => {
          console.error("Error initializing gapi:", error);
          reject(error);
        });
    });
  });

  const gisInitPromise = new Promise((resolve) => {
    console.log("Initializing gis...");
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      prompt: ''
    });
    gisInited = true;
    console.log("gis initialized successfully.");
    resolve(); // Resuelve la promesa después de la inicialización de gis
  });

  return Promise.all([gapiInitPromise, gisInitPromise]);
}

export function signOut() {
  return new Promise((resolve) => {
    google.accounts.id.disableAutoSelect();
    // Resuelve la promesa con un token vacío
    resolve({ access_token: '', expires_in: 0 });
  });
}

export function signIn() {
  return new Promise((resolve, reject) => {
    tokenClient.callback = (token) => {
      localStorage.setItem("token", JSON.stringify(token));
      const tokenExpiration = new Date().getTime() + (token.expires_in * 1000);
      localStorage.setItem('tokenExpiration', tokenExpiration);

      // Obtener información adicional del usuario haciendo una solicitud a la API de Google
      getUserInfo(token.access_token)
        .then(userInfo => {
          resolve({ token, userInfo });
        })
        .catch(error => {
          console.error('Error al obtener información del usuario:', error);
          resolve({ token, userInfo: {} });
        });
    };
    tokenClient.requestAccessToken({ prompt: '' });
  });
}


function getUserInfo(accessToken) {
  // Hacer una solicitud a la API de Google para obtener información del usuario
  // Adaptar la URL según las necesidades específicas
  const userInfoEndpoint = 'https://www.googleapis.com/oauth2/v1/userinfo';

  return fetch(userInfoEndpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
    .then(response => response.json())
    .catch(error => {
      console.error('Error al obtener información del usuario:', error);
      throw error;
    });
}



function checkTokenExpiration() {
  const tokenExpiration = localStorage.getItem('tokenExpiration');
  var now = new Date().getTime();
  var timeRemaining = Math.floor((tokenExpiration - now) / 1000); // convert to seconds
  var minutes = Math.floor(timeRemaining / 60);
  var seconds = timeRemaining % 60;
  document.querySelector('.title').innerHTML = "Loop: " + user + " (" + minutes + " : " + seconds + ")";
  if (timeRemaining < 0) signIn();
}
