import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { initGoogleAPI, signIn } from "./utils/googleAuth";
import { getUserCalendars, getEventsFromCalendar, getEventDetails } from "./utils/googleCalendar";

function AppNew() {
    const [calendars, setCalendars] = useState([]);
    const [selectedCalendars, setSelectedCalendars] = useState({});
    const [events, setEvents] = useState([]);
    const [token, setToken] = useState(null);

    useEffect(() => {
        // ✅ Wait for Google API to be initialized before rendering anything
        const initialize = async () => {
            await initGoogleAPI();
        };
        initialize();
    }, []);

    const handleSignIn = async () => {
        try {
            const accessToken = await signIn(); // ✅ signIn now correctly handles GIS token request
            if (!accessToken) {
                console.error("Failed to get access token");
                return;
            }

            setToken(accessToken);

            // ✅ Fetch user calendars
            const userCalendars = await getUserCalendars(accessToken);
            setCalendars(userCalendars);

            // ✅ Default to all calendars selected
            const initialSelection = userCalendars.reduce((acc, cal) => {
                acc[cal.id] = true;
                return acc;
            }, {});
            setSelectedCalendars(initialSelection);

            // ✅ Fetch events for all calendars
            await loadAllEvents(userCalendars, initialSelection, accessToken);
        } catch (error) {
            console.error("Sign-in error:", error);
        }
    };

    const loadAllEvents = async (calendars, selection, accessToken) => {
        let allEvents = [];
        for (const cal of calendars) {
            if (selection[cal.id]) {
                const eventsData = await getEventsFromCalendar(cal.id, accessToken);
                const formattedEvents = eventsData.map(event => ({
                    id: event.id,
                    title: `${event.summary}`,
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
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                height="auto"
                headerToolbar={{
                    left: "prev,next,today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay"
                }}
                eventClick={(eventClick) => {
                    getEventDetails(eventClick.event.id, token).then((eventDetails) => {
                        const eventDetailsElement = document.getElementById('event-details');
                        eventDetailsElement.style.display = 'block';
                        eventDetailsElement.innerHTML = `
                            <h2>${eventDetails.summary}</h2>
                            <p>${eventDetails.description}</p>
                            <p>${eventDetails.start.dateTime}</p>
                            <p>${eventDetails.end.dateTime}</p>
                        `;
                    });
                }}
            />
        </div>
    );
}

export default AppNew;
