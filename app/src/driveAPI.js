// api.js
/* global gapi, google  */
var CLIENT_ID = '129246923501-4lk4rkmhin21kcaoul91k300s9ar9n1t.apps.googleusercontent.com';
var API_KEY = 'AIzaSyCfXON-94Onk-fLyihh8buKZcFIjynGRTc';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
var SCOPES = 'https://www.googleapis.com/auth/drive ';
let tokenClient;
var gapiInited = false;
var gisInited = false;
var openWindows = {};
var appFolderName = "Loop Games";
var appFolderID;
var signinButton = document.getElementsByClassName('signin')[0];
var signoutButton = document.getElementsByClassName('signout')[0];
var newgameButton = document.getElementsByClassName('newgame')[0];
var listcontainer = document.querySelector('.list ul');
var expandContainer = document.querySelector('.expand-container');
var expandContainerUl = document.querySelector('.expand-container ul');
var user;

export const initGoogleAPI = () => {
    console.log("Loading and initializing gapi...");
    return new Promise((resolve, reject) => {
      gapi.load('client', () => {
        gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: DISCOVERY_DOCS
        })
        .then(() => {
          gapiInited = true;
          return maybeEnableButtons();
        })
        .then(() => {
          console.log("gapi initialized successfully.");
          resolve(); // Resuelve la promesa cuando todo está listo
        })
        .catch((error) => {
          console.error("Error initializing gapi:", error);
          reject(error);
        });
      });
    });
  };
  
  
  
  export const gisInit = () => {
    return new Promise((resolve) => {
      console.log("Initializing gis...");
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        prompt: ''
      });
      gisInited = true;
      maybeEnableButtons().then(() => {
        console.log("gis initialized successfully.");
        resolve(); // Resuelve la promesa después de la inicialización de gis
      });
    });
  };
  
  export const maybeEnableButtons = () => {
    return new Promise((resolve) => {
      if (gapiInited && gisInited) {
        // Asumo que signinButton es una variable de estado en React
        // y debería ser manipulada a través del estado de React
        // en lugar de manipular directamente el DOM en React
        // Debes ajustar esto según cómo manejes tu estado en React
        // signinButton.style.display = 'block';
        
        // En lugar de manipular el estilo directamente, 
        // podrías tener una variable de estado para controlar la visibilidad del botón
        // Por ejemplo: setSignInButtonVisible(true);
      }
      console.log("Buttons enabled.");
      console.log("Everything initialized!");
      resolve(); // Resuelve la promesa después de la inicialización de los botones
    });
  };
function signOut() {
  google.accounts.id.disableAutoSelect();
  listcontainer.innerHTML = '';
  signinButton.style.display = 'block';
  signoutButton.style.display = newgameButton.style.display = 'none';
}

