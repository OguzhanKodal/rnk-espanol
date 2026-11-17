// City centres (WGS84), with IANA zones for seasonal clock changes.
export type City = { name: string; lat: number; lng: number; timeZone: string };
export type SavedLocation = City & { country: string };
export const countries: { name: string; cities: City[] }[] = [
  {
    name: "España",
    cities: [
      {
        name: "Madrid",
        lat: 40.42,
        lng: -3.7,
        timeZone: "Europe/Madrid",
      },
      {
        name: "Barcelona",
        lat: 41.39,
        lng: 2.17,
        timeZone: "Europe/Madrid",
      },
      {
        name: "Valencia",
        lat: 39.47,
        lng: -0.38,
        timeZone: "Europe/Madrid",
      },
      {
        name: "Sevilla",
        lat: 37.39,
        lng: -5.98,
        timeZone: "Europe/Madrid",
      },
      {
        name: "Las Palmas",
        lat: 28.12,
        lng: -15.44,
        timeZone: "Atlantic/Canary",
      },
    ],
  },
  {
    name: "México",
    cities: [
      {
        name: "Ciudad de México",
        lat: 19.43,
        lng: -99.13,
        timeZone: "America/Mexico_City",
      },
      {
        name: "Guadalajara",
        lat: 20.67,
        lng: -103.35,
        timeZone: "America/Mexico_City",
      },
      {
        name: "Monterrey",
        lat: 25.69,
        lng: -100.32,
        timeZone: "America/Monterrey",
      },
      {
        name: "Puebla",
        lat: 19.04,
        lng: -98.2,
        timeZone: "America/Mexico_City",
      },
      {
        name: "Tijuana",
        lat: 32.51,
        lng: -117.04,
        timeZone: "America/Tijuana",
      },
      {
        name: "Cancún",
        lat: 21.16,
        lng: -86.85,
        timeZone: "America/Cancun",
      },
    ],
  },
  {
    name: "Colombia",
    cities: [
      {
        name: "Bogotá",
        lat: 4.71,
        lng: -74.07,
        timeZone: "America/Bogota",
      },
      {
        name: "Medellín",
        lat: 6.24,
        lng: -75.58,
        timeZone: "America/Bogota",
      },
      {
        name: "Cali",
        lat: 3.45,
        lng: -76.53,
        timeZone: "America/Bogota",
      },
      {
        name: "Barranquilla",
        lat: 10.99,
        lng: -74.78,
        timeZone: "America/Bogota",
      },
    ],
  },
  {
    name: "Argentina",
    cities: [
      {
        name: "Buenos Aires",
        lat: -34.6,
        lng: -58.38,
        timeZone: "America/Argentina/Buenos_Aires",
      },
      {
        name: "Córdoba",
        lat: -31.42,
        lng: -64.19,
        timeZone: "America/Argentina/Cordoba",
      },
      {
        name: "Rosario",
        lat: -32.95,
        lng: -60.64,
        timeZone: "America/Argentina/Cordoba",
      },
      {
        name: "Mendoza",
        lat: -32.89,
        lng: -68.85,
        timeZone: "America/Argentina/Mendoza",
      },
    ],
  },
  {
    name: "Perú",
    cities: [
      {
        name: "Lima",
        lat: -12.05,
        lng: -77.04,
        timeZone: "America/Lima",
      },
      {
        name: "Arequipa",
        lat: -16.4,
        lng: -71.54,
        timeZone: "America/Lima",
      },
      {
        name: "Trujillo",
        lat: -8.11,
        lng: -79.03,
        timeZone: "America/Lima",
      },
      {
        name: "Cusco",
        lat: -13.52,
        lng: -71.97,
        timeZone: "America/Lima",
      },
    ],
  },
  {
    name: "Venezuela",
    cities: [
      {
        name: "Caracas",
        lat: 10.48,
        lng: -66.9,
        timeZone: "America/Caracas",
      },
      {
        name: "Maracaibo",
        lat: 10.65,
        lng: -71.64,
        timeZone: "America/Caracas",
      },
      {
        name: "Valencia",
        lat: 10.16,
        lng: -68.0,
        timeZone: "America/Caracas",
      },
      {
        name: "Barquisimeto",
        lat: 10.07,
        lng: -69.32,
        timeZone: "America/Caracas",
      },
    ],
  },
  {
    name: "Chile",
    cities: [
      {
        name: "Santiago",
        lat: -33.45,
        lng: -70.67,
        timeZone: "America/Santiago",
      },
      {
        name: "Valparaíso",
        lat: -33.05,
        lng: -71.62,
        timeZone: "America/Santiago",
      },
      {
        name: "Concepción",
        lat: -36.83,
        lng: -73.05,
        timeZone: "America/Santiago",
      },
      {
        name: "Antofagasta",
        lat: -23.65,
        lng: -70.4,
        timeZone: "America/Santiago",
      },
    ],
  },
  {
    name: "Ecuador",
    cities: [
      {
        name: "Quito",
        lat: -0.18,
        lng: -78.47,
        timeZone: "America/Guayaquil",
      },
      {
        name: "Guayaquil",
        lat: -2.19,
        lng: -79.89,
        timeZone: "America/Guayaquil",
      },
      {
        name: "Cuenca",
        lat: -2.9,
        lng: -79.01,
        timeZone: "America/Guayaquil",
      },
      {
        name: "Manta",
        lat: -0.96,
        lng: -80.71,
        timeZone: "America/Guayaquil",
      },
    ],
  },
  {
    name: "Guatemala",
    cities: [
      {
        name: "Ciudad de Guatemala",
        lat: 14.63,
        lng: -90.51,
        timeZone: "America/Guatemala",
      },
      {
        name: "Quetzaltenango",
        lat: 14.83,
        lng: -91.52,
        timeZone: "America/Guatemala",
      },
      {
        name: "Escuintla",
        lat: 14.3,
        lng: -90.79,
        timeZone: "America/Guatemala",
      },
      {
        name: "Antigua Guatemala",
        lat: 14.56,
        lng: -90.73,
        timeZone: "America/Guatemala",
      },
    ],
  },
  {
    name: "Cuba",
    cities: [
      {
        name: "La Habana",
        lat: 23.14,
        lng: -82.36,
        timeZone: "America/Havana",
      },
      {
        name: "Santiago de Cuba",
        lat: 20.02,
        lng: -75.83,
        timeZone: "America/Havana",
      },
      {
        name: "Camagüey",
        lat: 21.38,
        lng: -77.92,
        timeZone: "America/Havana",
      },
      {
        name: "Holguín",
        lat: 20.89,
        lng: -76.26,
        timeZone: "America/Havana",
      },
    ],
  },
  {
    name: "Bolivia",
    cities: [
      {
        name: "La Paz",
        lat: -16.5,
        lng: -68.15,
        timeZone: "America/La_Paz",
      },
      {
        name: "Santa Cruz de la Sierra",
        lat: -17.78,
        lng: -63.18,
        timeZone: "America/La_Paz",
      },
      {
        name: "Cochabamba",
        lat: -17.39,
        lng: -66.16,
        timeZone: "America/La_Paz",
      },
      {
        name: "Sucre",
        lat: -19.03,
        lng: -65.26,
        timeZone: "America/La_Paz",
      },
    ],
  },
  {
    name: "República Dominicana",
    cities: [
      {
        name: "Santo Domingo",
        lat: 18.49,
        lng: -69.93,
        timeZone: "America/Santo_Domingo",
      },
      {
        name: "Santiago de los Caballeros",
        lat: 19.45,
        lng: -70.7,
        timeZone: "America/Santo_Domingo",
      },
      {
        name: "La Romana",
        lat: 18.43,
        lng: -68.97,
        timeZone: "America/Santo_Domingo",
      },
      {
        name: "San Pedro de Macorís",
        lat: 18.46,
        lng: -69.3,
        timeZone: "America/Santo_Domingo",
      },
    ],
  },
  {
    name: "Honduras",
    cities: [
      {
        name: "Tegucigalpa",
        lat: 14.07,
        lng: -87.19,
        timeZone: "America/Tegucigalpa",
      },
      {
        name: "San Pedro Sula",
        lat: 15.5,
        lng: -88.03,
        timeZone: "America/Tegucigalpa",
      },
      {
        name: "La Ceiba",
        lat: 15.78,
        lng: -86.79,
        timeZone: "America/Tegucigalpa",
      },
      {
        name: "Choluteca",
        lat: 13.3,
        lng: -87.19,
        timeZone: "America/Tegucigalpa",
      },
    ],
  },
  {
    name: "Paraguay",
    cities: [
      {
        name: "Asunción",
        lat: -25.28,
        lng: -57.64,
        timeZone: "America/Asuncion",
      },
      {
        name: "Ciudad del Este",
        lat: -25.51,
        lng: -54.61,
        timeZone: "America/Asuncion",
      },
      {
        name: "Encarnación",
        lat: -27.33,
        lng: -55.87,
        timeZone: "America/Asuncion",
      },
      {
        name: "Luque",
        lat: -25.26,
        lng: -57.49,
        timeZone: "America/Asuncion",
      },
    ],
  },
  {
    name: "El Salvador",
    cities: [
      {
        name: "San Salvador",
        lat: 13.7,
        lng: -89.19,
        timeZone: "America/El_Salvador",
      },
      {
        name: "Santa Ana",
        lat: 13.99,
        lng: -89.56,
        timeZone: "America/El_Salvador",
      },
      {
        name: "San Miguel",
        lat: 13.48,
        lng: -88.18,
        timeZone: "America/El_Salvador",
      },
      {
        name: "Sonsonate",
        lat: 13.72,
        lng: -89.72,
        timeZone: "America/El_Salvador",
      },
    ],
  },
  {
    name: "Nicaragua",
    cities: [
      {
        name: "Managua",
        lat: 12.14,
        lng: -86.25,
        timeZone: "America/Managua",
      },
      {
        name: "León",
        lat: 12.44,
        lng: -86.88,
        timeZone: "America/Managua",
      },
      {
        name: "Granada",
        lat: 11.93,
        lng: -85.96,
        timeZone: "America/Managua",
      },
      {
        name: "Masaya",
        lat: 11.97,
        lng: -86.09,
        timeZone: "America/Managua",
      },
    ],
  },
  {
    name: "Costa Rica",
    cities: [
      {
        name: "San José",
        lat: 9.93,
        lng: -84.08,
        timeZone: "America/Costa_Rica",
      },
      {
        name: "Alajuela",
        lat: 10.02,
        lng: -84.21,
        timeZone: "America/Costa_Rica",
      },
      {
        name: "Cartago",
        lat: 9.86,
        lng: -83.92,
        timeZone: "America/Costa_Rica",
      },
      {
        name: "Heredia",
        lat: 10.0,
        lng: -84.12,
        timeZone: "America/Costa_Rica",
      },
    ],
  },
  {
    name: "Panamá",
    cities: [
      {
        name: "Ciudad de Panamá",
        lat: 8.98,
        lng: -79.52,
        timeZone: "America/Panama",
      },
      {
        name: "Colón",
        lat: 9.36,
        lng: -79.9,
        timeZone: "America/Panama",
      },
      {
        name: "David",
        lat: 8.43,
        lng: -82.43,
        timeZone: "America/Panama",
      },
      {
        name: "Santiago de Veraguas",
        lat: 8.1,
        lng: -80.98,
        timeZone: "America/Panama",
      },
    ],
  },
  {
    name: "Uruguay",
    cities: [
      {
        name: "Montevideo",
        lat: -34.9,
        lng: -56.16,
        timeZone: "America/Montevideo",
      },
      {
        name: "Salto",
        lat: -31.38,
        lng: -57.96,
        timeZone: "America/Montevideo",
      },
      {
        name: "Paysandú",
        lat: -32.32,
        lng: -58.08,
        timeZone: "America/Montevideo",
      },
      {
        name: "Maldonado",
        lat: -34.9,
        lng: -54.96,
        timeZone: "America/Montevideo",
      },
    ],
  },
  {
    name: "Puerto Rico",
    cities: [
      {
        name: "San Juan",
        lat: 18.47,
        lng: -66.11,
        timeZone: "America/Puerto_Rico",
      },
      {
        name: "Ponce",
        lat: 18.01,
        lng: -66.61,
        timeZone: "America/Puerto_Rico",
      },
      {
        name: "Mayagüez",
        lat: 18.2,
        lng: -67.14,
        timeZone: "America/Puerto_Rico",
      },
      {
        name: "Bayamón",
        lat: 18.4,
        lng: -66.16,
        timeZone: "America/Puerto_Rico",
      },
    ],
  },
  {
    name: "Estados Unidos",
    cities: [
      {
        name: "Nueva York",
        lat: 40.71,
        lng: -74.01,
        timeZone: "America/New_York",
      },
      {
        name: "Los Ángeles",
        lat: 34.05,
        lng: -118.24,
        timeZone: "America/Los_Angeles",
      },
      {
        name: "Chicago",
        lat: 41.88,
        lng: -87.63,
        timeZone: "America/Chicago",
      },
      {
        name: "Houston",
        lat: 29.76,
        lng: -95.37,
        timeZone: "America/Chicago",
      },
      {
        name: "Miami",
        lat: 25.76,
        lng: -80.19,
        timeZone: "America/New_York",
      },
      {
        name: "Phoenix",
        lat: 33.45,
        lng: -112.07,
        timeZone: "America/Phoenix",
      },
    ],
  },
  {
    name: "Guinea Ecuatorial",
    cities: [
      {
        name: "Malabo",
        lat: 3.75,
        lng: 8.78,
        timeZone: "Africa/Malabo",
      },
      {
        name: "Bata",
        lat: 1.86,
        lng: 9.77,
        timeZone: "Africa/Malabo",
      },
      {
        name: "Ebebiyín",
        lat: 2.15,
        lng: 11.34,
        timeZone: "Africa/Malabo",
      },
      {
        name: "Mongomo",
        lat: 1.63,
        lng: 11.31,
        timeZone: "Africa/Malabo",
      },
    ],
  },
  {
    name: "Turquía",
    cities: [
      {
        name: "Estambul",
        lat: 41.01,
        lng: 28.98,
        timeZone: "Europe/Istanbul",
      },
      {
        name: "Ankara",
        lat: 39.93,
        lng: 32.86,
        timeZone: "Europe/Istanbul",
      },
      {
        name: "Esmirna",
        lat: 38.42,
        lng: 27.14,
        timeZone: "Europe/Istanbul",
      },
      {
        name: "Bursa",
        lat: 40.19,
        lng: 29.06,
        timeZone: "Europe/Istanbul",
      },
      {
        name: "Antalya",
        lat: 36.89,
        lng: 30.71,
        timeZone: "Europe/Istanbul",
      },
    ],
  },
  {
    name: "Marruecos",
    cities: [
      {
        name: "Casablanca",
        lat: 33.59,
        lng: -7.62,
        timeZone: "Africa/Casablanca",
      },
      {
        name: "Rabat",
        lat: 34.02,
        lng: -6.84,
        timeZone: "Africa/Casablanca",
      },
      {
        name: "Marrakech",
        lat: 31.63,
        lng: -7.98,
        timeZone: "Africa/Casablanca",
      },
      {
        name: "Fez",
        lat: 34.03,
        lng: -5.0,
        timeZone: "Africa/Casablanca",
      },
      {
        name: "Tánger",
        lat: 35.76,
        lng: -5.83,
        timeZone: "Africa/Casablanca",
      },
    ],
  },
  {
    name: "Reino Unido",
    cities: [
      {
        name: "Londres",
        lat: 51.51,
        lng: -0.13,
        timeZone: "Europe/London",
      },
      {
        name: "Birmingham",
        lat: 52.49,
        lng: -1.9,
        timeZone: "Europe/London",
      },
      {
        name: "Mánchester",
        lat: 53.48,
        lng: -2.24,
        timeZone: "Europe/London",
      },
      {
        name: "Glasgow",
        lat: 55.86,
        lng: -4.25,
        timeZone: "Europe/London",
      },
    ],
  },
  {
    name: "Alemania",
    cities: [
      {
        name: "Berlín",
        lat: 52.52,
        lng: 13.41,
        timeZone: "Europe/Berlin",
      },
      {
        name: "Hamburgo",
        lat: 53.55,
        lng: 10.0,
        timeZone: "Europe/Berlin",
      },
      {
        name: "Múnich",
        lat: 48.14,
        lng: 11.58,
        timeZone: "Europe/Berlin",
      },
      {
        name: "Colonia",
        lat: 50.94,
        lng: 6.96,
        timeZone: "Europe/Berlin",
      },
      {
        name: "Fráncfort",
        lat: 50.11,
        lng: 8.68,
        timeZone: "Europe/Berlin",
      },
    ],
  },
  {
    name: "Francia",
    cities: [
      {
        name: "París",
        lat: 48.86,
        lng: 2.35,
        timeZone: "Europe/Paris",
      },
      {
        name: "Marsella",
        lat: 43.3,
        lng: 5.37,
        timeZone: "Europe/Paris",
      },
      {
        name: "Lyon",
        lat: 45.76,
        lng: 4.84,
        timeZone: "Europe/Paris",
      },
      {
        name: "Toulouse",
        lat: 43.6,
        lng: 1.44,
        timeZone: "Europe/Paris",
      },
      {
        name: "Niza",
        lat: 43.7,
        lng: 7.27,
        timeZone: "Europe/Paris",
      },
    ],
  },
];
