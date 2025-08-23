document.addEventListener('DOMContentLoaded', () => {
    // --- Tabs ---
    const tabs = document.querySelectorAll('[role="tab"]');
    const tabPanels = document.querySelectorAll('[role="tabpanel"]');

    tabs.forEach(tab => {
        tab.addEventListener('click', handleTabClick);
    });

    function handleTabClick(event) {
        // Hide all tab panels
        tabPanels.forEach(panel => {
            panel.hidden = true;
        });
        // Unselect all tabs
        tabs.forEach(tab => {
            tab.setAttribute('aria-selected', 'false');
            tab.setAttribute('tabindex', '-1');
        });

        // Show the selected panel
        const { id } = event.currentTarget;
        const panel = document.querySelector(`[aria-labelledby="${id}"]`);
        panel.hidden = false;

        // Mark the current tab as selected
        event.currentTarget.setAttribute('aria-selected', 'true');
        event.currentTarget.setAttribute('tabindex', '0');

        // Lazy load map
        if (id === 'map-tab' && !window.mapInitialized) {
            initializeMap();
            window.mapInitialized = true;
        }
    }

    // --- Accordion ---
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const expanded = header.getAttribute('aria-expanded') === 'true' || false;
            header.setAttribute('aria-expanded', !expanded);
        });
    });
    
    // --- Leaflet Map ---
    function initializeMap() {
        const map = L.map('map');
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        const dayColors = {
            2: '#E6194B', // Red
            3: '#3CB44B', // Green
            4: '#F58231', // Orange
            5: '#4363D8', // Blue
            6: '#911EB4', // Purple
            7: '#42d4f4'  // Cyan
        };
        const accommodationColor = '#f5a623';

        // Custom icon for accommodation
        const accommodationIcon = L.divIcon({
            html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${accommodationColor}" width="32px" height="32px"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`,
            className: 'map-icon-svg',
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        });

        // Custom icon for other points
        const createPinIcon = (color) => {
            return L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color:${color};" class="marker-pin"></div>`,
                iconSize: [30, 42],
                iconAnchor: [15, 42]
            });
        };
        
        const points = [
            // Alojamiento (day: 0 to be always visible)
            { lat: 37.830160, lng: -25.668308, name: '🏡 Alojamiento: La Casita Felizola', type: 'alojamiento', day: 0 },
            
            // Day 2
            { lat: 37.8183, lng: -25.6669, name: '🏞️ Inicio Trekking: Salto do Cabrito', type: 'trekking', day: 2 },
            
            // Day 3
            { lat: 37.869, lng: -25.798, name: '🏞️ Inicio Trekking: Mata do Canário – Sete Cidades', type: 'trekking', day: 3 },
            { lat: 37.859, lng: -25.776, name: '📍 Sete Cidades', type: 'interes', day: 3 },
            { lat: 37.863, lng: -25.829, name: '📍 Piscinas Naturales de Mosteiros', type: 'interes', day: 3 },

            // Day 4
            { lat: 37.795, lng: -25.539, name: '🏞️ Inicio Trekking: Praia – Lagoa do Fogo', type: 'trekking', day: 4 },
            { lat: 37.804, lng: -25.516, name: '📍 Caldeira Velha', type: 'interes', day: 4 },

            // Day 5
            { lat: 37.768, lng: -25.433, name: '🏞️ Inicio Trekking: Lagoa das Furnas', type: 'trekking', day: 5 },
            { lat: 37.771, lng: -25.464, name: '📍 Parque Terra Nostra', type: 'interes', day: 5 },

            // Day 6
            { lat: 37.762, lng: -25.176, name: '🏞️ Inicio Trekking: Faial da Terra – Salto do Prego', type: 'trekking', day: 6 },
            { lat: 37.721, lng: -25.412, name: '📍 Vila Franca do Campo', type: 'interes', day: 6 },

            // Day 7
            { lat: 37.834685, lng: -25.217614, name: '🏞️ Inicio Trekking: Pico da Vara', type: 'trekking', day: 7 },
            { lat: 37.833, lng: -25.321, name: '📍 Parque Natural da Ribeira dos Caldeirões', type: 'interes', day: 7 },
            { lat: 37.818, lng: -25.456, name: '📍 Plantações de Chá Gorreana', type: 'interes', day: 7 },
            { lat: 37.82400371533997, lng: -25.46235100197902, name: '📍 Miradouro de Santa Iria', type: 'interes', day: 7 }
        ];

        if (points.length === 0) {
            map.setView([37.80, -25.5], 9);
            const mapDiv = document.getElementById('map');
            mapDiv.innerHTML = "<p>Faltan coordenadas en el PDF_Plan Diarios ViajeAzores2025_V7.md para mostrar los puntos en el mapa.</p>";
            return;
        }

        const allMarkers = [];
        points.forEach(point => {
            let icon;
            if (point.type === 'alojamiento') {
                icon = accommodationIcon;
            } else {
                icon = createPinIcon(dayColors[point.day] || '#CCCCCC'); // Fallback color
            }
            const marker = L.marker([point.lat, point.lng], { icon: icon, day: point.day });
            marker.bindPopup(`<b>${point.name}</b>`);
            allMarkers.push(marker);
        });

        // Add all markers to the map initially and set the view to fit them all.
        const group = new L.featureGroup(allMarkers).addTo(map);
        map.fitBounds(group.getBounds().pad(0.1));

        const filterButtons = document.querySelectorAll('.map-filter-btn');
        const allButton = document.querySelector('.map-filter-btn[data-day="all"]');
        const dayButtons = document.querySelectorAll('.map-filter-btn:not([data-day="all"])');

        function filterMarkers(days) { // days is 'all' or an array of day strings
            const isSelectAll = days === 'all';

            allMarkers.forEach(marker => {
                // Accommodation (day 0) is always visible and should not be filtered.
                if (marker.options.day === 0) {
                    return;
                }

                const shouldBeVisible = isSelectAll || days.includes(marker.options.day.toString());

                if (shouldBeVisible) {
                    if (!map.hasLayer(marker)) {
                        marker.addTo(map);
                    }
                } else {
                    if (map.hasLayer(marker)) {
                        map.removeLayer(marker);
                    }
                }
            });
        }

        allButton.addEventListener('click', () => {
            allButton.classList.add('active');
            dayButtons.forEach(b => b.classList.remove('active'));
            filterMarkers('all');
        });

        dayButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                allButton.classList.remove('active');

                const selectedDays = [...dayButtons]
                    .filter(b => b.classList.contains('active'))
                    .map(b => b.dataset.day);

                if (selectedDays.length === 0) {
                    allButton.classList.add('active');
                    filterMarkers('all');
                } else {
                    filterMarkers(selectedDays);
                }
            });
        });

        const legendData = {
            'Día 2: Cetáceos y Cascada': dayColors[2],
            'Día 3: Sete Cidades': dayColors[3],
            'Día 4: Lagoa do Fogo': dayColors[4],
            'Día 5: Furnas': dayColors[5],
            'Día 6: Sureste': dayColors[6],
            'Día 7: Pico da Vara y Nordeste': dayColors[7],
        };
        const legend = document.getElementById('map-legend');
        legend.innerHTML = `<p><span class="legend-icon alojamiento-icon" aria-label="Icono de casa"></span> Alojamiento</p>`;
        for (const [label, color] of Object.entries(legendData)) {
            legend.innerHTML += `<p><span class="legend-icon" style="background-color: ${color};"></span> ${label}</p>`;
        }

        // Add custom marker CSS
        const style = document.createElement('style');
        style.innerHTML = `
            .marker-pin {
                width: 30px;
                height: 30px;
                border-radius: 50% 50% 50% 0;
                background: #c32;
                position: absolute;
                transform: rotate(-45deg);
                left: 50%;
                top: 50%;
                margin: -15px 0 0 -15px;
            }
            .marker-pin::after {
                content: '';
                width: 14px;
                height: 14px;
                margin: 8px 0 0 8px;
                background: #fff;
                position: absolute;
                border-radius: 50%;
            }
            .map-icon-svg svg {
                filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.7));
            }
        `;
        document.head.appendChild(style);
    }
});
