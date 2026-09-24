export interface DashboardSummary {
    activeSurveillance: {
        districts: number;
        taluks: number;
    };
    reportingTaluks: number;
    activeSignals: number;
    candidateClusters: number;
}

export interface MapTaluk {
    id: string;
    name: string;
    districtId: string;
    districtName: string;
    latitude: number;
    longitude: number;
    disease: string;
    cases: number;
    previousCases: number;
    changePercent: number;
    riskLevel: string;
    temporalSignal: boolean;
    spatialSignal: boolean;
    clusterAssociation: boolean;
}

export interface MapDistrict {
    id: string;
    name: string;
    talukCount: number;
}

export interface MapData {
    taluks: MapTaluk[];
    districts: MapDistrict[];
    bounds: [[number, number], [number, number]];
}
