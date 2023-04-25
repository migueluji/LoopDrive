class App {
    constructor(game) {
        this.file = new File();
        this.gameId = game.id;
        this.load = new LoadingView("var(--mdc-theme-primary)");
        document.body.appendChild(this.load.html);
        this.file.loadJson(this.gameId, this.onJsonLoaded.bind(this));
    }

    onJsonLoaded(json) {
        this.json = json;
        this.file.loadImages(this.gameId, this.onImagesLoaded.bind(this));
    }

    onImagesLoaded(loader) {
        this.loader = loader;
        this.json.imageList = Object.keys(loader.resources);
        var editor = new Editor(new EditorView(), new Game(this.json));
        new CmdManager(editor);
        document.body.appendChild(editor.view.html);
        this.load.closeDialog();
    }
}