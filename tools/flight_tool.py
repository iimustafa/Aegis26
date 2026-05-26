from tools.tavily_tool import tavily_search
import re

CITY_TO_AIRPORT = {
    "dammam": ("Dammam", "DMM"),
    "الدمام": ("Dammam", "DMM"),
    "riyadh": ("Riyadh", "RUH"),
    "الرياض": ("Riyadh", "RUH"),
    "jeddah": ("Jeddah", "JED"),
    "جدة": ("Jeddah", "JED"),
    "khobar": ("Khobar", "DMM"),
    "الخبر": ("Khobar", "DMM"),
    "madinah": ("Madinah", "MED"),
    "المدينة": ("Madinah", "MED"),
    "abha": ("Abha", "AHB"),
    "أبها": ("Abha", "AHB"),
    "tabuk": ("Tabuk", "TUU"),
    "تبوك": ("Tabuk", "TUU"),
}

CITY_TO_DEST_AIRPORT = {
    "Mexico City": ("Mexico City", "MEX"),
    "Guadalajara (Zapopan)": ("Guadalajara", "GDL"),
    "Monterrey (Guadalupe)": ("Monterrey", "MTY"),
    "Miami (Miami Gardens)": ("Miami", "MIA"),
    "Los Angeles (Inglewood)": ("Los Angeles", "LAX"),
    "Vancouver": ("Vancouver", "YVR"),
    "Toronto": ("Toronto", "YYZ"),
    "Dallas (Arlington)": ("Dallas", "DFW"),
    "Houston": ("Houston", "IAH"),
    "Seattle": ("Seattle", "SEA"),
    "Atlanta": ("Atlanta", "ATL"),
    "Kansas City": ("Kansas City", "MCI"),
    "Boston (Foxborough)": ("Boston", "BOS"),
    "Philadelphia": ("Philadelphia", "PHL"),
    "New York/New Jersey (East Rutherford)": ("New York", "JFK"),
    "San Francisco Bay Area (Santa Clara)": ("San Francisco", "SFO"),
}


def detect_origin(query: str):
    q = query.lower()

    if "departure city:" in q:
        line = q.split("departure city:")[1].split("\n")[0].strip()
        for key, value in CITY_TO_AIRPORT.items():
            if key.lower() == line.lower():
                return value

    for key, value in CITY_TO_AIRPORT.items():
        if key.lower() in q:
            return value

    return ("Dammam", "DMM")


def search_flights(query: str, match_info: dict | None = None):
    origin_city, origin_airport = detect_origin(query)

    if match_info:
        city = match_info.get("city", "Mexico City")
        dest_city, dest_airport = CITY_TO_DEST_AIRPORT.get(
            city,
            ("Mexico City", "MEX")
        )
        date_text = match_info.get("date", "June 2026")
    else:
        dest_city, dest_airport = ("Mexico City", "MEX")
        date_text = "June 2026"

    search_query = f"""
    cheapest real flight prices {origin_city} {origin_airport} to {dest_city} {dest_airport}
    {date_text} economy class SAR Google Flights Skyscanner Expedia Kayak
    """

    results = tavily_search(search_query)

    return {
    "origin_city": origin_city,
    "origin_airport": origin_airport,
    "destination_city": dest_city,
    "destination_airport": dest_airport,
    "date": date_text,
    "results": results
}