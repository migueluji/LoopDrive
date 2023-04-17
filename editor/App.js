class App {
    constructor() {
        this.file = new File();
        this.load = new LoadingView("var(--mdc-theme-primary)");
        document.body.appendChild(this.load.html);
        this.file.loadJson(gameId, this)
    }

    onJsonLoaded(json) {
        this.json = json;
        this.file.loadImages(this);
    }

    onImagesLoaded() {
        this.onAssetLoaded();
    }

    onAssetLoaded() {
        var editor = new Editor(new EditorView(), new Game(this.json));
        new CmdManager(editor);
        document.body.appendChild(editor.view.html);
        this.load.closeDialog();
    }
}