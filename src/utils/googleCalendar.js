export const getUserCalendars = async (accessToken) => {
    try {
        const response = await fetch(
            "https://www.googleapis.com/calendar/v3/users/me/calendarList",
            {
                method: "GET",
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );
        const data = await response.json();
        return data.items || []; // Ensure an array is returned
    } catch (error) {
        console.error("Error fetching user calendars:", error);
        return [];
    }
};

export const getEventsFromCalendar = async (calendarId, accessToken) => {
    try {
        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?maxResults=2500`,
            {
                method: "GET",
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );
        const data = await response.json();
        return data.items || []; // Ensure an array is returned
    } catch (error) {
        console.error("Error fetching calendar events:", error);
        return [];
    }
};

export const getEventDetails = async (calendarId, eventId, accessToken) => {
    try {
        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
            {
                method: "GET",
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );
        const data = await response.json();
        return data || {}; // Ensure an object is returned
    } catch (error) {
        console.error("Error fetching event details:", error);
        return {};
    }
};
