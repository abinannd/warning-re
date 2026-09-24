export interface SurveillanceCycle {
    id: string;
    startTime: string;
    endTime: string;
    status: string;
    reportsReceived: number;
    taluksReporting: number;
    lastUpdate: string;
}

export interface SurveillanceReportRequest {
    districtId?: string;
    talukId?: string;
    disease?: string;
    newCases?: number;
    [key: string]: any;
}

export interface SurveillanceReportResponse {
    reportId: string;
    district: string;
    taluk: string;
    disease: string;
    newCases: number;
    cycleId: string;
    status: string;
}

export interface SurveillanceValidationResponse extends SurveillanceReportRequest {
    districtName: string;
    talukName: string;
    cycleId: string;
}

export interface CycleStatus {
    totalReports: number;
    taluksReporting: number;
    diseasesReported: string[];
}
