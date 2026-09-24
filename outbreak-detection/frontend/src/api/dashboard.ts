import { apiClient } from "./client";
import type { DashboardSummary, MapData } from "../types/dashboard";

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
    const { data } = await apiClient.get<DashboardSummary>("/dashboard/summary");
    return data;
};

export const getDashboardMap = async (params?: { disease?: string; date?: string; district?: string }): Promise<MapData> => {
    const { data } = await apiClient.get<MapData>("/dashboard/map", { params });
    return data;
};
