class Player {

    constructor(game) {
        this.gameId = game.id;
        this.file = new File();
        //     (editor) ? this.onJsonLoaded(JSON.parse(localStorage.getItem("localStorage_GameData"))) :
        this.file.loadJson(this.gameId, this);
    }

    onJsonLoaded(json) { // when json is loaded then load assets
        this.json = json;
        this.file.loadImages(this.gameId,this);
    }

    onImagesLoaded() {
       // this.file.loadSounds(this);
        this.onAssetLoaded();
    }

    onSoundsLoaded() {
        this.onAssetLoaded();
    }

    onAssetLoaded() {
        new Engine(new Game(this.json));
    }
}