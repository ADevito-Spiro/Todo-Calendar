import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { initGoogleAPI, signIn } from "./utils/googleAuth";
import { getUserCalendars, getEventsFromCalendar, getEventDetails } from "./utils/googleCalendar";

function App() {
    const [calendars, setCalendars] = useState([]);
    const [selectedCalendars, setSelectedCalendars] = useState({});
    const [events, setEvents] = useState([]);
    const [token, setToken] = useState(null);

    const apiKey = import.meta.env.VITE_API_KEY;
    const clientId = import.meta.env.VITE_CLIENT_ID;

    useEffect(() => {
        initGoogleAPI(apiKey, clientId);
    }, [apiKey, clientId]);

    const handleSignIn = () => {
        signIn(async (accessToken) => {  // Remove clientId here because it's passed directly
            setToken(accessToken);

            const userCalendars = await getUserCalendars(accessToken);
            setCalendars(userCalendars);

            const initialSelection = userCalendars.reduce((acc, cal) => {
                acc[cal.id] = true;
                return acc;
            }, {});
            setSelectedCalendars(initialSelection);

            await loadAllEvents(userCalendars, initialSelection, accessToken);
        }, clientId);  // Pass clientId here
    };


    const loadAllEvents = async (calendars, selection, accessToken) => {
        let allEvents = [];
        for (const cal of calendars) {
            if (selection[cal.id]) {
                const eventsData = await getEventsFromCalendar(cal.id, accessToken);
                const formattedEvents = eventsData.map(event => ({
                    id: event.id,
                    title: event.summary,
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
            <h1>Calendar To-Do</h1>
            {/*<button onClick={handleSignIn}>Sign in with Google</button>*/}
            <div id="g_id_onload"
                 data-client_id={clientId}  // Use clientId variable here
                 data-context="signin"
                 data-ux_mode="popup"
                 data-callback="handleSignIn"
                 data-auto_select="true"
                 data-itp_support="true">
            </div>

            <div className="g_id_signin"
                 data-type="standard"
                 data-shape="pill"
                 data-theme="filled_black"
                 data-text="continue_with"
                 data-size="large"
                 data-logo_alignment="left">
            </div>
            {calendars.length > 0 && (
                <div>
                    {calendars.map((cal) => (
                        <label key={cal.id} style={{display: "block", margin: "5px 0"}}>
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

            />
        </div>
    );
}

export default App;
