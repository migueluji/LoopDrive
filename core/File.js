class File {

    loadJson(gameId, callback) {
        gapi.client.drive.files.list({ // find game.json id from the game folder
            'q': `parents in "${gameId}" and name="game.json"`
        }).then(function (res) {
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
                        loader.resources[value.name] = { "texture": texture, "fileId": value.id };
                        counter++;
                        loader.init = true;
                        if (counter === response.result.files.length) {
                            loader.onLoad.add((loader, resource) => {
                                console.log("Loaded :", resource.name);
                                if (!loader.init) Command.addAssetCmd(resource.name, "Image");
                            });
                            loader.onComplete.once(() => { callback(loader) });
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
                                if (counter == response.result.files.length) { callback(playList) }
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
        }).then(function (response) { // return game.json file for this gameId
            if (response.result.files.length > 0) {
                var fileId = response.result.files[0].id; // the game.json id
                gapi.client.request({
                    path: `/upload/drive/v3/files/${fileId}`,
                    method: 'PATCH', // update the game.json content
                    body: json
                }).then(() => {
                    Command.takeScreenshot();
                    alert('Game saved!!!')
                })
            }
        })
    }

    static delete(fileId, assetID, fileName, type) {
        if (type == "Image" || type == "Animation") {
            app.loader.resources[fileName].texture.destroy(true);
            delete app.loader.resources[fileName];
            type = "Image";
        }
        gapi.client.drive.files.delete({
            fileId: fileId
        }).then(() => Command.removeAssetCmd(assetID, type))
    }

    static upload(gameId, file, type) {
        var folder;
        switch (type) {
            case "Image": folder = "images"; break;
            case "Animation": folder = "images"; break;
            case "Sound": folder = "sounds"; break;
            case "ScreenShoot": folder = ""; break;
        }
        gapi.client.drive.files.list({
            'q': `parents in "${gameId}" and name="${folder}"`
        }).then(function (response) {
            if (response.result.files.length > 0) {
                var metadata = {
                    'name': file.name,
                    'parents': [response.result.files[0].id]
                };
                var boundary = '-------314159265358979323846';
                var delimiter = "\r\n--" + boundary + "\r\n";
                var close_delim = "\r\n--" + boundary + "--";

                var reader = new FileReader();
                reader.readAsBinaryString(file);
                reader.onload = function (e) {
                    var contentType = file.type || 'application/octet-stream';
                    var base64Data = btoa(reader.result);
                    var multipartRequestBody =
                        delimiter + 'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata) +
                        delimiter + 'Content-Type: ' + contentType + '\r\n' + 'Content-Transfer-Encoding: base64\r\n' +
                        '\r\n' + base64Data + close_delim;

                    gapi.client.request({
                        'path': '/upload/drive/v3/files',
                        'method': 'POST',
                        'params': { 'uploadType': 'multipart' },
                        'headers': { 'Content-Type': 'multipart/related; boundary="' + boundary + '"', },
                        'body': multipartRequestBody
                    }).then(function (response) {
                        gapi.client.drive.files.get({ // download from drive 
                            fileId: response.result.id,
                            alt: 'media'
                        }).then(function (res) {
                            var contentType = res.headers["Content-Type"];
                            var blob = new Blob([new Uint8Array(res.body.length).map((_, i) => res.body.charCodeAt(i))]);
                            const objectUrl = URL.createObjectURL(blob, contentType);
                            if (type == "Image" || type == "Animation") {
                                const texture = PIXI.Texture.from(objectUrl);
                                while (app.loader.loading) { };
                                app.loader.add(file.name, objectUrl);
                                app.loader.resources[file.name] = { "texture": texture, "fileId": response.result.id };
                                app.loader.init = false;
                                app.loader.load();
                            }
                            else if (type == "Sound") {
                                app.playList[file.name] = new Howl({
                                    src: [objectUrl],
                                    format: contentType.split("/")[1],
                                    onload: function () {
                                        console.log("Loaded : " + file.name);
                                        Command.addAssetCmd(file.name, "Sound");
                                    }
                                });
                            }
                        });
                    })
                }
            }
        })
    }

    static uploadScreenShoot(gameId, blob) {
        gapi.client.drive.files.list({
            'q': `parents in "${gameId}" and name="image.png"`
        }).then(function (response) {
            if (response.result.files.length > 0) {
                var fileId = response.result.files[0].id;
                var metadata = {
                    "name": "image.png",
                    'mimeType': 'image/png',
                    'parents': gameId
                };
                var boundary = '-------314159265358979323846';
                var delimiter = "\r\n--" + boundary + "\r\n";
                var close_delim = "\r\n--" + boundary + "--";

                var reader = new FileReader();
                reader.readAsBinaryString(blob);
                reader.onload = function () {
                    var contentType = blob.type;
                    var base64Data = btoa(reader.result);
                    var multipartRequestBody =
                        delimiter + 'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata) +
                        delimiter + 'Content-Type: ' + contentType + '\r\n' + 'Content-Transfer-Encoding: base64\r\n' +
                        '\r\n' + base64Data + close_delim;

                    gapi.client.request({
                        'path': '/upload/drive/v3/files/' + fileId,
                        'method': 'PATCH',
                        'params': { 'uploadType': 'multipart' },
                        'headers': { 'Content-Type': 'multipart/related; boundary="' + boundary + '"' },
                        'body': multipartRequestBody
                    }).then(function (response) {
                        console.log("Screenshoot updated", response);
                    });
                }
            }
        });
    }
}


