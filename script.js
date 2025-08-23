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

        const colors = {
            alojamiento: '#f5a623',
            trekking: '#00a896',
            interes: '#006494'
        };

        // Custom icon for accommodation
        const accommodationIcon = L.divIcon({
            html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${colors.alojamiento}" width="32px" height="32px"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`,
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
        
        const trekkingIcon = createPinIcon(colors.trekking);
        const interestIcon = createPinIcon(colors.interes);

        const points = [
            // Alojamiento
            { lat: 37.830160, lng: -25.668308, name: '🏡 Alojamiento: La Casita Felizola', type: 'alojamiento' },
            
            // Inicios de Trekking (6 total)
            { lat: 37.8183, lng: -25.6669, name: '🏞️ Inicio Trekking: Salto do Cabrito', type: 'trekking' },
            { lat: 37.869, lng: -25.798, name: '🏞️ Inicio Trekking: Mata do Canário – Sete Cidades', type: 'trekking' },
            { lat: 37.795, lng: -25.539, name: '🏞️ Inicio Trekking: Praia – Lagoa do Fogo', type: 'trekking' },
            { lat: 37.768, lng: -25.433, name: '🏞️ Inicio Trekking: Lagoa das Furnas', type: 'trekking' },
            { lat: 37.762, lng: -25.176, name: '🏞️ Inicio Trekking: Faial da Terra – Salto do Prego', type: 'trekking' },
            { lat: 37.834685, lng: -25.217614, name: '🏞️ Inicio Trekking: Pico da Vara', type: 'trekking' },
            
            // Puntos de Interés
            { lat: 37.859, lng: -25.776, name: '📍 Sete Cidades', type: 'interes' },
            { lat: 37.863, lng: -25.829, name: '📍 Piscinas Naturales de Mosteiros', type: 'interes' },
            { lat: 37.804, lng: -25.516, name: '📍 Caldeira Velha', type: 'interes' },
            { lat: 37.771, lng: -25.464, name: '📍 Parque Terra Nostra', type: 'interes' },
            { lat: 37.721, lng: -25.412, name: '📍 Vila Franca do Campo', type: 'interes' },
            { lat: 37.833, lng: -25.321, name: '📍 Parque Natural da Ribeira dos Caldeirões', type: 'interes' },
            { lat: 37.818, lng: -25.456, name: '📍 Plantações de Chá Gorreana', type: 'interes' },
            { lat: 37.828, lng: -25.568, name: '📍 Miradouro de Santa Iria', type: 'interes' }
        ];

        if (points.length === 0) {
            map.setView([37.80, -25.5], 9);
            const mapDiv = document.getElementById('map');
            mapDiv.innerHTML = "<p>Faltan coordenadas en el PDF_Plan Diarios ViajeAzores2025_V7.md para mostrar los puntos en el mapa.</p>";
            return;
        }

        const markers = [];
        points.forEach(point => {
            let icon;
            switch(point.type) {
                case 'alojamiento': icon = accommodationIcon; break;
                case 'trekking': icon = trekkingIcon; break;
                default: icon = interestIcon;
            }
            const marker = L.marker([point.lat, point.lng], { icon: icon }).addTo(map);
            marker.bindPopup(`<b>${point.name}</b>`);
            markers.push(marker);
        });

        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));

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
