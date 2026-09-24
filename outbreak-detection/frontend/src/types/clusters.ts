export interface Cluster {
    id: string;
    disease: string;
    taluks: string[];
    timeWindow: {
        start: string;
        end: string;
    };
    totalCases: number;
    spatialConcentration: number;
    temporalSignal: number;
    hotspot: string;
    epicentre: {
        latitude: number;
        longitude: number;
    } | null;
    geometry: null;
}
