import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { initGoogleAPI, signIn } from "./utils/googleAuth";
import { getUserCalendars, getEventsFromCalendar } from "./utils/googleCalendar";

function App() {
    const [calendars, setCalendars] = useState([]);
    const [selectedCalendars, setSelectedCalendars] = useState({}); // Store calendar visibility
    const [events, setEvents] = useState([]);
    const [token, setToken] = useState(null);

    useEffect(() => {
        initGoogleAPI();
    }, []);

    const handleSignIn = async () => {
        const accessToken = await signIn();
        setToken(accessToken);

        const userCalendars = await getUserCalendars(accessToken);
        setCalendars(userCalendars);

        // Default: Show all calendars
        const initialSelection = userCalendars.reduce((acc, cal) => {
            acc[cal.id] = true;
            return acc;
        }, {});
        setSelectedCalendars(initialSelection);

        // Load all calendar events
        await loadAllEvents(userCalendars, initialSelection, accessToken);
    };

    const loadAllEvents = async (calendars, selection, accessToken) => {
        let allEvents = [];
        for (const cal of calendars) {
            if (selection[cal.id]) {
                const eventsData = await getEventsFromCalendar(cal.id, accessToken);
                const formattedEvents = eventsData.map(event => ({
                    id: event.id,
                    title: `[${cal.summary}] ${event.summary}`,
                    start: event.start.dateTime || event.start.date,
                    end: event.end?.dateTime || event.end?.date,
                    allDay: !event.start.dateTime,
                    backgroundColor: cal.backgroundColor || "#3788d8",
                }));
                allEvents = [...allEvents, ...formattedEvents];
            }
        }
        setEvents(allEvents);
    };

    const toggleCalendar = (calendarId) => {
        const newSelection = { ...selectedCalendars, [calendarId]: !selectedCalendars[calendarId] };
        setSelectedCalendars(newSelection);
        loadAllEvents(calendars, newSelection, token);
    };

    return (
        <div>
            <h1>Google Calendar Checklist</h1>
            <button onClick={handleSignIn}>Sign in with Google</button>

            {/* Checkbox controls for each calendar */}
            {calendars.length > 0 && (
                <div>
                    {calendars.map((cal) => (
                        <label key={cal.id} style={{ display: "block", margin: "5px 0" }}>
                            <input
                                type="checkbox"
                                checked={selectedCalendars[cal.id]}
                                onChange={() => toggleCalendar(cal.id)}
                            />
                            {cal.summary}
                        </label>
                    ))}
                </div>
            )}

            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                height="auto"
            />
        </div>
    );
}

export default App;
