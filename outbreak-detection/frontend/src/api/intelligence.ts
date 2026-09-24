import { apiClient } from "./client";
import type { DiseaseTrends, TemporalSignal } from "../types/intelligence";

export const getTrends = async (params: {
    disease: string;
    district?: string;
    taluk?: string;
    period?: string;
    startDate?: string;
    endDate?: string;
}): Promise<DiseaseTrends> => {
    const { data } = await apiClient.get<DiseaseTrends>("/intelligence/trends", { params });
    return data;
};

export const getSignals = async (params?: { disease?: string; district?: string }): Promise<TemporalSignal[]> => {
    const { data } = await apiClient.get<TemporalSignal[]>("/intelligence/signals", { params });
    return data;
};
