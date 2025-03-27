const SCOPES = 'https://www.googleapis.com/auth/calendar';

export const signIn = (callback, clientId) => {
    window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: (response) => {
            if (response.error) {
                console.error("Google Sign-In error:", response);
                return;
            }
            callback(response.access_token);
        }
    }).requestAccessToken();
};

export const initGoogleAPI = (apiKey, clientId) => {
    window.gapi.load("client", async () => {
        await window.gapi.client.init({
            apiKey: apiKey,
            clientId: clientId,
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        });
    });
};

