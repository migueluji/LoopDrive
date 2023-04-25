class File {

    loadJson(gameId, callback) {
        gapi.client.drive.files.list({ // find game.json id from the game folder
            'q': `parents in "${gameId}" and name="game.json"`
        }).then(function (res) {
            console.log('Game.json ID:', res.result.files[0].id);
            console.log(res);
            gapi.client.drive.files.get({
                fileId: res.result.files[0].id, // get the game.json file
                alt: 'media'
            }).then(function (res) {
                var json = JSON.parse(res.body);
                callback(json);
            })
        })
    }

    loadImages(gameId, callback) {
        var loader = new PIXI.Loader();
        var counter = 0;
        gapi.client.drive.files.list({ // find the images folder in the game folder
            'q': `parents in "${gameId}" and name="images" and mimeType = "application/vnd.google-apps.folder"`
        }).then(function (res) {
            if (res.result.files.length === 0) {
                console.log("No images folder found.");
                callback(loader);
                return;
            }
            gapi.client.drive.files.list({ // list the images in the image folder
                'q': `parents in "${res.result.files[0].id}"`,
            }).then(function (response) {
                Object.entries(response.result.files).forEach(([key, value]) => { // key is the image name and value.id their id in google drive
                    gapi.client.drive.files.get({
                        fileId: value.id,
                        alt: 'media'
                    }).then(function (res) {
                        var type = res.headers["Content-Type"];
                        var blob = new Blob([new Uint8Array(res.body.length).map((_, i) => res.body.charCodeAt(i))]);
                        const objectUrl = URL.createObjectURL(blob, type);
                        const texture = PIXI.Texture.from(objectUrl);
                        loader.add(value.name, objectUrl);
                        loader.resources[value.name] = { "texture": texture };
                        counter++;
                        if (counter === response.result.files.length) {
                            loader.onLoad.add((loader, resource) => { console.log("Loaded :", resource.name); });
                            loader.onComplete.add(() => { callback(loader) });
                            loader.load();
                        }
                    })
                })
            })
        })
    }


    loadSounds(gameId, callback) {
        var playList = {};
        var counter = 0;
        gapi.client.drive.files.list({ // find the images folder in the game folder
            'q': `parents in "${gameId}" and name="sounds" and mimeType = "application/vnd.google-apps.folder"`
        }).then(function (res) {
            if (res.result.files.length === 0) {
                console.log("No sounds folder found.");
                callback(playList);
                return;
            }
            gapi.client.drive.files.list({ // list the images in the image folder
                'q': `parents in "${res.result.files[0].id}"`,
            }).then(function (response) {
                Object.entries(response.result.files).forEach(([key, value]) => {
                    gapi.client.drive.files.get({
                        fileId: value.id,
                        alt: 'media'
                    }).then(function (res) {
                        var type = res.headers["Content-Type"];
                        var blob = new Blob([new Uint8Array(res.body.length).map((_, i) => res.body.charCodeAt(i))]);
                        var objectUrl = URL.createObjectURL(blob, type);
                        playList[value.name] = new Howl({
                            src: [objectUrl],
                            format: type.split("/")[1],
                            onload: function () {
                                counter++;
                                console.log("Loaded : " + value.name);
                                if (counter == response.result.files.length) {
                                    callback(playList);
                                }
                            }
                        });
                    });
                });
            })
        })
    }

    static save(gameId, json) {
        gapi.client.drive.files.list({
            'q': `parents in "${gameId}" and name="game.json"`
        }).then(function (response) {
            if (response.result.files.length > 0) {
                var fileId = response.result.files[0].id;
                gapi.client.request({
                    path: `/upload/drive/v3/files/${fileId}`,
                    method: 'PATCH',
                    params: {
                        uploadType: 'media'
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: json
                }).then(function (response) {
                    console.log('File updated: ' + response.result.name);
                }).catch(function (error) {
                    console.error('Error updating file: ' + error.message);
                });
            } else {
                console.log('No files found.');
            }
        }).catch(function (error) {
            console.error('Error listing files: ' + error.message);
        });
    }


    static uploadFile(file, formData, type) {
        var destination;
        switch (true) {
            case (type == "Image") || (type == "Animation"): destination = "images"; break;
            case (type == "Sound"): destination = "sounds"; break;
            case (type == "ScreenShoot"): destination = ""; break;
        }
        var url = serverGamesFolder + "/uploadFile.php?gameFolder=" + gameFolder + "&assetFolder=" + destination;
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.type = type;
        xhr.fileName = file.name;
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) { if (destination != "") Command.addAssetCmd(this.fileName, this.type); }
                else if (xhr.status == 404) alert("DEMO VERSION - It was not possible to upload asset files");
                else alert("Server Error! " + xhr.responseText);
            }
        }
        xhr.send(formData);
    }

    static deleteFile(gameFolder, assetID, fileName, type) {
        var assetFolder = "";
        if (type == "Image" || type == "Animation") assetFolder = "images";
        else if (type == "Sound") assetFolder = "sounds";
        var url = serverGamesFolder + "/deleteAsset.php?gameFolder=" + gameFolder + "&assetFolder=" + assetFolder + "&filename=" + fileName;
        var xhr = new XMLHttpRequest();
        xhr.assetID = assetID;
        xhr.fileName = fileName;
        xhr.type = type;
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4)
                if (xhr.status == 200) Command.removeAssetCmd(assetID, type);
                else if (xhr.status == 404) alert("DEMO VERSION - It was not possible to delete asset files");
                else alert("Server Error! " + xhr.responseText);
        }
        xhr.send();
    }
}