class Player {

    constructor(game) {
        this.file = new File();
        this.loader = new PIXI.Loader();
        this.playList = {};
        this.gameId = game.id;
        this.json = {};
        (editor) ? this.onJsonLoaded(JSON.parse(localStorage.getItem("localStorage_GameData"))) :
            this.file.loadJson(this.gameId, this.onJsonLoaded.bind(this));
    }

    onJsonLoaded(json) {
        this.json = json;
        this.file.loadImages(this.gameId, this.loader,this.onImagesLoaded.bind(this));
    }

    onImagesLoaded() {
        this.json.imageList = Object.keys(this.loader.resources);
        this.file.loadSounds(this.gameId, this.playList, this.onSoundsLoaded.bind(this));
    }

    onSoundsLoaded(playList) {
        this.json.soundList = Object.keys(playList);
        new Engine(new Game(this.json));
    }
}