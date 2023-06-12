class Auth {
    constructor(clientId, apiKey) {
      this.CLIENT_ID = clientId;
      this.API_KEY = apiKey;
      this.DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
      this.SCOPES = 'https://www.googleapis.com/auth/drive';
      this.tokenClient = null;
      this.gapiInited = false;
      this.gisInited = false;
      this.user = null;
      this.tokenExpiration = null;
    }
  
    init(callback) {
      gapi.load('client', () => {
        gapi.client.init({
          apiKey: this.API_KEY,
          discoveryDocs: this.DISCOVERY_DOCS
        }).then(() => {
          this.gapiInited = true;
          this.initTokenClient();
          callback();
        });
      });
    }
  
    initTokenClient() {
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: this.CLIENT_ID,
        scope: this.SCOPES,
        prompt: ''
      });
      this.gisInited = true;
    }
  
    authenticate(callback) {
      if (!this.gapiInited || !this.gisInited) {
        throw new Error('Google Drive client and token client are not initialized.');
      }
  
      this.signIn().then(() => {
        this.tokenExpiration = new Date().getTime() + (this.tokenClient.expires_in * 1000);
        this.startTokenExpirationCheck();
        callback(null);
      }).catch(error => {
        callback(new Error('Failed to authenticate with Google Drive: ' + error.message));
      });
    }
  
    signIn() {
      return new Promise((resolve, reject) => {
        this.tokenClient.callback = (token) => {
          localStorage.setItem("token", JSON.stringify(token));
          resolve();
        };
        this.tokenClient.requestAccessToken({ prompt: '' });
      });
    }
  
    startTokenExpirationCheck() {
      setInterval(() => {
        const now = new Date().getTime();
        const timeRemaining = Math.floor((this.tokenExpiration - now) / 1000);
        if (timeRemaining < 0) {
          this.handleTokenExpiration();
        }
      }, 1000);
    }
  
    handleTokenExpiration() {
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiration');
      this.authenticate();
    }
  }
  
  