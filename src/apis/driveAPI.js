
// /apis/driverAPI.js
/* global gapi */

function folderExists(folderName, token) {
  return new Promise((resolve, reject) => {
    gapi.client.drive.files.list({
      q: `name='${folderName}' and trashed=false`,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
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

function createFolder(folderName, parent, token) {
  return new Promise(function (resolve, reject) {
    var request = gapi.client.request({
      path: '/drive/v3/files',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
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

async function listDriveGames(appFolderID, token) {
  return new Promise(async (resolve, reject) => {
    if (!appFolderID) {
      resolve([]); // No hay carpeta de aplicaciones, por lo que no hay juegos que listar
      return;
    }
    const files = [];
    let pageToken = null;
    do {
      try {
        const response = await gapi.client.drive.files.list({
          q: `parents in "${appFolderID}"`,
          fields: 'nextPageToken, files(id, name)',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          pageToken: pageToken,
        });
        const gameFiles = response.result.files;
        // Recopilar todas las solicitudes de imágenes en un array
        const imageRequests = gameFiles.map(async (file) => {
          file.imageUrl = await getImageDownloadUrl(file.id);
          return file;
        });
        // Esperar a que todas las imágenes se carguen en paralelo
        const gameFilesWithImages = await Promise.all(imageRequests);
        // Agregar los archivos a la lista
        files.push(...gameFilesWithImages);
        // Actualizar el token de página para la siguiente página (si la hay)
        pageToken = response.result.nextPageToken;
      } catch (error) {
        reject(new Error('Error al listar los juegos de Google Drive: ' + error.message));
        return;
      }
    } while (pageToken);
    resolve(files);
  });
}

function getImageDownloadUrl(gameFolderID) {
  return new Promise((resolve, reject) => {
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

async function newGame(appFolderID, token) {
  var gameID;
  return new Promise((resolve, reject) => {
    createFolder("Untitled Game", appFolderID, token)
      .then(function (folderId) {
        gameID = folderId;
        return createEmptyJson(gameID, token);
      })
      .then(function () {
        return createEmptyImage(gameID, token);
      })
      .then(function () {
        return createFolder("images", gameID, token);
      })
      .then(function () {
        return createFolder("sounds", gameID, token);
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

function createEmptyJson(gameID, token) {
  return new Promise(function (resolve, reject) {
    var request = gapi.client.request({
      path: '/drive/v3/files',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
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

function createEmptyImage(gameID, token) {
  return new Promise(function (resolve, reject) {
    var metadata = {
      'name': 'image.jpg',
      'parents': [gameID]
    };
    // Create a blank image of 1x1 pixels
    var canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    var context = canvas.getContext('2d');
    context.fillStyle = '#ffffff'; // White color
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
            'Authorization': 'Bearer ' + token
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
  folderExists,
  createFolder,
  listDriveGames,
  newGame,
  deleteGame,
  duplicateGame
};

