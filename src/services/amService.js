// src/services/amService.js
import api from "../api";

/**
 * Ambil data daftar Account Manager (AM)
 * @param {Array} fields - daftar kolom yang ingin diambil (opsional)
 * @returns {Promise<Array>}
 */
export async function getAMs(fields = []) {
  try {
    // Param untuk filter kolom jika digunakan
    const params = {};
    if (fields.length > 0) {
      params.fields = fields.join(",");
    }

    const response = await api.get("/am", { params });

    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    // Fallback kalau struktur API berubah
    if (Array.isArray(response.data)) {
      return response.data;
    }

    console.warn("Format response tidak dikenali:", response.data);
    return [];
  } catch (error) {
    console.error("❌ Gagal mengambil data AM:", error);
    return [];
  }
}
