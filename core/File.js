class File {

    constructor() {
        this.imageList = {}; this.soundList = {}; this.loader = new PIXI.Loader();
    }

    loadJson(gameId, app) {
        gapi.client.drive.files.list({ // find game.json id from the game folder
            'q': `parents in "${gameId}" and name="game.json"`
        }).then(function (res) {
            gapi.client.drive.files.get({
                fileId: res.result.files[0].id, // get the game.json file
                alt: 'media'
            }).then(function (res) {
                var json = JSON.parse(res.body);
                gapi.client.drive.files.list({ // find the image folder in the game folder
                    'q': `parents in "${gameId}" and name="images" and mimeType = "application/vnd.google-apps.folder"`
                }).then(function (res) {
                    gapi.client.drive.files.list({ // list the images in the image folder
                        'q': `parents in "${res.result.files[0].id}"`,
                    }).then(function (res) {
                        var files = res.result.files;
                        if (files && files.length > 0) {
                            files.forEach((file) => {
                                app.file.imageList[file.name] = file.id;
                            })
                            json.imageList = Object.keys(app.file.imageList);
                            app.onJsonLoaded(json);
                        }
                    })
                })
            })
        })
    }
    loadImages(app) {
        Object.keys(app.file.imageList).forEach((image, i) => {
            var imageId = app.file.imageList[image];
            gapi.client.drive.files.get({
                fileId: imageId,
                alt: 'media'
            }).then(function (response) {
                var blob = new Blob([new Uint8Array(response.body.length).map((_, i) => response.body.charCodeAt(i))]);
                const objectUrl = URL.createObjectURL(blob, { type: response.headers["Content-Type"] });
                const texture = PIXI.Texture.from(objectUrl);
                app.file.loader.resources[image] = { "texture": texture };
                console.log("loading... ", image);
                if (Object.keys(app.file.loader.resources).length == Object.keys(app.file.imageList).length &&
                    async function f() { return texture.baseTexture.hasLoaded }) {
                    app.file.loader.onComplete.add(() => {
                        console.log('All textures loaded!');
                        for (var name in app.file.loader.resources) {
                            var texture = app.file.loader.resources[name].texture;
                            if (texture.baseTexture.hasLoaded && texture.baseTexture.imageUrl) {
                                URL.revokeObjectURL(texture.baseTexture.imageUrl);
                            }
                        }
                        app.onImagesLoaded();
                    });
                    app.file.loader.load();
                };
            });
        })
    }

    loadSounds(URL, json, app) {
        this.playList = {};
        this.soundCount = json.soundList.length;
        if (this.soundCount == 0) app.onSoundsLoaded(); // no sounds return to app
        else json.soundList.forEach(sound => {
            this.playList[sound.name] = new Howl({
                src: [URL + "/sounds/" + sound.name],
                format: sound.name.split(".")[1],
                onload: this.onLoadSound.bind(this, sound, app), // wait to load a sound
            })
        })
    }

    onLoadSound(sound, app) {
        this.soundCount--;
        console.log(sound.name, " loaded");
        if (!this.soundCount) {
            console.log("Loaded sounds!");
            app.onSoundsLoaded(); // after load sounds return to app
        }
    }

    static save(json) {
        var url = serverGamesFolder + "/saveJson.php?gameId=" + gameId + "&gameFolder=" + gameFolder;
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-type", "application/json");
        var upload = false;
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    alert(xhr.responseText);
                    Command.takeScreenshot();
                }
                else if (xhr.status == 404) alert("DEMO VERSION - The Game cannot be saved")
                else alert("Server Error! " + xhr.responseText);
                return upload;
            }
        }
        xhr.send(json);
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