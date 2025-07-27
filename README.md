# TfL Cycle Share Map

A React-based interactive map application for London's TfL Cycle Share stations, built with Vite, TypeScript, and Google Maps API.

## Features

### 🚴‍♂️ Real-time Station Data
- Live data from TfL API showing bike availability
- Auto-refresh every 30 seconds
- Station status indicators (active, locked, temporary)

### 🗺️ Interactive Map
- Google Maps integration with custom markers
- Color-coded stations based on availability:
  - 🟢 Green: Good availability (≥30% bikes and docks)
  - 🔵 Blue: Low availability (≥10% bikes and docks)
  - 🔴 Red: Full stations or offline
  - ⚫ Black: Empty stations
- E-bike stations highlighted with indigo borders

### 📍 Location Images
- **NEW**: Location images in station popups
- Uses Google Places API to find nearby photos
- Falls back to Street View images when available
- Retry mechanism for failed image loads

### ⭐ Favorites System
- Mark stations as favorites
- Persistent storage in localStorage
- Star indicators on favorite stations

### 🎯 Priority System
- Set priority levels (HP, P1, P2, P3) for stations
- Color-coded priority labels on markers
- Persistent priority storage

### 🛣️ Directions Feature
- Calculate travel time between stations
- Google Maps Directions integration
- Route visualization on map

### 🎨 Area Drawing
- Draw custom areas on the map
- Save and name multiple areas
- Highlight stations within selected areas
- Multi-area selection with checkboxes

### 🔍 Search & Filter
- Real-time station search
- Filter by station name or ID
- Toggle legend visibility

## Setup

### Prerequisites
- Node.js (v16 or higher)
- Google Maps API key with the following APIs enabled:
  - Maps JavaScript API
  - Places API
  - Directions API
  - Street View API

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tfl-cycle-share-map
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## API Requirements

Your Google Maps API key needs the following APIs enabled:
- **Maps JavaScript API**: Core map functionality
- **Places API**: Location images and place search
- **Directions API**: Route calculation between stations
- **Street View API**: Fallback location images

## Usage

### Viewing Stations
- Click on any station marker to open detailed information
- View real-time availability data
- See location images when available

### Managing Favorites
- Click the star icon in station popups to add/remove favorites
- Favorites are automatically saved and persist between sessions

### Setting Priorities
- Use the priority dropdown in station popups
- Priority levels are color-coded and saved per station

### Getting Directions
- Click "Get Directions From Here" in a station popup
- Click another station to set as destination
- View route and travel time information

### Drawing Areas
- Click the drawing tool icon in the top controls
- Draw a polygon on the map
- Name and save the area
- Select multiple areas to highlight stations

## Technical Details

### Architecture
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Maps**: Google Maps JavaScript API
- **State Management**: React hooks with localStorage persistence

### Key Components
- `GoogleMap`: Main map component with marker management
- `StationModal`: Station details popup with image display
- `MapControls`: Top control panel with search and tools
- `DirectionsInfo`: Route information display
- `imageService`: Location image fetching service

### Data Flow
1. TfL API provides bike point data
2. Data is parsed into `StationStats` objects
3. Coordinates are embedded in station IDs
4. Google Maps displays custom markers
5. User interactions trigger modal displays and API calls

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 