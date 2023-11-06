self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'storeToken') {
    const token = event.data.token;
    
    // Almacenar el token en localStorage
    localStorage.setItem("token", JSON.stringify(token));
    const tokenExpiration = new Date().getTime() + (token.expires_in * 1000);
    localStorage.setItem('tokenExpiration', tokenExpiration);
  }
});