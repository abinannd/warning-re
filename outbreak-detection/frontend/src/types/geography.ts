export interface GeoJSONGeometry {
    type: "Point" | "Polygon" | "MultiPolygon";
    coordinates: any[];
}

export interface GeoJSONFeature {
    type: "Feature";
    geometry: GeoJSONGeometry | null;
    properties: {
        id: string;
        name?: string;
        district?: string;
        [key: string]: any;
    };
}

export interface GeoJSONFeatureCollection {
    type: "FeatureCollection";
    features: GeoJSONFeature[];
}

export interface District {
    id: string;
    name: string;
    talukCount: number;
}

export interface Taluk {
    id: string;
    name: string;
    districtId: string;
    districtName: string;
    latitude: number | null;
    longitude: number | null;
}
