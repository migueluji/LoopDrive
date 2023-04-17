class Player {

    constructor() {
        this.file = new File();
        (editor) ? this.onJsonLoaded(JSON.parse(localStorage.getItem("localStorage_GameData")) ): 
             this.file.loadJson(gameId, this) ;
    }

    onJsonLoaded(json) { // when json is loaded then load assets
        console.log(json);
        this.json = json;
        this.file.loadImages(this);
    }

    onImagesLoaded(){
      //  this.file.loadSounds(this);
        this.onAssetLoaded();
    }

    onSoundsLoaded(){
        this.onAssetLoaded();
    }

    onAssetLoaded() {
        new Engine(new Game(this.json));
    }
}