function signIn() {
  tokenClient.callback = (token) => {
    console.log(token);
    localStorage.setItem("token", JSON.stringify(token));
    const tokenExpiration = new Date().getTime() + (token.expires_in * 1000);
    localStorage.setItem('tokenExpiration', tokenExpiration);
    signinButton.style.display = 'none';
    signoutButton.style.display = newgameButton.style.display = 'block';
    checkDriveFolder(appFolderName).then(function (folderId) {
      appFolderID = folderId;
      listDriveGames(appFolderID);
      setInterval(checkTokenExpiration, 1000);
    }).catch(function (error) {
      console.error(error);
    });
  };
  tokenClient.requestAccessToken({ prompt: '' });
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

function checkDriveFolder(appFolderName) {
  return new Promise(function (resolve, reject) {
    gapi.client.drive.files.list({
      q: "name ='" + appFolderName + "' and trashed=false",
      fields: 'files(id,name,owners(displayName))'
    }).then(function (response) {
      var files = response.result.files;
      user = files[0].owners[0].displayName;
      document.querySelector('.title').innerHTML = "Loop: " + user;
      if (files && files.length > 0) {
        resolve(files[0].id);
      } else {
        createFolder(appFolderName, 'root').then(function (folderId) {
          resolve(folderId);
        }).catch(function (error) {
          reject(new Error('Failed to create folder: ' + error.message));
        });
      }
    }).catch(function (error) {
      reject(new Error('Failed to list files: ' + error.message));
    });
  });
}

function listDriveGames(appFolderID) {
  if (appFolderID)
    gapi.client.drive.files.list({
      'q': `parents in "${appFolderID}"` // list user games
    }).then(function (response) {
      var files = response.result.files;
      if (files && files.length > 0) {
        listcontainer.innerHTML = '';
        for (var i = files.length - 1; i >= 0; i--) {
          listcontainer.innerHTML += `
                <li>
                    <span >${files[i].name}</span>
                    <svg  gameid="${files[i].id}" onclick="expand(this)" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/></svg>
                </li>`;
        }
      }
    })
}

// api.js (continuación)

// ... (código anterior)

function expand(v) {
    var click_position = v.getBoundingClientRect();
    if (expandContainer.style.display === 'block') {
      expandContainer.style.display = 'none';
      expandContainerUl.setAttribute('data-id', '');
    } else {
      expandContainer.style.display = 'block';
      expandContainer.style.left = (click_position.left + window.scrollX) - 120 + 'px';
      expandContainer.style.top = (click_position.top + window.scrollY) + 25 + 'px';
      expandContainerUl.setAttribute('gameid', v.getAttribute('gameid'));
    }
  }
  
  function newGame() {
    var gameID;
    createFolder("Untitled Game", appFolderID).then(function (folderId) {
      gameID = folderId;
      createEmptyJson(gameID);
      return createEmptyImage(gameID);
    }).then(function (imageFileId) {
      return createFolder("images", gameID);
    }).then(function () {
      return createFolder("sounds", gameID);
    }).then(function () {
      listDriveGames(appFolderID);
    }).catch(function (error) {
      console.error("Failed to create game:", error);
    });
  }
  
  function editGame(menuItemHTML) {
    var gameID = menuItemHTML.parentNode.getAttribute("gameid");
    var url = "editor/?id=" + gameID;
    if (openWindows[url] && !openWindows[url].closed) openWindows[url].focus();
    else openWindows[url] = window.open(url, "_blank");
    expandContainer.style.display = 'none';
    expandContainerUl.setAttribute('gameid', '');
  }
  
  function deleteMenu(event) {
    if (!(event.target.tagName === 'svg' || event.target.tagName === 'path') && event.target !== expandContainer) {
      expandContainer.style.display = 'none';
      expandContainerUl.setAttribute('gameid', '');
    }
  }
  
// api.js (continuación y final)

// ... (código anterior)

function playGame(menuItemHTML) {
    var gameID = menuItemHTML.parentNode.getAttribute("gameid");
    var url = "engine/?id=" + gameID;
    if (openWindows[url] && !openWindows[url].closed) openWindows[url].focus();
    else openWindows[url] = window.open(url, "_blank");
    expandContainer.style.display = 'none';
    expandContainerUl.setAttribute('gameid', '');
  }
  
  function deleteGame(menuItemHTML) {
    var gameID = menuItemHTML.parentNode.getAttribute("gameid");
    var gameName = document.querySelector('[gameid="' + gameID + '"]').parentNode.children[0].innerHTML;
    expandContainer.style.display = 'none';
    expandContainerUl.setAttribute('gameid', '');
    var result = window.confirm('Do you want to delete the "' + gameName + '" game ? ');
    if (result) {
      var request = gapi.client.drive.files.delete({
        'fileId': gameID
      });
      request.execute(function (res) {
        console.log('File Deleted');
        listDriveGames(appFolderID);
      })
    } else {
      console.log("Option selected: false");
    }
  }
  
  function duplicateGame(menuItemHTML) {
    var directoryId = menuItemHTML.parentNode.getAttribute("gameid");
    var request = gapi.client.drive.files.get({
      'fileId': directoryId,
      'fields': 'name, parents'
    });
    request.execute(function (res) {
      console.log('Game Folder Retrieved');
      var duplicateFolderName = res.name + ' - Copy';
      var copyRequest = gapi.client.drive.files.create({
        'resource': {
          'name': duplicateFolderName,
          'mimeType': 'application/vnd.google-apps.folder',
          'parents': res.parents
        }
      });
      copyRequest.execute(function (copyRes) {
        console.log('Game Folder Duplicated');
        var duplicatedDirectoryId = copyRes.id;
        copyDirectoryContents(directoryId, duplicatedDirectoryId, duplicateFolderName);
        expandContainer.style.display = 'none';
        expandContainerUl.setAttribute('gameid', '');
        listDriveGames(appFolderID);
      });
    });
  }
  
  function copyDirectoryContents(sourceDirectoryId, destinationDirectoryId, duplicateFolderName) {
    var request = gapi.client.drive.files.list({
      'q': "'" + sourceDirectoryId + "' in parents",
      'fields': 'files(id, name, mimeType)'
    });
    request.execute(function (res) {
      var files = res.files;
      files.forEach(function (file) {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
          duplicateSubdirectory(file.id, destinationDirectoryId);
        } else {
          var copyRequest = gapi.client.drive.files.copy({
            'fileId': file.id,
            'parents': [destinationDirectoryId]
          });
          copyRequest.execute(function (copyRes) {
            console.log('File Copied: ' + copyRes.name);
            if (copyRes.name == "game.json") {
              getJson(sourceDirectoryId)
                .then(function (originalGameJsonId) {
                  console.log('ID del archivo game.json:', originalGameJsonId);
                  changeNameInJson(copyRes.id, originalGameJsonId, duplicateFolderName);
                })
                .catch(function (error) {
                  console.error(error);
                });
            }
          });
        }
      });
    });
  }
  
  function getJson(directoryId) {
    var request = gapi.client.drive.files.list({
      'q': "name='game.json' and '" + directoryId + "' in parents",
      'fields': 'files(id)'
    });
  
    return new Promise(function (resolve, reject) {
      request.execute(function (res) {
        if (res.files.length > 0) {
          var gameJsonId = res.files[0].id;
          resolve(gameJsonId);
        } else {
          reject(new Error('No se encontró el archivo game.json en la carpeta original.'));
        }
      });
    });
  }
  
  function changeNameInJson(duplicatedDirectoryId, originalGameJsonId, newName) {
    var request = gapi.client.drive.files.get({
      'fileId': originalGameJsonId,
      'alt': 'media'
    });
  
    request.execute(function (res) {
      var gameJsonContent = res;
      gameJsonContent.name = newName;
  
      var updatedJsonString = JSON.stringify(gameJsonContent);
  
      var updateRequest = gapi.client.request({
        'path': '/upload/drive/v3/files/' + duplicatedDirectoryId,
        'method': 'PATCH',
        'params': {
          'uploadType': 'media'
        },
        'headers': {
          'Content-Type': 'application/json'
        },
        'body': updatedJsonString
      });
  
      updateRequest.execute(function (updateRes) {
        console.log('Nombre del juego duplicado actualizado: ' + newName);
      });
    });
  }
  
  function duplicateSubdirectory(sourceSubdirectoryId, destinationParentId) {
    var request = gapi.client.drive.files.get({
      'fileId': sourceSubdirectoryId,
      'fields': 'name, parents'
    });
    request.execute(function (res) {
      console.log('Subdirectory Retrieved');
      var subdirectoryData = res;
      var copyRequest = gapi.client.drive.files.create({
        'resource': {
          'name': subdirectoryData.name,
          'mimeType': 'application/vnd.google-apps.folder',
          'parents': [destinationParentId]
        }
      });
      copyRequest.execute(function (copyRes) {
        console.log('Subdirectory Duplicated');
        var duplicatedSubdirectoryId = copyRes.id;
        copyDirectoryContents(sourceSubdirectoryId, duplicatedSubdirectoryId);
      });
    });
  }
  

  function createFolder(folderName, parent) {
    return new Promise(function (resolve, reject) {
      var request = gapi.client.request({
        path: '/drive/v3/files',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("token")).access_token,
        },
        body: {
          'name': folderName,
          'mimeType': 'application/vnd.google-apps.folder',
          'parents': [parent]
        }
      });
      request.execute(function (response) {
        if (response.error) {
          reject(new Error('Failed to create folder: ' + response.error.message));
        } else if (response.id) {
          resolve(response.id);
        } else {
          reject(new Error('Failed to create folder.'));
        }
      });
    });
  }
  // Exporta las funciones necesarias si es necesario
  function createEmptyJson(gameID) {
    return new Promise(function (resolve, reject) {
      var request = gapi.client.request({
        path: '/drive/v3/files',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("token")).access_token,
        },
        body: {
          'name': 'game.json',
          'mimeType': 'application/json',
          'parents': [gameID]
        }
      });
      request.execute(function (response) {
        if (response.error) {
          reject(new Error('Failed to create JSON file: ' + response.error.message));
        } else if (response.id) {
          resolve(response.id);
        } else {
          reject(new Error('Failed to create JSON file.'));
        }
      });
    });
  }

  function createEmptyImage(gameID) {
    return new Promise(function (resolve, reject) {
      var accessToken = JSON.parse(localStorage.getItem('token')).access_token;
  
      var metadata = {
        'name': 'image.jpg',
        'parents': [gameID]
      };
      // Crear una imagen en blanco de 1x1 píxeles
      var canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      var context = canvas.getContext('2d');
      context.fillStyle = '#ffffff'; // Color blanco
      context.fillRect(0, 0, 1, 1);
      canvas.toBlob(function (blob) {
        var reader = new FileReader();
        reader.onloadend = function () {
          var base64Data = reader.result.split(',')[1];
  
          var boundary = '-------314159265358979323846';
          var delimiter = '\r\n--' + boundary + '\r\n';
          var close_delim = '\r\n--' + boundary + '--';
  
          var multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: image/jpeg\r\n' +
            'Content-Transfer-Encoding: base64\r\n' +
            '\r\n' +
            base64Data +
            close_delim;
  
          gapi.client.request({
            path: '/upload/drive/v3/files',
            method: 'POST',
            params: {
              'uploadType': 'multipart'
            },
            headers: {
              'Content-Type': 'multipart/related; boundary="' + boundary + '"',
              'Authorization': 'Bearer ' + accessToken
            },
            body: multipartRequestBody
          }).then(function (response) {
            var fileId = response.result.id;
            resolve(fileId);
          }).catch(function (error) {
            reject(new Error('Failed to create image file: ' + error.result.error.message));
          });
        };
  
        reader.readAsDataURL(blob);
      }, 'image/jpeg');
    });
  }

  export {
    signOut,
    signIn,
    listDriveGames,
    expand,
    newGame,
    editGame,
    deleteMenu,
    playGame,
    deleteGame,
    duplicateGame
  };
    
