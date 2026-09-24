import { apiClient } from "./client";
import type { District, Taluk, GeoJSONFeature, GeoJSONFeatureCollection } from "../types/geography";

export const getDistricts = async (): Promise<District[]> => {
    const { data } = await apiClient.get<District[]>("/geography/districts");
    return data;
};

export const getTaluks = async (params?: { district_id?: string }): Promise<Taluk[]> => {
    const { data } = await apiClient.get<Taluk[]>("/geography/taluks", { params });
    return data;
};

export const getTalukGeometry = async (id: string): Promise<GeoJSONFeature> => {
    const { data } = await apiClient.get<GeoJSONFeature>(`/geography/taluks/${id}/geometry`);
    return data;
};

export const getDistrictGeometry = async (id: string): Promise<GeoJSONFeature> => {
    const { data } = await apiClient.get<GeoJSONFeature>(`/geography/districts/${id}/geometry`);
    return data;
};

export const getKeralaGeometry = async (): Promise<GeoJSONFeatureCollection> => {
    const { data } = await apiClient.get<GeoJSONFeatureCollection>("/geography/kerala");
    return data;
};
