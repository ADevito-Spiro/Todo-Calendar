import { gapi } from 'gapi-script';

const CLIENT_ID = 'INSERT_Key';
const API_KEY = 'INSERT_CLIENT_ID';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

export const signIn = async () => {
    try {
        const authInstance = window.gapi.auth2.getAuthInstance();
        const user = await authInstance.signIn();

        const accessToken = user.getAuthResponse().access_token;
        return accessToken;
    } catch (error) {
        console.error("Google Sign-In error:", error);
    }
};

// Ensure OAuth scopes include calendar access
export const initGoogleAPI = () => {
    window.gapi.load("client:auth2", async () => {
        await window.gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
            scope: SCOPES // Allows viewing calendars
        });
    });
};

