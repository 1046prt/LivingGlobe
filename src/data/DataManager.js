export class DataManager {
  constructor() {
    this.countries = [];
    this.currentData = {};
  }

  async loadInitialData() {
    try {
      // Load country data from JSON files
      await this.loadCountriesFromFiles();
    } catch (error) {
      console.error("Failed to load country data:", error);
      // Fallback to generated data if files fail to load
      this.countries = this.generateComprehensiveCountries();
    }
  }

  async loadCountriesFromFiles() {
    const countryFiles = [
      "ar",
      "au",
      "br",
      "ca",
      "cn",
      "de",
      "es",
      "fr",
      "gb",
      "in",
      "it",
      "jp",
      "mx",
      "ru",
      "us",
    ];

    const countries = [];

    for (const countryCode of countryFiles) {
      try {
        const response = await fetch(`/src/data/countries/${countryCode}.json`);
        if (response.ok) {
          const countryData = await response.json();

          // Convert to our internal format and add coordinates
          const processedCountry = this.processCountryData(countryData);
          countries.push(processedCountry);
        }
      } catch (error) {
        console.warn(`Failed to load ${countryCode}.json:`, error);
      }
    }

    this.countries = countries;
  }

  processCountryData(data) {
    // Convert the rich JSON data to our internal format
    return {
      name: data.name,
      capital: data.capital,
      population: data.population,
      gdp: data.economy?.gdp || 0,
      region: data.region,
      lat: this.getCountryCoordinates(data.name).lat,
      lon: this.getCountryCoordinates(data.name).lon,
      currency: data.currency?.code || "N/A",
      languages: data.languages || [],
      area: data.geography?.area || 0,
      timezone: data.timezones?.[0] || "UTC",
      government: data.politics?.governmentType || "N/A",
      independence: data.heritage?.independenceDate || "N/A",
      flag: this.getCountryFlag(data.iso2),

      // Rich data from JSON files
      iso2: data.iso2,
      iso3: data.iso3,
      image: data.image,
      flagImage: data.flag,
      currencyData: data.currency,
      geography: data.geography,
      heritage: data.heritage,
      politics: data.politics,
      economy: data.economy,
      culture: data.culture,
      education: data.education,
      tourism: data.tourism,
      demographics: data.demographics,
      scienceTechnology: data.scienceTechnology,
      sportsEntertainment: data.sportsEntertainment,
      history: data.history,
      states: data.states,
      famousCities: data.famousCities,
      landmarks: data.landmarks,
      rivers: data.rivers,
      institutions: data.institutions,

      // Environmental data (calculated)
      environmentScore: Math.floor(Math.random() * 100),
      co2Emissions: Math.floor(Math.random() * 1000) + 100,
      renewableEnergy: Math.floor(Math.random() * 80) + 10,
      forestCoverage: Math.floor(Math.random() * 70) + 5,

      // Cultural data (from JSON or calculated)
      culturalSites:
        data.heritage?.unescoSites?.length ||
        Math.floor(Math.random() * 20) + 1,
      festivals:
        data.culture?.nationalFestivals?.length ||
        Math.floor(Math.random() * 50) + 10,
      museums: Math.floor(Math.random() * 100) + 10,

      // Social indicators (from demographics or calculated)
      lifeExpectancy:
        data.demographics?.lifeExpectancy?.total ||
        Math.floor(Math.random() * 20) + 65,
      literacyRate:
        data.education?.literacyRate || Math.floor(Math.random() * 30) + 70,
      internetUsers: Math.floor(Math.random() * 40) + 40,
      urbanPopulation:
        data.demographics?.urbanRural?.urban ||
        Math.floor(Math.random() * 60) + 30,

      // Economic indicators (from economy data)
      unemploymentRate: (100 - (data.economy?.employmentRate || 90)).toFixed(1),
      inflationRate: (Math.random() * 10 + 1).toFixed(1),
      gdpPerCapita:
        data.economy?.gdpPerCapita ||
        Math.floor((data.economy?.gdp || 0) / data.population),

      // Quality of life
      happinessIndex: (Math.random() * 3 + 5).toFixed(1),
      corruptionIndex: Math.floor(Math.random() * 100),
      democracyIndex: (Math.random() * 10).toFixed(1),
      giniCoefficient: (Math.random() * 0.4 + 0.25).toFixed(2),
      humanDevelopmentIndex: (Math.random() * 0.3 + 0.6).toFixed(3),

      // Infrastructure
      internetSpeed: Math.floor(Math.random() * 100) + 10,
      roadQuality: Math.floor(Math.random() * 100),
      electricityAccess: Math.floor(Math.random() * 30) + 70,

      // Health
      healthcareIndex: Math.floor(Math.random() * 100),
      doctorsPerCapita: (Math.random() * 5 + 1).toFixed(1),
      hospitalBeds: (Math.random() * 10 + 2).toFixed(1),

      // Education (from education data)
      educationIndex: Math.floor(Math.random() * 100),
      universities:
        data.institutions?.length || Math.floor(Math.random() * 200) + 10,
      researchOutput: Math.floor(Math.random() * 1000) + 50,

      // Technology
      innovationIndex: Math.floor(Math.random() * 100),
      patents:
        data.scienceTechnology?.patents ||
        Math.floor(Math.random() * 10000) + 100,
      techExports: Math.floor(Math.random() * 50) + 5,

      // Tourism (from tourism data)
      touristArrivals:
        data.tourism?.mostVisitedCities?.reduce(
          (sum, city) => sum + (city.visitors || 0),
          0
        ) || Math.floor(Math.random() * 50000000) + 1000000,
      tourismRevenue: Math.floor(Math.random() * 100000000000) + 1000000000,

      // Climate data
      averageTemp: Math.floor(Math.random() * 40) - 10,
      rainfall: Math.floor(Math.random() * 3000) + 200,
      climateZone:
        data.geography?.climateZones?.[0] ||
        ["Tropical", "Temperate", "Arid", "Continental", "Polar"][
          Math.floor(Math.random() * 5)
        ],
    };
  }

  getCountryCoordinates(countryName) {
    const coordinates = {
      Argentina: { lat: -38.4161, lon: -63.6167 },
      Australia: { lat: -25.2744, lon: 133.7751 },
      Brazil: { lat: -14.235, lon: -51.9253 },
      Canada: { lat: 56.1304, lon: -106.3468 },
      China: { lat: 35.8617, lon: 104.1954 },
      Germany: { lat: 51.1657, lon: 10.4515 },
      Spain: { lat: 40.4637, lon: -3.7492 },
      France: { lat: 46.2276, lon: 2.2137 },
      "United Kingdom": { lat: 55.3781, lon: -3.436 },
      India: { lat: 20.5937, lon: 78.9629 },
      Italy: { lat: 41.8719, lon: 12.5674 },
      Japan: { lat: 36.2048, lon: 138.2529 },
      Mexico: { lat: 23.6345, lon: -102.5528 },
      Russia: { lat: 61.524, lon: 105.3188 },
      "United States": { lat: 39.8283, lon: -98.5795 },
    };
    return coordinates[countryName] || { lat: 0, lon: 0 };
  }

  getCountryFlag(iso2) {
    const flags = {
      AR: "🇦🇷",
      AU: "🇦🇺",
      BR: "🇧🇷",
      CA: "🇨🇦",
      CN: "🇨🇳",
      DE: "🇩🇪",
      ES: "🇪🇸",
      FR: "🇫🇷",
      GB: "🇬🇧",
      IN: "🇮🇳",
      IT: "🇮🇹",
      JP: "🇯🇵",
      MX: "🇲🇽",
      RU: "🇷🇺",
      US: "🇺🇸",
    };
    return flags[iso2] || "🌍";
  }

  getCountryFlagImage(iso2) {
    if (!iso2) return null;

    const flagCode = iso2.toLowerCase();
    const flagPath = `/src/data/flags/${flagCode}.png`;

    // Check if jpg version exists for specific countries
    if (flagCode === "jp") {
      return `/src/data/flags/${flagCode}.jpg`;
    }

    return flagPath;
  }

  generateComprehensiveCountries() {
    const countries = [
      {
        name: "United States",
        capital: "Washington D.C.",
        population: 331900000,
        gdp: 21430000000000,
        region: "North America",
        lat: 39.8283,
        lon: -98.5795,
        currency: "USD",
        languages: ["English"],
        area: 9833517,
        timezone: "UTC-5 to UTC-10",
        government: "Federal Republic",
        independence: "1776-07-04",
        flag: "🇺🇸",
        iso2: "US",
      },
      {
        name: "China",
        capital: "Beijing",
        population: 1439323776,
        gdp: 14342000000000,
        region: "Asia",
        lat: 35.8617,
        lon: 104.1954,
        currency: "CNY",
        languages: ["Mandarin Chinese"],
        area: 9596961,
        timezone: "UTC+8",
        government: "Communist State",
        independence: "1949-10-01",
        flag: "🇨🇳",
        iso2: "CN",
      },
      {
        name: "Japan",
        capital: "Tokyo",
        population: 126476461,
        gdp: 4937000000000,
        region: "Asia",
        lat: 36.2048,
        lon: 138.2529,
        currency: "JPY",
        languages: ["Japanese"],
        area: 377975,
        timezone: "UTC+9",
        government: "Constitutional Monarchy",
        independence: "660 BC",
        flag: "🇯🇵",
        iso2: "JP",
      },
      {
        name: "Germany",
        capital: "Berlin",
        population: 83783942,
        gdp: 3846000000000,
        region: "Europe",
        lat: 51.1657,
        lon: 10.4515,
        currency: "EUR",
        languages: ["German"],
        area: 357114,
        timezone: "UTC+1",
        government: "Federal Republic",
        independence: "1871-01-18",
        flag: "🇩🇪",
        iso2: "DE",
      },
      {
        name: "United Kingdom",
        capital: "London",
        population: 67886011,
        gdp: 2829000000000,
        region: "Europe",
        lat: 55.3781,
        lon: -3.436,
        currency: "GBP",
        languages: ["English"],
        area: 242495,
        timezone: "UTC+0",
        government: "Constitutional Monarchy",
        independence: "927 AD",
        flag: "🇬🇧",
        iso2: "GB",
      },
      {
        name: "France",
        capital: "Paris",
        population: 65273511,
        gdp: 2716000000000,
        region: "Europe",
        lat: 46.2276,
        lon: 2.2137,
        currency: "EUR",
        languages: ["French"],
        area: 643801,
        timezone: "UTC+1",
        government: "Republic",
        independence: "843 AD",
        flag: "🇫🇷",
        iso2: "FR",
      },
      {
        name: "India",
        capital: "New Delhi",
        population: 1380004385,
        gdp: 2875000000000,
        region: "Asia",
        lat: 20.5937,
        lon: 78.9629,
        currency: "INR",
        languages: ["Hindi", "English"],
        area: 3287263,
        timezone: "UTC+5:30",
        government: "Federal Republic",
        independence: "1947-08-15",
        flag: "🇮🇳",
        iso2: "IN",
      },
      {
        name: "Italy",
        capital: "Rome",
        population: 60461826,
        gdp: 2001000000000,
        region: "Europe",
        lat: 41.8719,
        lon: 12.5674,
        currency: "EUR",
        languages: ["Italian"],
        area: 301340,
        timezone: "UTC+1",
        government: "Republic",
        independence: "1861-03-17",
        flag: "🇮🇹",
        iso2: "IT",
      },
      {
        name: "Brazil",
        capital: "Brasília",
        population: 212559417,
        gdp: 1869000000000,
        region: "South America",
        lat: -14.235,
        lon: -51.9253,
        currency: "BRL",
        languages: ["Portuguese"],
        area: 8514877,
        timezone: "UTC-3 to UTC-5",
        government: "Federal Republic",
        independence: "1822-09-07",
        flag: "🇧🇷",
        iso2: "BR",
      },
      {
        name: "Canada",
        capital: "Ottawa",
        population: 37742154,
        gdp: 1736000000000,
        region: "North America",
        lat: 56.1304,
        lon: -106.3468,
        currency: "CAD",
        languages: ["English", "French"],
        area: 9984670,
        timezone: "UTC-3:30 to UTC-8",
        government: "Constitutional Monarchy",
        independence: "1867-07-01",
        flag: "🇨🇦",
        iso2: "CA",
      },
      {
        name: "Russia",
        capital: "Moscow",
        population: 145934462,
        gdp: 1699000000000,
        region: "Europe/Asia",
        lat: 61.524,
        lon: 105.3188,
        currency: "RUB",
        languages: ["Russian"],
        area: 17098242,
        timezone: "UTC+2 to UTC+12",
        government: "Federal Republic",
        independence: "1991-12-25",
        flag: "🇷🇺",
        iso2: "RU",
      },
      {
        name: "South Korea",
        capital: "Seoul",
        population: 51269185,
        gdp: 1644000000000,
        region: "Asia",
        lat: 35.9078,
        lon: 127.7669,
        currency: "KRW",
        languages: ["Korean"],
        area: 100210,
        timezone: "UTC+9",
        government: "Republic",
        independence: "1948-08-15",
        flag: "🇰🇷",
      },
      {
        name: "Australia",
        capital: "Canberra",
        population: 25499884,
        gdp: 1393000000000,
        region: "Oceania",
        lat: -25.2744,
        lon: 133.7751,
        currency: "AUD",
        languages: ["English"],
        area: 7692024,
        timezone: "UTC+8 to UTC+10:30",
        government: "Constitutional Monarchy",
        independence: "1901-01-01",
        flag: "🇦🇺",
        iso2: "AU",
      },
      {
        name: "Spain",
        capital: "Madrid",
        population: 46754778,
        gdp: 1394000000000,
        region: "Europe",
        lat: 40.4637,
        lon: -3.7492,
        currency: "EUR",
        languages: ["Spanish"],
        area: 505992,
        timezone: "UTC+1",
        government: "Constitutional Monarchy",
        independence: "1479 AD",
        flag: "🇪🇸",
        iso2: "ES",
      },
      {
        name: "Mexico",
        capital: "Mexico City",
        population: 128932753,
        gdp: 1269000000000,
        region: "North America",
        lat: 23.6345,
        lon: -102.5528,
        currency: "MXN",
        languages: ["Spanish"],
        area: 1964375,
        timezone: "UTC-6 to UTC-8",
        government: "Federal Republic",
        independence: "1821-09-27",
        flag: "🇲🇽",
        iso2: "MX",
      },
      {
        name: "Indonesia",
        capital: "Jakarta",
        population: 273523615,
        gdp: 1119000000000,
        region: "Asia",
        lat: -0.7893,
        lon: 113.9213,
        currency: "IDR",
        languages: ["Indonesian"],
        area: 1904569,
        timezone: "UTC+7 to UTC+9",
        government: "Republic",
        independence: "1945-08-17",
        flag: "🇮🇩",
      },
      {
        name: "Netherlands",
        capital: "Amsterdam",
        population: 17134872,
        gdp: 909000000000,
        region: "Europe",
        lat: 52.1326,
        lon: 5.2913,
        currency: "EUR",
        languages: ["Dutch"],
        area: 41850,
        timezone: "UTC+1",
        government: "Constitutional Monarchy",
        independence: "1581-07-26",
        flag: "🇳🇱",
      },
      {
        name: "Saudi Arabia",
        capital: "Riyadh",
        population: 34813871,
        gdp: 700000000000,
        region: "Asia",
        lat: 23.8859,
        lon: 45.0792,
        currency: "SAR",
        languages: ["Arabic"],
        area: 2149690,
        timezone: "UTC+3",
        government: "Absolute Monarchy",
        independence: "1932-09-23",
        flag: "🇸🇦",
      },
      {
        name: "Turkey",
        capital: "Ankara",
        population: 84339067,
        gdp: 761000000000,
        region: "Europe/Asia",
        lat: 38.9637,
        lon: 35.2433,
        currency: "TRY",
        languages: ["Turkish"],
        area: 783562,
        timezone: "UTC+3",
        government: "Republic",
        independence: "1923-10-29",
        flag: "🇹🇷",
      },
      {
        name: "Switzerland",
        capital: "Bern",
        population: 8654622,
        gdp: 752000000000,
        region: "Europe",
        lat: 46.8182,
        lon: 8.2275,
        currency: "CHF",
        languages: ["German", "French", "Italian"],
        area: 41285,
        timezone: "UTC+1",
        government: "Federal Republic",
        independence: "1291-08-01",
        flag: "🇨🇭",
      },
      {
        name: "Argentina",
        capital: "Buenos Aires",
        population: 45195774,
        gdp: 449663000000,
        region: "South America",
        lat: -38.4161,
        lon: -63.6167,
        currency: "ARS",
        languages: ["Spanish"],
        area: 2780400,
        timezone: "UTC-3",
        government: "Federal Republic",
        independence: "1816-07-09",
        flag: "🇦🇷",
        iso2: "AR",
      },
      {
        name: "Egypt",
        capital: "Cairo",
        population: 102334404,
        gdp: 404143000000,
        region: "Africa",
        lat: 26.0975,
        lon: 31.2357,
        currency: "EGP",
        languages: ["Arabic"],
        area: 1001449,
        timezone: "UTC+2",
        government: "Republic",
        independence: "1922-02-28",
        flag: "🇪🇬",
      },
      {
        name: "South Africa",
        capital: "Cape Town",
        population: 59308690,
        gdp: 419015000000,
        region: "Africa",
        lat: -30.5595,
        lon: 22.9375,
        currency: "ZAR",
        languages: ["Afrikaans", "English", "Zulu"],
        area: 1221037,
        timezone: "UTC+2",
        government: "Republic",
        independence: "1961-05-31",
        flag: "🇿🇦",
      },
      {
        name: "Nigeria",
        capital: "Abuja",
        population: 206139589,
        gdp: 432294000000,
        region: "Africa",
        lat: 9.082,
        lon: 8.6753,
        currency: "NGN",
        languages: ["English"],
        area: 923768,
        timezone: "UTC+1",
        government: "Federal Republic",
        independence: "1960-10-01",
        flag: "🇳🇬",
      },
      {
        name: "Thailand",
        capital: "Bangkok",
        population: 69799978,
        gdp: 543548000000,
        region: "Asia",
        lat: 15.87,
        lon: 100.9925,
        currency: "THB",
        languages: ["Thai"],
        area: 513120,
        timezone: "UTC+7",
        government: "Constitutional Monarchy",
        independence: "Never colonized",
        flag: "🇹🇭",
      },
      {
        name: "Vietnam",
        capital: "Hanoi",
        population: 97338579,
        gdp: 362638000000,
        region: "Asia",
        lat: 14.0583,
        lon: 108.2772,
        currency: "VND",
        languages: ["Vietnamese"],
        area: 331212,
        timezone: "UTC+7",
        government: "Communist State",
        independence: "1945-09-02",
        flag: "🇻🇳",
      },
      {
        name: "Poland",
        capital: "Warsaw",
        population: 37846611,
        gdp: 679442000000,
        region: "Europe",
        lat: 51.9194,
        lon: 19.1451,
        currency: "PLN",
        languages: ["Polish"],
        area: 312696,
        timezone: "UTC+1",
        government: "Republic",
        independence: "1918-11-11",
        flag: "🇵🇱",
      },
      {
        name: "Ukraine",
        capital: "Kyiv",
        population: 43733762,
        gdp: 200086000000,
        region: "Europe",
        lat: 48.3794,
        lon: 31.1656,
        currency: "UAH",
        languages: ["Ukrainian"],
        area: 603550,
        timezone: "UTC+2",
        government: "Republic",
        independence: "1991-08-24",
        flag: "🇺🇦",
      },
      {
        name: "Iran",
        capital: "Tehran",
        population: 83992949,
        gdp: 231289000000,
        region: "Asia",
        lat: 32.4279,
        lon: 53.688,
        currency: "IRR",
        languages: ["Persian"],
        area: 1648195,
        timezone: "UTC+3:30",
        government: "Islamic Republic",
        independence: "1979-04-01",
        flag: "🇮🇷",
      },
      {
        name: "Pakistan",
        capital: "Islamabad",
        population: 220892340,
        gdp: 347698000000,
        region: "Asia",
        lat: 30.3753,
        lon: 69.3451,
        currency: "PKR",
        languages: ["Urdu", "English"],
        area: 881913,
        timezone: "UTC+5",
        government: "Federal Republic",
        independence: "1947-08-14",
        flag: "🇵🇰",
      },
      {
        name: "Bangladesh",
        capital: "Dhaka",
        population: 164689383,
        gdp: 416265000000,
        region: "Asia",
        lat: 23.685,
        lon: 90.3563,
        currency: "BDT",
        languages: ["Bengali"],
        area: 147570,
        timezone: "UTC+6",
        government: "Republic",
        independence: "1971-03-26",
        flag: "🇧🇩",
      },
      {
        name: "Norway",
        capital: "Oslo",
        population: 5421241,
        gdp: 482175000000,
        region: "Europe",
        lat: 60.472,
        lon: 8.4689,
        currency: "NOK",
        languages: ["Norwegian"],
        area: 385207,
        timezone: "UTC+1",
        government: "Constitutional Monarchy",
        independence: "1905-06-07",
        flag: "🇳🇴",
      },
      {
        name: "Sweden",
        capital: "Stockholm",
        population: 10099265,
        gdp: 541220000000,
        region: "Europe",
        lat: 60.1282,
        lon: 18.6435,
        currency: "SEK",
        languages: ["Swedish"],
        area: 450295,
        timezone: "UTC+1",
        government: "Constitutional Monarchy",
        independence: "1523-06-06",
        flag: "🇸🇪",
      },
      {
        name: "Denmark",
        capital: "Copenhagen",
        population: 5792202,
        gdp: 356085000000,
        region: "Europe",
        lat: 56.2639,
        lon: 9.5018,
        currency: "DKK",
        languages: ["Danish"],
        area: 43094,
        timezone: "UTC+1",
        government: "Constitutional Monarchy",
        independence: "8th century",
        flag: "🇩🇰",
      },
      {
        name: "Finland",
        capital: "Helsinki",
        population: 5540720,
        gdp: 269654000000,
        region: "Europe",
        lat: 61.9241,
        lon: 25.7482,
        currency: "EUR",
        languages: ["Finnish", "Swedish"],
        area: 338424,
        timezone: "UTC+2",
        government: "Republic",
        independence: "1917-12-06",
        flag: "🇫🇮",
      },
      {
        name: "New Zealand",
        capital: "Wellington",
        population: 4822233,
        gdp: 249886000000,
        region: "Oceania",
        lat: -40.9006,
        lon: 174.886,
        currency: "NZD",
        languages: ["English", "Māori"],
        area: 268838,
        timezone: "UTC+12",
        government: "Constitutional Monarchy",
        independence: "1907-09-26",
        flag: "🇳🇿",
      },
      {
        name: "Chile",
        capital: "Santiago",
        population: 19116201,
        gdp: 317058000000,
        region: "South America",
        lat: -35.6751,
        lon: -71.543,
        currency: "CLP",
        languages: ["Spanish"],
        area: 756096,
        timezone: "UTC-3 to UTC-6",
        government: "Republic",
        independence: "1818-02-12",
        flag: "🇨🇱",
      },
      {
        name: "Peru",
        capital: "Lima",
        population: 32971854,
        gdp: 223249000000,
        region: "South America",
        lat: -9.19,
        lon: -75.0152,
        currency: "PEN",
        languages: ["Spanish", "Quechua"],
        area: 1285216,
        timezone: "UTC-5",
        government: "Republic",
        independence: "1821-07-28",
        flag: "🇵🇪",
      },
      {
        name: "Colombia",
        capital: "Bogotá",
        population: 50882891,
        gdp: 314458000000,
        region: "South America",
        lat: 4.5709,
        lon: -74.2973,
        currency: "COP",
        languages: ["Spanish"],
        area: 1141748,
        timezone: "UTC-5",
        government: "Republic",
        independence: "1810-07-20",
        flag: "🇨🇴",
      },
      {
        name: "Venezuela",
        capital: "Caracas",
        population: 28435940,
        gdp: 482359000000,
        region: "South America",
        lat: 6.4238,
        lon: -66.5897,
        currency: "VES",
        languages: ["Spanish"],
        area: 916445,
        timezone: "UTC-4",
        government: "Federal Republic",
        independence: "1811-07-05",
        flag: "🇻🇪",
      },
      {
        name: "Kenya",
        capital: "Nairobi",
        population: 53771296,
        gdp: 109116000000,
        region: "Africa",
        lat: -0.0236,
        lon: 37.9062,
        currency: "KES",
        languages: ["English", "Swahili"],
        area: 580367,
        timezone: "UTC+3",
        government: "Republic",
        independence: "1963-12-12",
        flag: "🇰🇪",
      },
      {
        name: "Morocco",
        capital: "Rabat",
        population: 36910560,
        gdp: 124017000000,
        region: "Africa",
        lat: 31.7917,
        lon: -7.0926,
        currency: "MAD",
        languages: ["Arabic", "Berber"],
        area: 446550,
        timezone: "UTC+1",
        government: "Constitutional Monarchy",
        independence: "1956-03-02",
        flag: "🇲🇦",
      },
    ];

    // Add comprehensive additional data for each country
    return countries.map((country) => ({
      ...country,
      // Environmental data
      environmentScore: Math.floor(Math.random() * 100),
      co2Emissions: Math.floor(Math.random() * 1000) + 100,
      renewableEnergy: Math.floor(Math.random() * 80) + 10,
      forestCoverage: Math.floor(Math.random() * 70) + 5,

      // Cultural data
      culturalSites: Math.floor(Math.random() * 20) + 1,
      festivals: Math.floor(Math.random() * 50) + 10,
      museums: Math.floor(Math.random() * 100) + 10,

      // Social indicators
      lifeExpectancy: Math.floor(Math.random() * 20) + 65,
      literacyRate: Math.floor(Math.random() * 30) + 70,
      internetUsers: Math.floor(Math.random() * 40) + 40,
      urbanPopulation: Math.floor(Math.random() * 60) + 30,

      // Economic indicators
      unemploymentRate: (Math.random() * 15 + 2).toFixed(1),
      inflationRate: (Math.random() * 10 + 1).toFixed(1),
      gdpPerCapita: Math.floor(country.gdp / country.population),

      // Quality of life
      happinessIndex: (Math.random() * 3 + 5).toFixed(1),
      corruptionIndex: Math.floor(Math.random() * 100),
      democracyIndex: (Math.random() * 10).toFixed(1),
      giniCoefficient: (Math.random() * 0.4 + 0.25).toFixed(2),
      humanDevelopmentIndex: (Math.random() * 0.3 + 0.6).toFixed(3),

      // Infrastructure
      internetSpeed: Math.floor(Math.random() * 100) + 10,
      roadQuality: Math.floor(Math.random() * 100),
      electricityAccess: Math.floor(Math.random() * 30) + 70,

      // Health
      healthcareIndex: Math.floor(Math.random() * 100),
      doctorsPerCapita: (Math.random() * 5 + 1).toFixed(1),
      hospitalBeds: (Math.random() * 10 + 2).toFixed(1),

      // Education
      educationIndex: Math.floor(Math.random() * 100),
      universities: Math.floor(Math.random() * 200) + 10,
      researchOutput: Math.floor(Math.random() * 1000) + 50,

      // Technology
      innovationIndex: Math.floor(Math.random() * 100),
      patents: Math.floor(Math.random() * 10000) + 100,
      techExports: Math.floor(Math.random() * 50) + 5,

      // Tourism
      touristArrivals: Math.floor(Math.random() * 50000000) + 1000000,
      tourismRevenue: Math.floor(Math.random() * 100000000000) + 1000000000,

      // Climate data
      averageTemp: Math.floor(Math.random() * 40) - 10,
      rainfall: Math.floor(Math.random() * 3000) + 200,
      climateZone: ["Tropical", "Temperate", "Arid", "Continental", "Polar"][
        Math.floor(Math.random() * 5)
      ],
    }));
  }

  getCountries() {
    return this.countries;
  }

  getCountryByName(name) {
    return this.countries.find(
      (country) => country.name.toLowerCase() === name.toLowerCase()
    );
  }

  async fetchLiveData(dataType) {
    switch (dataType) {
      case "weather":
        return this.generateWeatherData();
      case "population":
        return this.countries.map((c) => ({
          name: c.name,
          value: c.population,
        }));
      case "gdp":
        return this.countries.map((c) => ({ name: c.name, value: c.gdp }));
      case "environment":
        return this.countries.map((c) => ({
          name: c.name,
          value: c.environmentScore,
        }));
      case "culture":
        return this.countries.map((c) => ({
          name: c.name,
          value: c.culturalSites,
        }));
      default:
        return [];
    }
  }

  generateWeatherData() {
    return this.countries.map((country) => ({
      name: country.name,
      temperature: country.averageTemp + Math.floor(Math.random() * 10) - 5,
      humidity: Math.floor(Math.random() * 100),
      windSpeed: Math.floor(Math.random() * 30),
      condition: ["sunny", "cloudy", "rainy", "snowy"][
        Math.floor(Math.random() * 4)
      ],
    }));
  }

  getDataForVisualization(mode) {
    switch (mode) {
      case "population":
        return this.countries.map((c) => ({
          country: c.name,
          value: c.population,
          normalized:
            c.population / Math.max(...this.countries.map((x) => x.population)),
        }));
      case "gdp":
        return this.countries.map((c) => ({
          country: c.name,
          value: c.gdp,
          normalized: c.gdp / Math.max(...this.countries.map((x) => x.gdp)),
        }));
      case "environment":
        return this.countries.map((c) => ({
          country: c.name,
          value: c.environmentScore,
          normalized: c.environmentScore / 100,
        }));
      case "culture":
        return this.countries.map((c) => ({
          country: c.name,
          value: c.culturalSites,
          normalized:
            c.culturalSites /
            Math.max(...this.countries.map((x) => x.culturalSites)),
        }));
      default:
        return [];
    }
  }

  // Utility methods for data processing
  normalizeValue(value, min, max) {
    return (value - min) / (max - min);
  }

  formatNumber(num) {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + "B";
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  }

  formatCurrency(amount, currency) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  formatArea(area) {
    return area.toLocaleString() + " km²";
  }

  formatPercentage(value) {
    return value + "%";
  }
}
