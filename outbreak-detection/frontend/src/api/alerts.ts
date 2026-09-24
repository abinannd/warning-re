import { apiClient } from "./client";
import type { Alert, Advisory } from "../types/intelligence";

export const getAlerts = async (params?: { severity?: string; disease?: string; district?: string; limit?: number }): Promise<Alert[]> => {
    const { data } = await apiClient.get<Alert[]>("/alerts", { params });
    return data;
};

export const getAdvisory = async (): Promise<Advisory> => {
    const { data } = await apiClient.get<Advisory>("/advisory");
    return data;
};
