class App {
    constructor(){		
        this.file = new File();
        this.load = new LoadingView("var(--mdc-theme-primary)");
        document.body.appendChild(this.load.html);
       // this.file.loadJson(serverGamesFolder+"/loadJson.php?gameFolder="+gameFolder,this);
       console.log("loading...", gameName);
       this.file.loadJson(gameId,this)
    }
    
    onJsonLoaded(json){
        this.json=json;
      //  console.log(json);
     //  this.file.loadImages(gameId,json,this);
        this.onAssetLoaded();
    }

    onImagesLoaded(){
        this.onAssetLoaded();
    }

    onAssetLoaded(){
        var editor = new Editor(new EditorView(),new Game(this.json));
        new CmdManager(editor);
        document.body.appendChild(editor.view.html);
        this.load.closeDialog();
    }
}