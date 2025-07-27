export interface GeocodingResult {
  name: string;
  lat: number;
  lng: number;
  formattedAddress: string;
  confidence: number;
}

export class GeocodingService {
  private readonly API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // You'll need to add your API key
  private readonly BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

  async geocodeStation(stationName: string, city: string = 'London, UK'): Promise<GeocodingResult | null> {
    try {
      const query = `${stationName}, ${city}`;
      const url = `${this.BASE_URL}?address=${encodeURIComponent(query)}&key=${this.API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const location = result.geometry.location;
        
        return {
          name: stationName,
          lat: location.lat,
          lng: location.lng,
          formattedAddress: result.formatted_address,
          confidence: this.calculateConfidence(result)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  private calculateConfidence(result: any): number {
    // Calculate confidence based on geocoding result quality
    const types = result.types || [];
    const hasStreetAddress = types.includes('street_address') || types.includes('route');
    const hasLocality = types.includes('locality') || types.includes('sublocality');
    
    if (hasStreetAddress) return 0.9;
    if (hasLocality) return 0.7;
    return 0.5;
  }

  // Fallback method using a simple coordinate mapping for common London areas
  getFallbackCoordinates(stationName: string): { lat: number; lng: number; area: string } | null {
    const londonAreas = {
      // Specific streets and locations
      'park street': { lat: 51.5075, lng: -0.0952, area: 'Bankside' },
      'brunswick square': { lat: 51.5235, lng: -0.1244, area: 'Bloomsbury' },
      'malet street': { lat: 51.5218, lng: -0.1301, area: 'Bloomsbury' },
      'scala street': { lat: 51.5186, lng: -0.1350, area: 'Fitzrovia' },
      'argyle street': { lat: 51.5320, lng: -0.1233, area: 'Kings Cross' },
      'great russell street': { lat: 51.5190, lng: -0.1280, area: 'Bloomsbury' },
      'cartwright gardens': { lat: 51.5250, lng: -0.1220, area: 'Bloomsbury' },
      'hatton wall': { lat: 51.5174, lng: -0.1100, area: 'Holborn' },
      'drury lane': { lat: 51.5124, lng: -0.1223, area: 'Covent Garden' },
      
      // Areas
      'bankside': { lat: 51.5085, lng: -0.0972, area: 'Bankside' },
      'fitzrovia': { lat: 51.5186, lng: -0.1350, area: 'Fitzrovia' },
      'holborn': { lat: 51.5174, lng: -0.1200, area: 'Holborn' },
      
      'clerkenwell': { lat: 51.5267, lng: -0.1067, area: 'Clerkenwell' },
      'kensington': { lat: 51.5025, lng: -0.2017, area: 'Kensington' },
      'liverpool street': { lat: 51.5185, lng: -0.0816, area: 'Liverpool Street' },
      'kings cross': { lat: 51.5320, lng: -0.1233, area: 'King\'s Cross' },
      'sloane square': { lat: 51.4925, lng: -0.1567, area: 'Sloane Square' },
      'marylebone': { lat: 51.5186, lng: -0.1437, area: 'Marylebone' },
      'st johns wood': { lat: 51.5325, lng: -0.1687, area: 'St. John\'s Wood' },
      'maida vale': { lat: 51.5267, lng: -0.1857, area: 'Maida Vale' },
      'bankside': { lat: 51.5085, lng: -0.0972, area: 'Bankside' },
      'bloomsbury': { lat: 51.5235, lng: -0.1244, area: 'Bloomsbury' },
      'camden': { lat: 51.5390, lng: -0.1426, area: 'Camden' },
      'islington': { lat: 51.5362, lng: -0.1033, area: 'Islington' },
      'hackney': { lat: 51.5450, lng: -0.0550, area: 'Hackney' },
      'shoreditch': { lat: 51.5250, lng: -0.0750, area: 'Shoreditch' },
      'soho': { lat: 51.5130, lng: -0.1360, area: 'Soho' },
      'mayfair': { lat: 51.5100, lng: -0.1450, area: 'Mayfair' },
      'chelsea': { lat: 51.4875, lng: -0.1687, area: 'Chelsea' },
      'belgravia': { lat: 51.4975, lng: -0.1487, area: 'Belgravia' },
      'pimlico': { lat: 51.4925, lng: -0.1337, area: 'Pimlico' },
      'battersea': { lat: 51.4775, lng: -0.1487, area: 'Battersea' },
      'wandsworth': { lat: 51.4575, lng: -0.1887, area: 'Wandsworth' },
      'putney': { lat: 51.4625, lng: -0.2187, area: 'Putney' },
      'fulham': { lat: 51.4775, lng: -0.1987, area: 'Fulham' },
      'hammersmith': { lat: 51.4925, lng: -0.2287, area: 'Hammersmith' },
      'chiswick': { lat: 51.4875, lng: -0.2587, area: 'Chiswick' },
      'ealing': { lat: 51.5150, lng: -0.3019, area: 'Ealing' },
      'acton': { lat: 51.5075, lng: -0.2787, area: 'Acton' },
      'shepherds bush': { lat: 51.5058, lng: -0.2265, area: 'Shepherd\'s Bush' },
      'white city': { lat: 51.5120, lng: -0.2239, area: 'White City' },
      'notting hill': { lat: 51.5087, lng: -0.1967, area: 'Notting Hill' },
      'holland park': { lat: 51.5072, lng: -0.2063, area: 'Holland Park' },
      'bayswater': { lat: 51.5126, lng: -0.1879, area: 'Bayswater' },
      'paddington': { lat: 51.5154, lng: -0.1755, area: 'Paddington' },
      'edgware road': { lat: 51.5203, lng: -0.1679, area: 'Edgware Road' },
      'baker street': { lat: 51.5225, lng: -0.1571, area: 'Baker Street' },
      'regents park': { lat: 51.5275, lng: -0.1471, area: 'Regent\'s Park' },
      'euston': { lat: 51.5282, lng: -0.1337, area: 'Euston' },
      'kings cross': { lat: 51.5320, lng: -0.1233, area: 'King\'s Cross' },
      'st pancras': { lat: 51.5320, lng: -0.1253, area: 'St Pancras' },
      'angel': { lat: 51.5325, lng: -0.1058, area: 'Angel' },
      'old street': { lat: 51.5260, lng: -0.0870, area: 'Old Street' },
      'moorgate': { lat: 51.5186, lng: -0.0886, area: 'Moorgate' },
      'bank': { lat: 51.5134, lng: -0.0886, area: 'Bank' },
      'monument': { lat: 51.5108, lng: -0.0862, area: 'Monument' },
      'tower hill': { lat: 51.5098, lng: -0.0766, area: 'Tower Hill' },
      'aldgate': { lat: 51.5142, lng: -0.0755, area: 'Aldgate' },
      'liverpool street': { lat: 51.5185, lng: -0.0816, area: 'Liverpool Street' },
      'shoreditch high street': { lat: 51.5250, lng: -0.0750, area: 'Shoreditch' },
      'hoxton': { lat: 51.5325, lng: -0.0750, area: 'Hoxton' },
      'haggerston': { lat: 51.5375, lng: -0.0750, area: 'Haggerston' },
      'dalston': { lat: 51.5450, lng: -0.0750, area: 'Dalston' },
      'hackney central': { lat: 51.5450, lng: -0.0550, area: 'Hackney' },
      'homerton': { lat: 51.5475, lng: -0.0450, area: 'Homerton' },
      'stratford': { lat: 51.5425, lng: -0.0025, area: 'Stratford' },
      'canary wharf': { lat: 51.5050, lng: -0.0230, area: 'Canary Wharf' },
      'limehouse': { lat: 51.5125, lng: -0.0350, area: 'Limehouse' },
      'mile end': { lat: 51.5250, lng: -0.0350, area: 'Mile End' },
      'bow': { lat: 51.5275, lng: -0.0250, area: 'Bow' },
      'bromley by bow': { lat: 51.5300, lng: -0.0150, area: 'Bromley by Bow' },
      'west ham': { lat: 51.5325, lng: -0.0050, area: 'West Ham' },
      'plumstead': { lat: 51.4875, lng: 0.0850, area: 'Plumstead' },
      'woolwich': { lat: 51.4900, lng: 0.0650, area: 'Woolwich' },
      'thamesmead': { lat: 51.4925, lng: 0.0850, area: 'Thamesmead' },
      'abbey wood': { lat: 51.4900, lng: 0.1200, area: 'Abbey Wood' },
      'belvedere': { lat: 51.4925, lng: 0.1400, area: 'Belvedere' },
      'erith': { lat: 51.4950, lng: 0.1600, area: 'Erith' },
      'slade green': { lat: 51.4675, lng: 0.1900, area: 'Slade Green' },
      'dartford': { lat: 51.4475, lng: 0.2200, area: 'Dartford' },
      'stone crossing': { lat: 51.4500, lng: 0.2400, area: 'Stone Crossing' },
      'greenhithe': { lat: 51.4525, lng: 0.2600, area: 'Greenhithe' },
      'swanscombe': { lat: 51.4550, lng: 0.2800, area: 'Swanscombe' },
      'northfleet': { lat: 51.4575, lng: 0.3000, area: 'Northfleet' },
      'gravesend': { lat: 51.4600, lng: 0.3200, area: 'Gravesend' },
      'chafford hundred': { lat: 51.4625, lng: 0.3400, area: 'Chafford Hundred' },
      'purfleet': { lat: 51.4650, lng: 0.3600, area: 'Purfleet' },
      'rainham': { lat: 51.4675, lng: 0.3800, area: 'Rainham' },
      'dagenham dock': { lat: 51.4700, lng: 0.4000, area: 'Dagenham Dock' },
      'barking': { lat: 51.5400, lng: 0.0800, area: 'Barking' },
      'upney': { lat: 51.5375, lng: 0.1000, area: 'Upney' },
      'becontree': { lat: 51.5350, lng: 0.1200, area: 'Becontree' },
      'dagenham heathway': { lat: 51.5325, lng: 0.1400, area: 'Dagenham' },
      'dagenham east': { lat: 51.5300, lng: 0.1600, area: 'Dagenham' },
      'elm park': { lat: 51.5275, lng: 0.1800, area: 'Elm Park' },
      'hornchurch': { lat: 51.5250, lng: 0.2000, area: 'Hornchurch' },
      'upminster bridge': { lat: 51.5225, lng: 0.2200, area: 'Upminster Bridge' },
      'upminster': { lat: 51.5200, lng: 0.2400, area: 'Upminster' },
      'east ham': { lat: 51.5375, lng: 0.0600, area: 'East Ham' },
      'upton park': { lat: 51.5350, lng: 0.0400, area: 'Upton Park' },
      'plaidstow': { lat: 51.5325, lng: 0.0200, area: 'Plaistow' },
      'west ham': { lat: 51.5300, lng: 0.0000, area: 'West Ham' },
      'canning town': { lat: 51.5275, lng: -0.0200, area: 'Canning Town' },
      'royal victoria': { lat: 51.5250, lng: -0.0400, area: 'Royal Victoria' },
      'custom house': { lat: 51.5225, lng: -0.0600, area: 'Custom House' },
      'prince regent': { lat: 51.5200, lng: -0.0800, area: 'Prince Regent' },
      'royal albert': { lat: 51.5175, lng: -0.1000, area: 'Royal Albert' },
      'beckton': { lat: 51.5150, lng: -0.1200, area: 'Beckton' },
      'beckton park': { lat: 51.5125, lng: -0.1400, area: 'Beckton Park' },
      'cyprus': { lat: 51.5100, lng: -0.1600, area: 'Cyprus' },
      'gallions reach': { lat: 51.5075, lng: -0.1800, area: 'Gallions Reach' },
      'king george v': { lat: 51.5050, lng: -0.2000, area: 'King George V' },
      'london city airport': { lat: 51.5025, lng: -0.2200, area: 'London City Airport' },
      'pontoon dock': { lat: 51.5000, lng: -0.2400, area: 'Pontoon Dock' },
      'west silvertown': { lat: 51.4975, lng: -0.2600, area: 'West Silvertown' },
      'silvertown': { lat: 51.4950, lng: -0.2800, area: 'Silvertown' },
      'canning town': { lat: 51.5275, lng: -0.0200, area: 'Canning Town' },
      'poplar': { lat: 51.5075, lng: -0.0200, area: 'Poplar' },
      'blackwall': { lat: 51.5100, lng: -0.0200, area: 'Blackwall' },
      'east india': { lat: 51.5125, lng: -0.0200, area: 'East India' },
      'heron quays': { lat: 51.5150, lng: -0.0200, area: 'Heron Quays' },
      'canary wharf': { lat: 51.5050, lng: -0.0230, area: 'Canary Wharf' },
      'west india quay': { lat: 51.5075, lng: -0.0200, area: 'West India Quay' },
      'canary wharf': { lat: 51.5050, lng: -0.0230, area: 'Canary Wharf' },
      'south quay': { lat: 51.5025, lng: -0.0200, area: 'South Quay' },
      'crossharbour': { lat: 51.5000, lng: -0.0200, area: 'Crossharbour' },
      'mudchute': { lat: 51.4975, lng: -0.0200, area: 'Mudchute' },
      'island gardens': { lat: 51.4950, lng: -0.0200, area: 'Island Gardens' },
      'cutty sark': { lat: 51.4825, lng: -0.0100, area: 'Cutty Sark' },
      'greenwich': { lat: 51.4800, lng: 0.0000, area: 'Greenwich' },
      'deptford bridge': { lat: 51.4775, lng: 0.0100, area: 'Deptford Bridge' },
      'elverson road': { lat: 51.4750, lng: 0.0200, area: 'Elverson Road' },
      'lewisham': { lat: 51.4725, lng: 0.0300, area: 'Lewisham' },
      'new cross': { lat: 51.4700, lng: 0.0400, area: 'New Cross' },
      'new cross gate': { lat: 51.4675, lng: 0.0500, area: 'New Cross Gate' },
      'surrey quays': { lat: 51.4650, lng: 0.0600, area: 'Surrey Quays' },
      'canada water': { lat: 51.4625, lng: 0.0700, area: 'Canada Water' },
      'rotherhithe': { lat: 51.4600, lng: 0.0800, area: 'Rotherhithe' },
      'wapping': { lat: 51.4575, lng: 0.0900, area: 'Wapping' },
      'shadwell': { lat: 51.4550, lng: 0.1000, area: 'Shadwell' },
      'whitechapel': { lat: 51.4525, lng: 0.1100, area: 'Whitechapel' },
      'aldgate east': { lat: 51.4500, lng: 0.1200, area: 'Aldgate East' },
      'tower gateway': { lat: 51.4475, lng: 0.1300, area: 'Tower Gateway' },
      'tower hill': { lat: 51.5098, lng: -0.0766, area: 'Tower Hill' },
      'monument': { lat: 51.5108, lng: -0.0862, area: 'Monument' },
      'cannon street': { lat: 51.5115, lng: -0.0904, area: 'Cannon Street' },
      'mansion house': { lat: 51.5125, lng: -0.0941, area: 'Mansion House' },
      'blackfriars': { lat: 51.5120, lng: -0.1033, area: 'Blackfriars' },
      'temple': { lat: 51.5111, lng: -0.1141, area: 'Temple' },
      'embankment': { lat: 51.5074, lng: -0.1223, area: 'Embankment' },
      'westminster': { lat: 51.4995, lng: -0.1245, area: 'Westminster' },
      'waterloo': { lat: 51.5033, lng: -0.1145, area: 'Waterloo' },
      'lambeth north': { lat: 51.4989, lng: -0.1116, area: 'Lambeth North' },
      'elephant and castle': { lat: 51.4958, lng: -0.1000, area: 'Elephant & Castle' },
      'borough': { lat: 51.5011, lng: -0.0943, area: 'Borough' },
      'london bridge': { lat: 51.5050, lng: -0.0864, area: 'London Bridge' },
      'southwark': { lat: 51.5035, lng: -0.1053, area: 'Southwark' },
      'kennington': { lat: 51.4884, lng: -0.1053, area: 'Kennington' },
      'oval': { lat: 51.4819, lng: -0.1136, area: 'Oval' },
      'stockwell': { lat: 51.4723, lng: -0.1229, area: 'Stockwell' },
      'clapham north': { lat: 51.4647, lng: -0.1297, area: 'Clapham North' },
      'clapham common': { lat: 51.4617, lng: -0.1387, area: 'Clapham Common' },
      'clapham south': { lat: 51.4527, lng: -0.1477, area: 'Clapham South' },
      'balham': { lat: 51.4437, lng: -0.1567, area: 'Balham' },
      'tooting bec': { lat: 51.4347, lng: -0.1657, area: 'Tooting Bec' },
      'tooting broadway': { lat: 51.4257, lng: -0.1747, area: 'Tooting Broadway' },
      'colliers wood': { lat: 51.4167, lng: -0.1837, area: 'Colliers Wood' },
      'south wimbledon': { lat: 51.4077, lng: -0.1927, area: 'South Wimbledon' },
      'morden': { lat: 51.3987, lng: -0.2017, area: 'Morden' },
      'brixton': { lat: 51.4622, lng: -0.1145, area: 'Brixton' },
      'loughborough junction': { lat: 51.4650, lng: -0.1050, area: 'Loughborough Junction' },
      'herne hill': { lat: 51.4675, lng: -0.0950, area: 'Herne Hill' },
      'tulse hill': { lat: 51.4700, lng: -0.0850, area: 'Tulse Hill' },
      'west dulwich': { lat: 51.4725, lng: -0.0750, area: 'West Dulwich' },
      'sydenham hill': { lat: 51.4750, lng: -0.0650, area: 'Sydenham Hill' },
      'penge west': { lat: 51.4775, lng: -0.0550, area: 'Penge West' },
      'anerley': { lat: 51.4800, lng: -0.0450, area: 'Anerley' },
      'norwood junction': { lat: 51.4825, lng: -0.0350, area: 'Norwood Junction' },
      'west croydon': { lat: 51.4850, lng: -0.0250, area: 'West Croydon' },
      'east croydon': { lat: 51.4875, lng: -0.0150, area: 'East Croydon' },
      'south croydon': { lat: 51.4900, lng: -0.0050, area: 'South Croydon' },
      'purley': { lat: 51.4925, lng: 0.0050, area: 'Purley' },
      'purley oaks': { lat: 51.4950, lng: 0.0150, area: 'Purley Oaks' },
      'reedham': { lat: 51.4975, lng: 0.0250, area: 'Reedham' },
      'coulsdon town': { lat: 51.5000, lng: 0.0350, area: 'Coulsdon Town' },
      'coulsdon south': { lat: 51.5025, lng: 0.0450, area: 'Coulsdon South' },
      'merstham': { lat: 51.5050, lng: 0.0550, area: 'Merstham' },
      'redhill': { lat: 51.5075, lng: 0.0650, area: 'Redhill' },
      'earlswood': { lat: 51.5100, lng: 0.0750, area: 'Earlswood' },
      'salfords': { lat: 51.5125, lng: 0.0850, area: 'Salfords' },
      'horley': { lat: 51.5150, lng: 0.0950, area: 'Horley' },
      'gatwick airport': { lat: 51.5175, lng: 0.1050, area: 'Gatwick Airport' },
      'three bridges': { lat: 51.5200, lng: 0.1150, area: 'Three Bridges' },
      'crawley': { lat: 51.5225, lng: 0.1250, area: 'Crawley' },
      'ifield': { lat: 51.5250, lng: 0.1350, area: 'Ifield' },
      'faygate': { lat: 51.5275, lng: 0.1450, area: 'Faygate' },
      'littlehaven': { lat: 51.5300, lng: 0.1550, area: 'Littlehaven' },
      'horsham': { lat: 51.5325, lng: 0.1650, area: 'Horsham' },
      'christs hospital': { lat: 51.5350, lng: 0.1750, area: 'Christ\'s Hospital' },
      'billingshurst': { lat: 51.5375, lng: 0.1850, area: 'Billingshurst' },
      'pulborough': { lat: 51.5400, lng: 0.1950, area: 'Pulborough' },
      'amberley': { lat: 51.5425, lng: 0.2050, area: 'Amberley' },
      'arundel': { lat: 51.5450, lng: 0.2150, area: 'Arundel' },
      'ford': { lat: 51.5475, lng: 0.2250, area: 'Ford' },
      'barnham': { lat: 51.5500, lng: 0.2350, area: 'Barnham' },
      'bognor regis': { lat: 51.5525, lng: 0.2450, area: 'Bognor Regis' },
      'chichester': { lat: 51.5550, lng: 0.2550, area: 'Chichester' },
      'bosham': { lat: 51.5575, lng: 0.2650, area: 'Bosham' },
      'fishbourne': { lat: 51.5600, lng: 0.2750, area: 'Fishbourne' },
      'havant': { lat: 51.5625, lng: 0.2850, area: 'Havant' },
      'bedhampton': { lat: 51.5650, lng: 0.2950, area: 'Bedhampton' },
      'hilsea': { lat: 51.5675, lng: 0.3050, area: 'Hilsea' },
      'fratton': { lat: 51.5700, lng: 0.3150, area: 'Fratton' },
      'portsmouth and southsea': { lat: 51.5725, lng: 0.3250, area: 'Portsmouth & Southsea' },
      'portsmouth harbour': { lat: 51.5750, lng: 0.3350, area: 'Portsmouth Harbour' }
    };

    const searchName = stationName.toLowerCase();
    
    // Try exact matches first
    for (const [area, coords] of Object.entries(londonAreas)) {
      if (searchName.includes(area)) {
        return coords;
      }
    }

    // Try partial matches
    for (const [area, coords] of Object.entries(londonAreas)) {
      if (area.includes(searchName) || searchName.includes(area)) {
        return coords;
      }
    }

    return null;
  }
}

export const geocodingService = new GeocodingService(); 