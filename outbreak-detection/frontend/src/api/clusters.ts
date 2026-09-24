import { apiClient } from "./client";
import type { Cluster } from "../types/clusters";

export const getClusters = async (params?: { disease?: string; district?: string; date?: string }): Promise<Cluster[]> => {
    const { data } = await apiClient.get<Cluster[]>("/clusters", { params });
    return data;
};

export const getClusterById = async (id: string): Promise<Cluster> => {
    const { data } = await apiClient.get<Cluster>(`/clusters/${id}`);
    return data;
};
