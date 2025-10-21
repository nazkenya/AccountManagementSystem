// src/services/amService.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api", // ganti sesuai URL backend Laravel kamu
});

// Fungsi ambil data AM
export async function getAMs() {
  try {
    const response = await api.get("/am"); // pastikan route Laravel kamu: Route::get('/ams', ...)
    console.log("✅ Data AM dari backend:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Gagal fetch data AM:", error);
    return [];
  }
}
