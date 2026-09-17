import osmnx as ox
import os
import json
import pandas as pd
import time

def normalize_name(name):
    if not name: return ""
    return name.lower().replace(" ", "_")

def main():
    ox.settings.use_cache = True
    ox.settings.log_console = True
    
    geo_dir = os.path.join(os.path.dirname(__file__), "geo")
    os.makedirs(geo_dir, exist_ok=True)
    
    print("Fetching Kerala state boundary...")
    try:
        kerala = ox.geocode_to_gdf("Kerala, India")
        kerala_geojson = json.loads(kerala.to_json())
        with open(os.path.join(geo_dir, "kerala.geojson"), "w") as f:
            json.dump(kerala_geojson, f)
    except Exception as e:
        print("Failed to get Kerala boundary", e)
        
    print("Fetching Kerala districts...")
    districts = [
        "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam", 
        "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode", 
        "Wayanad", "Kannur", "Kasaragod"
    ]
    
    district_features = []
    for d in districts:
        try:
            time.sleep(1) # Be nice to nominatim
            gdf = ox.geocode_to_gdf(f"{d} District, Kerala, India")
            feat = json.loads(gdf.to_json())["features"][0]
            feat["properties"]["id"] = normalize_name(d)
            feat["properties"]["name"] = d
            district_features.append(feat)
            print(f"Fetched {d}")
        except Exception as e:
            print(f"Failed to fetch {d}: {e}")
            
    with open(os.path.join(geo_dir, "districts.geojson"), "w") as f:
        json.dump({"type": "FeatureCollection", "features": district_features}, f)

    print("Fetching Kerala taluks...")
    auth_coords_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "coordinates", "Kerala_78_Taluks_Latitude_Longitude.xlsx")
    auth_df = pd.read_excel(auth_coords_path)
    
    matched_features = []
    unmatched_taluks = []
    
    for _, row in auth_df.iterrows():
        t = str(row["Taluk"]).strip()
        try:
            time.sleep(1) # Be nice to nominatim
            # Attempt 1: Taluk, District, Kerala
            try:
                gdf = ox.geocode_to_gdf(f"{t} Taluk, Kerala, India")
            except Exception:
                try:
                    gdf = ox.geocode_to_gdf(f"{t}, Kerala, India")
                except Exception:
                    print(f"Failed entirely for {t}")
                    unmatched_taluks.append(t)
                    continue

            feat = json.loads(gdf.to_json())["features"][0]
            feat["properties"]["id"] = normalize_name(t)
            feat["properties"]["name"] = t.title()
            feat["properties"]["district"] = str(row.get("District", "")).title()
            matched_features.append(feat)
            print(f"Fetched {t}")
        except Exception as e:
            print(f"Error for {t}: {e}")
            unmatched_taluks.append(t)

    print(f"Matched {len(matched_features)} taluks out of {len(auth_df)}.")
    if unmatched_taluks:
        print(f"Unmatched Taluks: {unmatched_taluks}")
        
    with open(os.path.join(geo_dir, "taluks.geojson"), "w") as f:
        json.dump({"type": "FeatureCollection", "features": matched_features}, f)
        
    print("GeoJSON data saved successfully in api/geo/")

if __name__ == "__main__":
    main()
