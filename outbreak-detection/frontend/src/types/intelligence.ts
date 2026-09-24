export interface TechnicalDetails {
    model: string;
    temporalAnalysis: string;
    spatialAnalysis: string;
    clusterMethod: string;
    inputPeriod: string;
    trainingValidation: string;
    modelVersion: string;
}

export interface TemporalSignal {
    disease: string;
    taluk: string;
    district: string;
    detectionPeriod: {
        start: string;
        end: string;
    };
    observedActivity: number;
    expectedBaseline: number;
    signalDetected: boolean;
    technicalDetails: TechnicalDetails;
}

export interface TrendDataPoint {
    date: string;
    cases: number;
}

export interface DiseaseTrends {
    disease: string;
    district: string | null;
    taluk: string | null;
    data: TrendDataPoint[];
}

export interface Alert {
    id: string;
    severity: string;
    disease: string;
    district: string;
    taluk: string;
    date: string;
    explanation: string;
    recommendedActions: string[];
}

export interface Advisory {
    title: string;
    whatIsHappening: string;
    where: string;
    whatShouldResidentsDo: string[];
    whenMedicalAttention: string;
    source: string;
    updateDate: string;
}
