class App {
    constructor(game) {
        this.file = new File();
        this.gameId = game.id;
        this.loaded = false;
        this.load = new LoadingView("var(--mdc-theme-primary)");
        document.body.appendChild(this.load.html);
        this.file.loadJson(this.gameId, this.onJsonLoaded.bind(this));
    }

    onJsonLoaded(json) {
        console.log("json", json);
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
        console.log(this.json.name);
        var editor = new Editor(new EditorView(), new Game(this.json));
        new CmdManager(editor);
        this.loaded = true;
        document.body.appendChild(editor.view.html);
        this.load.closeDialog();
    }
}