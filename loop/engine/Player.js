class Player {

    constructor(game) {
        this.file = new File();
        this.gameId = game.id;
        (editor) ? this.onJsonLoaded(JSON.parse(localStorage.getItem("localStorage_GameData"))) :
            this.file.loadJson(this.gameId, this.onJsonLoaded.bind(this));
    }

    onJsonLoaded(json) {
        this.json = json;
        this.file.loadImages(this.gameId, this.onImagesLoaded.bind(this));
    }

    onImagesLoaded(loader) {
        this.loader = loader;
        this.json.imageList = Object.keys(loader.resources);
        this.file.loadSounds(this.gameId, this.onSoundsLoaded.bind(this));
    }

    onSoundsLoaded(playList) {
        this.playList = playList;
        this.json.soundList = Object.keys(playList);
        new Engine(new Game(this.json));
    }
}