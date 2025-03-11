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
        return data.items; // Returns a list of calendars
    } catch (error) {
        console.error("Error fetching user calendars:", error);
    }
};

export const getEventsFromCalendar = async (calendarId, accessToken) => {
    try {
        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
            {
                method: "GET",
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );
        const data = await response.json();
        return data.items; // Returns events from the selected calendar
    } catch (error) {
        console.error("Error fetching calendar events:", error);
    }
};
