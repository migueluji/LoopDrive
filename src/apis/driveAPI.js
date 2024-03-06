
// /apis/driverAPI.js
/* global gapi */

async function folderExists(folderName, token) {
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

async function createFolder(folderName, parent, token) {
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
  try {
    const folderId = await createFolder("Untitled Game", appFolderID, token);
    await createFolder("images", folderId, token);
    await createFolder("sounds", folderId, token);
    await createEmptyJson(folderId, token);
    await createEmptyImage(folderId, token);
    const gameData = {
      id: folderId,
      name: "Untitled Game",
      imageUrl: ""
    };
    return gameData;
  } catch (error) {
    console.error("Failed to create game:", error);
    throw error;
  }
}

async function duplicateGame(gameID) {
  try {
    await copyDirectory(gameID);
    console.log('Game duplication completed. New Game ID:');
  } catch (error) {
    console.error('Error during game duplication:', error.message);
    throw error;
  }
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

async function copyDirectory(sourceDirectoryID, parentDirectoryID = null) {
  try {
    // Obtiene información del directorio fuente.
    const sourceDirInfo = await gapi.client.drive.files.get({
      fileId: sourceDirectoryID,
      fields: 'name, parents'
    });

    // Determina el nombre del nuevo directorio.
    let newDirName = !parentDirectoryID ? `${sourceDirInfo.result.name} - Copy` : sourceDirInfo.result.name;

    // Crea el nuevo directorio.
    const newDirRes = await gapi.client.drive.files.create({
      resource: {
        name: newDirName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentDirectoryID || sourceDirInfo.result.parents[0]]
      }
    });
    const newDirectoryID = newDirRes.result.id;
    console.log(`Directory created: ${newDirName}`);

    // Copia los contenidos del directorio fuente al nuevo directorio.
    await copyContents(sourceDirectoryID, newDirectoryID, newDirName);

  } catch (error) {
    console.error('Error during directory copy:', error.message);
    throw error;
  }
}

async function copyContents(sourceDirectoryID, newDirectoryID, newDirName) {
  const files = await gapi.client.drive.files.list({
    q: `'${sourceDirectoryID}' in parents`,
    fields: 'files(id, name, mimeType)'
  });

  for (const file of files.result.files) {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      // Llama a copyDirectory recursivamente para subdirectorios.
      await copyDirectory(file.id, newDirectoryID, false);
    } else {
      // Copia el archivo al nuevo directorio.
      const copyRes = await gapi.client.drive.files.copy({
        fileId: file.id,
        parents: [newDirectoryID]
      });
      console.log(`File copied: ${file.name}`);

      // Caso especial para modificar "game.json".
      if (file.name === "game.json") {
        await changeNameInJson(copyRes.result.id, newDirName);
      }
    }
  }
}


// async function copyDirectory(sourceDirectoryID, parentDirectoryID = null) {
//   try {
//     // Obtiene el nombre del directorio de origen.
//     const sourceDir = await gapi.client.drive.files.get({
//       fileId: sourceDirectoryID,
//       fields: 'name, parents'
//     });
//     let newDirName;
//     // Determina si es el directorio raíz basado en parentDirectoryID.
//     if (parentDirectoryID === null) {
//       // Es el directorio principal, así que añade " - Copy" al nombre.
//       newDirName = `${sourceDir.result.name} - Copy`;
//       parentDirectoryID = sourceDir.result.parents[0]; // Usa el padre del directorio original para el nuevo directorio.
//     } else {
//       // Es un subdirectorio, así que usa el mismo nombre.
//       newDirName = sourceDir.result.name;
//     }
//     // Crea el nuevo directorio destino con " - Copy" añadido al nombre.
//     const newDirRes = await gapi.client.drive.files.create({
//       resource: {
//         name: newDirName,
//         mimeType: 'application/vnd.google-apps.folder',
//         parents: [parentDirectoryID]
//       }
//     });
//     console.log(`New directory created: ${newDirName}`);
//     const newDirectoryID = newDirRes.result.id;
//     // Lista todos los contenidos del directorio de origen.
//     const files = await gapi.client.drive.files.list({
//       q: `'${sourceDirectoryID}' in parents`,
//       fields: 'files(id, name, mimeType)'
//     });
//     // Itera sobre los contenidos para copiarlos al nuevo directorio.
//     for (const file of files.result.files) {
//       if (file.mimeType === 'application/vnd.google-apps.folder') {
//         // Si es un directorio, llama a copyDirectory recursivamente.
//         await copyDirectory(file.id, newDirectoryID);
//       } else {
//         // Si es un archivo, lo copia directamente al nuevo directorio.
//         const copyRes = await gapi.client.drive.files.copy({
//           fileId: file.id,
//           parents: [newDirectoryID]
//         });
//         console.log(`File copied: ${file.name}`);
//         if (file.name === "game.json") {
//           // Actualiza el nombre dentro de game.json después de copiarlo.
//           await changeNameInJson(copyRes.result.id, newDirName);
//         }
//       }
//     }
//   } catch (error) {
//     console.error('Error during directory copying:', error.message);
//     throw error;
//   }
// }

async function changeNameInJson(fileId, newName) {
  try {
    const res = await gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media'
    });
    let gameJsonContent;
    if (res.body) gameJsonContent = JSON.parse(res.body);
    else throw new Error('game.json content could not be retrieved.');
    gameJsonContent.name = newName; // Asume que 'name' es la propiedad a cambiar.
    const updatedJsonString = JSON.stringify(gameJsonContent);
    await gapi.client.request({
      path: `/upload/drive/v3/files/${fileId}`,
      method: 'PATCH',
      params: { uploadType: 'media' },
      headers: { 'Content-Type': 'application/json' },
      body: updatedJsonString
    });
    console.log('game.json updated with new name:', newName);
  } catch (error) {
    console.error('Error updating game.json:', error.message);
    throw error;
  }
}

async function createEmptyJson(gameID, token) {
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

async function createEmptyImage(gameID, token) {
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
  getImageDownloadUrl,
  newGame,
  deleteGame,
  duplicateGame
};

