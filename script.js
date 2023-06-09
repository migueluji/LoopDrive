var CLIENT_ID = '129246923501-4lk4rkmhin21kcaoul91k300s9ar9n1t.apps.googleusercontent.com';
var API_KEY = 'AIzaSyCfXON-94Onk-fLyihh8buKZcFIjynGRTc';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
var SCOPES = 'https://www.googleapis.com/auth/drive ';
var tokenClient;
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

function gapiLoad() {
  gapi.load('client', gapiInit);
}

function gapiInit() {
  gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: DISCOVERY_DOCS
  }).then(function () {
    gapiInited = true;
    maybeEnableButtons();
  });
}

function gisInit() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES
  });
  gisInited = true;
  maybeEnableButtons();
}

function maybeEnableButtons() {
  if (gapiInited && gisInited) signinButton.style.display = 'block';
}

function signOut() {
  google.accounts.id.disableAutoSelect();
  listcontainer.innerHTML = '';
  signinButton.style.display = 'block'
  signoutButton.style.display = newgameButton.style.display = 'none';
}

function signIn() {
  tokenClient.callback = (token) => {
    if (token.error !== undefined) { throw (token); }
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
  tokenClient.requestAccessToken();
}

function checkTokenExpiration() {
  const tokenExpiration = localStorage.getItem('tokenExpiration');
  var now = new Date().getTime();
  var timeRemaining = Math.floor((tokenExpiration - now) / 1000); // Convertir a segundo
  var minutes = Math.floor(timeRemaining / 60)
  var seconds = timeRemaining % 60;
  document.querySelector('.title').innerHTML = "Loop: " + user + " (" + minutes + " : " + seconds + ")";
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

function expand(v) {
  var click_position = v.getBoundingClientRect();
  if (expandContainer.style.display == 'block') {
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
  var url = "editor/?id=" + gameID;// the id is in the menu container
  if (openWindows[url] && !openWindows[url].closed) openWindows[url].focus();
  else openWindows[url] = window.open(url, "_blank");
  expandContainer.style.display = 'none';
  expandContainerUl.setAttribute('gameid', '');
}

function deleteMenu(event) {
  if (!(event.target.tagName == 'svg' || event.target.tagName == 'path') && event.target != expandContainer) {
    expandContainer.style.display = 'none';
    expandContainerUl.setAttribute('gameid', '');
  }
}

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
  var request = gapi.client.drive.files.get({ // get information from original folder o the game
    'fileId': directoryId,
    'fields': 'name, parents'
  });
  request.execute(function (res) {
    console.log('Game Folder Retrieved');
    var duplicateFolderName = res.name + ' - Copy';
    var copyRequest = gapi.client.drive.files.create({ // copy the directory
      'resource': {
        'name': duplicateFolderName,
        'mimeType': 'application/vnd.google-apps.folder',
        'parents': res.parents
      }
    });
    copyRequest.execute(function (copyRes) {
      console.log('Game Folder Duplicated');
      var duplicatedDirectoryId = copyRes.id;
      copyDirectoryContents(directoryId, duplicatedDirectoryId, duplicateFolderName); // Copy the files from within the folder
      expandContainer.style.display = 'none';
      expandContainerUl.setAttribute('gameid', '');
      listDriveGames(appFolderID);
    });
  });
}

function copyDirectoryContents(sourceDirectoryId, destinationDirectoryId, duplicateFolderName) {
  var request = gapi.client.drive.files.list({ // get files inside the original folder
    'q': "'" + sourceDirectoryId + "' in parents",
    'fields': 'files(id, name, mimeType)'
  });
  request.execute(function (res) {
    var files = res.files;
    files.forEach(function (file) { // Browse through the files and copy them to the duplicate folder
      if (file.mimeType === 'application/vnd.google-apps.folder') { // If it is a subfolder, duplicate it recursively
        duplicateSubdirectory(file.id, destinationDirectoryId);
      } else {// if it is a file, duplicate it directly
        var copyRequest = gapi.client.drive.files.copy({
          'fileId': file.id,
          'parents': [destinationDirectoryId]
        });
        copyRequest.execute(function (copyRes) {
          console.log('File Copied: ' + copyRes.name);
          if (copyRes.name == "game.json") {
            getJson(sourceDirectoryId)
              .then(function (originalGameJsonId) {
                // Aquí puedes usar el ID originalGameJsonId como desees
                console.log('ID del archivo game.json:', originalGameJsonId);
                // Luego puedes llamar a la función changeNameInJson pasando el ID y el nuevo nombre
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
    var gameJsonContent = res; // Parsear el contenido del archivo JSON
    gameJsonContent.name = newName; // Cambiar el valor "name" por el nuevo nombre

    var updatedJsonString = JSON.stringify(gameJsonContent); // Convertir el objeto modificado a una cadena JSON

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
  var request = gapi.client.drive.files.get({ // Get the original subfolder data
    'fileId': sourceSubdirectoryId,
    'fields': 'name, parents'
  });
  request.execute(function (res) {
    console.log('Subdirectory Retrieved');
    var subdirectoryData = res;
    var copyRequest = gapi.client.drive.files.create({ // Create a copy of the subdirectory inside the duplicate directory
      'resource': {
        'name': subdirectoryData.name,
        'mimeType': 'application/vnd.google-apps.folder',
        'parents': [destinationParentId]
      }
    });
    copyRequest.execute(function (copyRes) {
      console.log('Subdirectory Duplicated');
      var duplicatedSubdirectoryId = copyRes.id;
      copyDirectoryContents(sourceSubdirectoryId, duplicatedSubdirectoryId); // Copy the files into the subdirectory
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



