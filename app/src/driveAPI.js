
//driverAPI.js
/* global gapi */

let accessToken;
var openWindows = {};
var appFolderID;
var expandContainer = document.querySelector('.expand-container');
var expandContainerUl = document.querySelector('.expand-container ul');

function setDriveAccessToken(token) {
  accessToken = token;
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
            // Puedes manejar el error de alguna manera si lo deseas
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
      'fields': 'files(id, webContentLink)',
    }).then(response => {
      const files = response.result.files;
      if (files && files.length > 0) {
        const imageFile = files[0];
        resolve(imageFile.webContentLink);
      } else {
        reject(new Error('No se encontró el archivo de imagen en el directorio del juego.'));
      }
    }).catch(error => {
      reject(new Error('Error obteniendo la URL de descarga de la imagen: ' + error.message));
    });
  });
}



// function expand(v) {
//   var click_position = v.getBoundingClientRect();
//   if (expandContainer.style.display === 'block') {
//     expandContainer.style.display = 'none';
//     expandContainerUl.setAttribute('data-id', '');
//   } else {
//     expandContainer.style.display = 'block';
//     expandContainer.style.left = (click_position.left + window.scrollX) - 120 + 'px';
//     expandContainer.style.top = (click_position.top + window.scrollY) + 25 + 'px';
//     expandContainerUl.setAttribute('gameid', v.getAttribute('gameid'));
//   }
// }

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

// function deleteMenu(event) {
//   if (!(event.target.tagName === 'svg' || event.target.tagName === 'path') && event.target !== expandContainer) {
//     expandContainer.style.display = 'none';
//     expandContainerUl.setAttribute('gameid', '');
//   }
// }

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
          if (copyRes.name === "game.json") {
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
function createEmptyJson(gameID) {
  return new Promise(function (resolve, reject) {
    var request = gapi.client.request({
      path: '/drive/v3/files',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("token")).accessToken,
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
  checkDriveFolder,
  listDriveGames,
  newGame,
  editGame,
  playGame,
  deleteGame,
  duplicateGame
};

