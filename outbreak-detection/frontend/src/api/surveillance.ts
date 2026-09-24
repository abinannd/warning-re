import { apiClient } from "./client";
import type { SurveillanceCycle, SurveillanceReportRequest, SurveillanceReportResponse, SurveillanceValidationResponse, CycleStatus } from "../types/surveillance";

export const getCurrentCycle = async (): Promise<SurveillanceCycle> => {
    const { data } = await apiClient.get<SurveillanceCycle>("/surveillance/cycle/current");
    return data;
};

export const getCycleById = async (id: string): Promise<SurveillanceCycle> => {
    const { data } = await apiClient.get<SurveillanceCycle>(`/surveillance/cycle/${id}`);
    return data;
};

export const submitReport = async (report: SurveillanceReportRequest): Promise<SurveillanceReportResponse> => {
    const { data } = await apiClient.post<SurveillanceReportResponse>("/surveillance/reports", report);
    return data;
};

export const validateReport = async (report: SurveillanceReportRequest): Promise<SurveillanceValidationResponse> => {
    const { data } = await apiClient.post<SurveillanceValidationResponse>("/surveillance/reports/validate", report);
    return data;
};

export const getCycleStatus = async (id: string): Promise<CycleStatus> => {
    const { data } = await apiClient.get<CycleStatus>(`/surveillance/cycle/${id}/status`);
    return data;
};
