class App {
    constructor(game) {
        this.file = new File();
        this.gameId = game.id;
        this.load = new LoadingView("var(--mdc-theme-primary)");
        document.body.appendChild(this.load.html);
        if (game.id) this.file.loadJson(this.gameId, this.onJsonLoaded.bind(this));
        else {
            this.json = {};
            this.launchEditor()
        }
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
        this.launchEditor();
    }

    launchEditor() {
        var editor = new Editor(new EditorView(), new Game(this.json));
        new CmdManager(editor);
        document.body.appendChild(editor.view.html);
        this.load.closeDialog();
    }
}