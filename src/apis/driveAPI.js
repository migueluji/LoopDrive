// /apis/driverAPI.js
/* global gapi */

async function folderExists(folderName, token) {
  try {
    const response = await gapi.client.drive.files.list({
      q: `name='${folderName}' and trashed=false`,
      fields: 'files(id)',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (response.result.files && response.result.files.length > 0) {
      return response.result.files[0].id;
    } else {
      return undefined;
    }
  } catch (error) {
    console.error('Error checking folder existence:', error.message);
    throw error;
  }
}

async function createFolder(folderName, parent, token) {
  try {
    const requestBody = {
      'name': folderName,
      'mimeType': 'application/vnd.google-apps.folder',
      'parents': [parent],
    };
    const response = await gapi.client.request({
      path: '/drive/v3/files',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(requestBody)
    });
    const createdFolderId = response.result?.id;
    if (createdFolderId) {
      return createdFolderId;
    } else {
      throw new Error('Failed to create folder: No ID returned');
    }
  } catch (error) {
    console.error('Error creating folder:', error.message || error);
    throw error;
  }
}

async function listDriveGames(appFolderID, token) {
  if (!appFolderID) return [];
  const files = [];
  let nextPageToken = null;
  try {
    do {
      const response = await gapi.client.drive.files.list({
        q: `parents in "${appFolderID}"`,
        fields: 'nextPageToken, files(id, name)',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        pageToken: nextPageToken,
      });
      const gameFiles = response.result.files;
      if (gameFiles && gameFiles.length > 0) {
        const imagePromises = gameFiles.map(async (file) => {
          file.imageUrl = await getImageDownloadUrl(file.id);
        });

        await Promise.all(imagePromises);
        files.push(...gameFiles);
      }
      nextPageToken = response.result.nextPageToken;
    } while (nextPageToken);
    return files;
  } catch (error) {
    console.error('Error listing Google Drive games:', error.message);
    throw error;
  }
}

async function getImageDownloadUrl(gameFolderID) {
  try {
    const listResponse = await gapi.client.drive.files.list({
      'q': `name='image.jpg' and '${gameFolderID}' in parents`,
      'fields': 'files(id)',
    });
    const imageFiles = listResponse.result.files;
    if (!imageFiles || imageFiles.length === 0) {
      throw new Error('No se encontró el archivo de imagen en el directorio del juego.');
    }
    const imageFileId = imageFiles[0].id;
    const getResponse = await gapi.client.drive.files.get({
      'fileId': imageFileId,
      'alt': 'media',
    });
    const type = "image/jpeg";
    const blob = new Blob([new Uint8Array(getResponse.body.length).map((_, i) => getResponse.body.charCodeAt(i))], { type });
    const objectUrl = URL.createObjectURL(blob);
    return objectUrl;
  } catch (error) {
    console.error('Error obteniendo la URL de descarga de la imagen:', error.message);
    throw error;
  }
}

async function newGame(appFolderID, token) {
  try {
    const folderId = await createFolder("Untitled Game", appFolderID, token);
    await Promise.all([
      createFolder("images", folderId, token),
      createFolder("sounds", folderId, token),
      createEmptyJson(folderId, token),
      createEmptyImage(folderId, token)
    ]);
    return { id: folderId, name: "Untitled Game", imageUrl: "" };
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
  try {
    await gapi.client.drive.files.delete({
      'fileId': gameID
    });
  } catch (error) {
    console.error('Error deleting game:', error.message);
  }
}

async function copyDirectory(sourceDirectoryID, parentDirectoryID = null) {
  try {
    const sourceDirInfo = await gapi.client.drive.files.get({
      fileId: sourceDirectoryID,
      fields: 'name, parents'
    });
    let newDirName = !parentDirectoryID ? `${sourceDirInfo.result.name} - Copy` : sourceDirInfo.result.name;
    const newDirRes = await gapi.client.drive.files.create({
      resource: {
        name: newDirName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentDirectoryID || sourceDirInfo.result.parents[0]]
      }
    });
    const newDirectoryID = newDirRes.result.id;
    console.log(`Directory created: ${newDirName}`);
    await copyContents(sourceDirectoryID, newDirectoryID, newDirName);
  } catch (error) {
    console.error('Error during directory copy:', error.message);
    throw error;
  }
}

async function copyContents(sourceDirectoryID, newDirectoryID, newDirName) {
  try {
    const files = await gapi.client.drive.files.list({
      q: `'${sourceDirectoryID}' in parents`,
      fields: 'files(id, name, mimeType)'
    });
    const blockSize = 50;
    const fileGroups = [];
    for (let i = 0; i < files.result.files.length; i += blockSize) {
      fileGroups.push(files.result.files.slice(i, i + blockSize));
    }
    for (const group of fileGroups) {
      const copyPromises = [];
    for (const file of group) {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
          await copyDirectory(file.id, newDirectoryID);
        } else {
          const copyPromise = gapi.client.drive.files.copy({
            fileId: file.id,
            parents: [newDirectoryID]
          }).then(copyRes => {
            console.log(`File copied: ${file.name}`);
            if (file.name === "game.json") {
              return changeNameInJson(copyRes.result.id, newDirName);
            }
          }).catch(error => {
            console.error(`Error copying file ${file.name}:`, error);
            throw new Error(`Error copying file ${file.name}: ${error.message || error}`);
          });
          copyPromises.push(copyPromise);
        }
      }
      await Promise.all(copyPromises);
    }
  } catch (error) {
    console.error('Error copying directory contents:', error.message);
    throw error;
  }
}

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
  try {
    const response = await gapi.client.drive.files.create({
      resource: {
        name: 'game.json',
        mimeType: 'application/json',
        parents: [gameID],
      },
      fields: 'id'
    });
    if (response && response.result && response.result.id) {
      return response.result.id;
    } else {
      throw new Error('Failed to create JSON file: No ID returned.');
    }
  } catch (error) {
    console.error('Failed to create JSON file:', error.message || error);
    throw error;
  }
}

async function createEmptyImage(gameID, token) {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff'; // Color blanco.
    context.fillRect(0, 0, 1, 1);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg'));

    const base64Data = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(blob);
    });
    const boundary = '-------314159265358979323846';
    const multipartRequestBody =
      `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      JSON.stringify({ name: 'image.jpg', parents: [gameID], mimeType: 'image/jpeg' }) +
      `\r\n--${boundary}\r\n` +
      `Content-Type: image/jpeg\r\n` +
      `Content-Transfer-Encoding: base64\r\n\r\n` +
      base64Data +
      `\r\n--${boundary}--`;
    const response = await gapi.client.request({
      path: '/upload/drive/v3/files',
      method: 'POST',
      params: { uploadType: 'multipart' },
      headers: {
        'Content-Type': `multipart/related; boundary="${boundary}"`,
        'Authorization': `Bearer ${token}`,
      },
      body: multipartRequestBody,
    });
    if (response.result.id) {
      return response.result.id;
    } else {
      throw new Error('Failed to create image file: No ID returned.');
    }
  } catch (error) {
    console.error('Failed to create image file:', error.message || error);
    throw error;
  }
}

export {
  folderExists,
  createFolder,
  listDriveGames,
  newGame,
  deleteGame,
  duplicateGame
};

