import urllib.request
import json
import os
import pandas as pd

def normalize_name(name):
    if not name: return ""
    return name.lower().replace(" ", "_")

def main():
    geo_dir = os.path.join(os.path.dirname(__file__), "geo")
    os.makedirs(geo_dir, exist_ok=True)

    # 1. Fetch Kerala & Districts from Datameet
    dist_url = "https://raw.githubusercontent.com/datameet/maps/master/Districts/Census_2011/2011_Dist.geojson"
    print("Fetching Datameet Districts...")
    req = urllib.request.Request(dist_url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            dist_data = json.loads(response.read().decode())
    except Exception as e:
        print("Failed to download districts:", e)
        return

    kerala_districts = []
    kerala_geom = []
    for f in dist_data.get("features", []):
        if f["properties"].get("ST_NM") == "Kerala":
            # Match to our 14 districts
            dname = f["properties"].get("DISTRICT")
            feat = {
                "type": "Feature",
                "properties": {
                    "id": normalize_name(dname),
                    "name": dname
                },
                "geometry": f.get("geometry")
            }
            kerala_districts.append(feat)

    print(f"Found {len(kerala_districts)} districts.")
    with open(os.path.join(geo_dir, "districts.geojson"), "w") as f:
        json.dump({"type": "FeatureCollection", "features": kerala_districts}, f)

    # We will use the district features combined as the Kerala outline if needed,
    # but the frontend doesn't actually draw a separate Kerala outline if districts are there.
    with open(os.path.join(geo_dir, "kerala.geojson"), "w") as f:
        json.dump({"type": "FeatureCollection", "features": kerala_districts}, f)

    # 2. Fetch Taluks (Sub-Districts) from Datameet
    subdist_url = "https://raw.githubusercontent.com/datameet/maps/master/Sub-Districts/Census_2011/2011_SubDist.geojson"
    print("Fetching Datameet Sub-Districts...")
    req2 = urllib.request.Request(subdist_url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req2) as response:
            subdist_data = json.loads(response.read().decode())
    except Exception as e:
        print("Failed to download subdistricts:", e)
        return

    kerala_subdist = [f for f in subdist_data.get("features", []) if f["properties"].get("ST_NM") == "Kerala"]

    auth_coords_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "coordinates", "Kerala_78_Taluks_Latitude_Longitude.xlsx")
    auth_df = pd.read_excel(auth_coords_path)
    auth_taluks = set(auth_df["Taluk"].str.strip().str.lower())
    
    matched_features = []
    unmatched_taluks = list(auth_taluks)
    
    for row in kerala_subdist:
        name = row["properties"].get("SUB_DIST")
        if not name:
            continue
        name_lower = str(name).lower().strip()
        
        # Match against our 78 taluks
        match = None
        for t in list(unmatched_taluks):
            if name_lower == t or name_lower in t or t in name_lower:
                match = t
                break
                
        if match:
            unmatched_taluks.remove(match)
            feat = {
                "type": "Feature",
                "properties": {
                    "id": normalize_name(match),
                    "name": match.title(),
                    "district": row["properties"].get("DISTRICT", "").title()
                },
                "geometry": row.get("geometry")
            }
            matched_features.append(feat)

    print(f"Matched {len(matched_features)} taluks out of {len(auth_taluks)}.")
    print(f"Unmatched Taluks: {unmatched_taluks}")
    
    with open(os.path.join(geo_dir, "taluks.geojson"), "w") as f:
        json.dump({"type": "FeatureCollection", "features": matched_features}, f)
        
    print("GeoJSON data saved successfully in api/geo/")

if __name__ == "__main__":
    main()
