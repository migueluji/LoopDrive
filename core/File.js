class File {

    loadJson(URL, app) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState == this.DONE && this.status == 200) {
                var json = JSON.parse(this.responseText);
                app.onJsonLoaded(json);
            }
        }
        xhr.open("GET", URL, true);
        xhr.send();
    }

    loadImages(URL, json, app) {
        this.loader = new PIXI.Loader(URL + "/images");
        if (json.imageList) this.loader.add(json.imageList);
        else this.loader.add("Loader", "../../../editor/images/loop.png");// trick to initialize the loader when there is not /image folder
        this.loader.onLoad.add((loader, resource) => {
            console.log(resource.name, " loaded");
        });
        this.loader.load(() => {
            console.log("Loaded images!");
            if (app.file.loader.resources.hasOwnProperty("Loader")) {
                app.file.loader.resources["Loader"].texture.destroy(true);
                delete app.file.loader.resources["Loader"];
            }
            app.onImagesLoaded();
        });
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