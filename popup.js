const filterDepartures = (data, routeFilter, stopHeadsignFilter) => {
    // Szűrés routeIds és stopHeadsign alapján
    
    return data.data.entry.stopTimes.filter(departure => 
        data.data.entry.routeIds.includes(routeFilter) && departure.stopHeadsign === stopHeadsignFilter
    );
    
};
let emptyResponsesCount = 0; // Nyilvántartja, hány API válasz volt üres

const fetchAndDisplayDepartures = (apiUrl, routeFilter, stopHeadsignFilter, displayElementId, name, type) => {
    const loadingContainer = document.getElementById("loadingContainer");
    loadingContainer.style.display = "flex"; // Show loading animation

    const displayElement = document.getElementById(displayElementId);
    displayElement.innerHTML = ""; // Clear previous content

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const departures = filterDepartures(data, routeFilter, stopHeadsignFilter)
                .map(departure => {
                    const departureTimestamp = departure.predictedDepartureTime || departure.departureTime;
                    
                    if (!departureTimestamp) return null; // Skip if no valid time

                    const departureTime = new Date(departureTimestamp * 1000);
                    const minutesUntilDeparture = Math.floor((departureTimestamp - Date.now() / 1000) / 60);
                    const timeFormatted = departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return { name, type, minutesUntilDeparture, timeFormatted, timestamp: departureTimestamp };
                })
                .filter(departure => departure !== null) // Remove invalid entries
                .filter(departure => departure.minutesUntilDeparture > 0);
                
            // Ha nincs járat, növeljük az emptyResponsesCount-ot
            if (departures.length === 0) {
                emptyResponsesCount++;
                if (emptyResponsesCount === 3) { // Ha minden irányban üres válasz jön
                    displayElement.innerHTML = "<ul><li class='nincsjarat'>Nincs járat jelenleg!</li></ul>";
                }
            } else {
                emptyResponsesCount = 0; // Ha van járat, reseteljük a számlálót
                const scheduleHtml = departures.map(departure =>
                    `<li class="${departure.type}"><strong>${departure.name}</strong> - ${departure.minutesUntilDeparture} perc - (${departure.timeFormatted})</li>`
                ).join('');
                displayElement.innerHTML = `<ul>${scheduleHtml}</ul>`;
            }
        
        })
        .catch(() => {
            displayElement.innerHTML = "<ul><li class='nincsjarat'>Nem sikerült betölteni az adatokat.</li></ul>";
        })
        .finally(() => {
            loadingContainer.style.display = "none"; // Hide loading animation
        });
};

// API URL-ek példája (használj tényleges API URL-t)
const apiUrlGyoriOttmarTeri = "https://futar.bkk.hu/api/query/v1/ws/otp/api/where/arrivals-and-departures-for-stop.json?stopId=BKK_F03925&minutesAfter=30&key=c6ca7274-4118-4645-b8f3-e0634cd854f4";  
const apiUrlCorvinKrt = "https://futar.bkk.hu/api/query/v1/ws/otp/api/where/arrivals-and-departures-for-stop.json?stopId=BKK_F03927&minutesAfter=30&key=c6ca7274-4118-4645-b8f3-e0634cd854f4";  

// Külön API hívások a három irányba
fetchAndDisplayDepartures(apiUrlGyoriOttmarTeri, "BKK_1940", "Határ út M", "schedule194", 194, "bus"); 
fetchAndDisplayDepartures(apiUrlGyoriOttmarTeri, "BKK_0990", "Blaha Lujza tér M", "schedule99", 99, "bus"); 
fetchAndDisplayDepartures(apiUrlCorvinKrt, "BKK_3420", "Határ út M", "schedule42", 42, "tram"); 


document.addEventListener("DOMContentLoaded", function() {
    const infoIcon = document.getElementById("i");
    const tooltip = document.getElementById("tooltip");

    document.addEventListener("click", function(event) {
        // Ha az 'i'-re kattintasz, toggle-olja a tooltipet
        if (infoIcon.contains(event.target)) {
            infoIcon.classList.toggle("clicked");
        } else {
            // Ha máshova kattintasz, a tooltip elrejtődik
            infoIcon.classList.remove("clicked");
        }
    });
});