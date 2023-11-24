
//driverAPI.js
/* global gapi */

let accessToken;
var openWindows = {};
var expandContainer = document.querySelector('.expand-container');
var expandContainerUl = document.querySelector('.expand-container ul');

function setDriveAccessToken(token) {
  accessToken = token;
}

function folderExists(folderName) {
  return new Promise((resolve, reject) => {
    gapi.client.drive.files.list({
      q: `name='${folderName}' and trashed=false`,
    }).then(response => {
      if (response.result.files && response.result.files.length > 0) {
        const folderId = response.result.files[0].id;
        resolve(folderId);
      } else {
        resolve(undefined);
      }
    }).catch(error => {
      console.error('Error checking folder existence:', error.message);
      reject(error);
    });
  });
}


function checkDriveFolder(loopGamesFolder) {
  return new Promise(function (resolve, reject) {
    gapi.client.drive.files.list({
      q: "name ='" + loopGamesFolder + "' and trashed=false",
      fields: 'files(id,name,owners(displayName))'
    }).then(function (response) {
      var files = response.result.files;
      if (files && files.length > 0) {
        resolve(files[0].id);
      } else {
        createFolder(loopGamesFolder, 'root', accessToken).then(function (folderId) {
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
  return new Promise((resolve, reject) => {
    if (appFolderID) {
      gapi.client.drive.files.list({
        'q': `parents in "${appFolderID}"`, // Listar juegos del usuario
        'fields': 'files(id, name)',
      }).then(async response => {
        const files = response.result.files;
        for (let i = files.length - 1; i >= 0; i--) {
          const gameFolderID = files[i].id;
          try {
            files[i].imageUrl = await getImageDownloadUrl(gameFolderID);
          } catch (error) {
            console.error(error.message);
          }
        }
        resolve(files);
      }).catch(error => {
        reject(new Error('Error al listar los juegos de Google Drive: ' + error.message));
      });
    }
  });
}

function getImageDownloadUrl(gameFolderID) {
  return new Promise((resolve, reject) => {
    // Buscar el archivo de la imagen por nombre en el directorio del juego
    gapi.client.drive.files.list({
      'q': `name='image.jpg' and '${gameFolderID}' in parents`,
      'fields': 'files(id)',
    }).then(response => {
      const files = response.result.files;
      if (files && files.length > 0) {
        const imageFileId = files[0].id;
        return gapi.client.drive.files.get({
          'fileId': imageFileId,
          'alt': 'media',
        });
      } else {
        reject(new Error('No se encontró el archivo de imagen en el directorio del juego.'));
      }
    }).then(res => {
      const type = res.headers["Content-Type"];
      const blob = new Blob([new Uint8Array(res.body.length).map((_, i) => res.body.charCodeAt(i))]);
      const objectUrl = URL.createObjectURL(blob, { type });
      resolve(objectUrl);
    }).catch(error => {
      reject(new Error('Error obteniendo la URL de descarga de la imagen: ' + error.message));
    });
  });
}

async function newGame(appFolderID, accessToken) {
  var gameID;
  return new Promise((resolve, reject) => {
    createFolder("Untitled Game", appFolderID, accessToken)
      .then(function (folderId) {
        gameID = folderId;
        return createEmptyJson(gameID, accessToken);
      })
      .then(function () {
        return createEmptyImage(gameID, accessToken);
      })
      .then(function () {
        return createFolder("images", gameID, accessToken);
      })
      .then(function () {
        return createFolder("sounds", gameID, accessToken);
      })
      .then(function () {
        resolve(gameID);
      })
      .catch(function (error) {
        console.error("Failed to create game:", error);
        reject(error);
      });
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

function playGame(menuItemHTML) {
  var gameID = menuItemHTML.parentNode.getAttribute("gameid");
  var url = "engine/?id=" + gameID;
  if (openWindows[url] && !openWindows[url].closed) openWindows[url].focus();
  else openWindows[url] = window.open(url, "_blank");
  expandContainer.style.display = 'none';
  expandContainerUl.setAttribute('gameid', '');
}

async function duplicateGame(gameID) {

  return new Promise((resolve, reject) => {
    gapi.client.drive.files.get({
      'fileId': gameID,
      'fields': 'name, parents'
    }).then(response => {
      console.log('Game Folder Retrieved');
      const duplicateFolderName = response.result.name + ' - Copy';
      gapi.client.drive.files.create({
        'resource': {
          'name': duplicateFolderName,
          'mimeType': 'application/vnd.google-apps.folder',
          'parents': response.result.parents
        }
      }).then(res => {

        const newDirectoryId = res.result.id;

        copyDirectoryContents(gameID, newDirectoryId, duplicateFolderName).then(() => {
          resolve();
        }).catch(error => {
          reject(new Error('Error copying directory contents: ' + error.message));
        });
      }).catch(error => {
        reject(new Error('Error creating duplicated game folder: ' + error.message));
      });
    }).catch(error => {
      reject(new Error('Error retrieving game folder: ' + error.message));
    });
  });
}

async function deleteGame(gameID, gameName) {
  var result = window.confirm(`Do you want to delete the "${gameName}" game?`);
  if (result) {
    try {
      await gapi.client.drive.files.delete({
        'fileId': gameID
      });
    } catch (error) {
      console.error('Error deleting game:', error.message);
    }
  } else {
    console.log('Option selected: false');
  }
}

async function copyDirectoryContents(sourceDirectoryId, destinationDirectoryId, duplicateFolderName) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await gapi.client.drive.files.list({
        'q': "'" + sourceDirectoryId + "' in parents",
        'fields': 'files(id, name, mimeType)'
      });
      const files = response.result.files;
      const copyFilePromises = files.map(async (file) => {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
          await duplicateSubdirectory(file.id, destinationDirectoryId);
        } else {
          const copyRes = await gapi.client.drive.files.copy({
            'fileId': file.id,
            'parents': [destinationDirectoryId]
          });
          console.log('File Copied: ' + copyRes.result.name);
          if (copyRes.result.name === "game.json") {
            const originalGameJsonId = await getJson(sourceDirectoryId);
            console.log('ID del archivo game.json:', originalGameJsonId);
            await changeNameInJson(copyRes.result.id, originalGameJsonId, duplicateFolderName);
          }
        }
      });
      await Promise.all(copyFilePromises);
      resolve();
    } catch (error) {
      reject(error);
    }
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


function createFolder(folderName, parent, accessToken) {
  console.log("createFolder ", folderName, parent);
  return new Promise(function (resolve, reject) {
    var request = gapi.client.request({
      path: '/drive/v3/files',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken,
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
function createEmptyJson(gameID, accessToken) {
  return new Promise(function (resolve, reject) {
    var request = gapi.client.request({
      path: '/drive/v3/files',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken,
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

function createEmptyImage(gameID, accessToken) {
  return new Promise(function (resolve, reject) {

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
  setDriveAccessToken,
  folderExists,
  createFolder,
  checkDriveFolder,
  listDriveGames,
  newGame,
  editGame,
  playGame,
  deleteGame,
  duplicateGame
};

