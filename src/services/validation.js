// src/services/validation.js
import axios from "axios";

const API_BASE_FULL = "http://localhost:8000/api"; // pastikan sesuai backend
const apiAxios = axios.create({
 baseURL: API_BASE_FULL,
});
async function fetchJson(url) {
 const res = await fetch(url);
 if (!res.ok) {
   const txt = await res.text();
 throw new Error(txt || `HTTP ${res.status}`);
 }
 return res.json();
}

export async function getAMs(fields = null) {
  try {
    const qs = fields && fields.length ? `?fields=${encodeURIComponent(fields.join(","))}` : "";
    const resp = await apiAxios.get(`/am${qs}`);
    const payload = resp.data;
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return Array.isArray(payload) ? payload : [];
  } catch (err) {
    console.error("getAMs error:", err);
    return [];
  }
}

/** -------------------------
 * fetchATM - endpoint /api/am
 * ------------------------- */
export async function fetchATM(fields = null) {
  try {
    const rows = await getAMs(fields);
    if (!Array.isArray(rows)) return [];

    return rows.map((r) => {
      const get = (k) => {
        if (!r) return null;
        return r[k] ?? r[k.toUpperCase?.()] ?? r[k.toLowerCase?.()] ?? null;
      };

      const id_sales = get("ID_SALES") ?? get("id_sales") ?? null;
      const nik_am = get("NIK_AM") ?? get("nik_am") ?? "";
      const nama_am = get("NAMA_AM") ?? get("nama_am") ?? "";
      const region = get("TR") ?? get("tr") ?? get("REGION") ?? get("region") ?? "";
      const witel = get("WITEL") ?? get("witel") ?? "";

      return {
        ...r,
        id_sales,
        nik_am,
        nama_am,
        region,
        witel,
      };
    });
  } catch (e) {
    console.error("fetchATM error:", e);
    return [];
  }
}

/** -------------------------
 * fetchCA - endpoint /api/ca
 * ------------------------- */
export async function fetchCA() {
  try {
    const resp = await apiAxios.get("/ca");
    const payload = resp.data;
    const rows = Array.isArray(payload) ? payload : (payload && Array.isArray(payload.data) ? payload.data : []);
    return rows.map((r) => ({
      nik_am: r.NIK_AM_CA ?? r.nik_am ?? r.NIK_AM ?? "",
      nama_am: r.NAMA_AM_CA ?? r.nama_am ?? r.NAMA_AM ?? "",
      region: r.REGION ?? r.region ?? "",
      witel: r.WITEL ?? r.witel ?? "",
      created_at: r.ACCOUNT_CREATED ?? r.created_at ?? null,
      raw: r,
    }));
  } catch (err) {
    console.error("fetchCA error:", err);
    return [];
  }
}

/** -------------------------
 * fetchTEMP - GET /api/profiling/temp
 * ------------------------- */
export async function fetchTEMP() {
  try {
    const resp = await apiAxios.get("/profiling/temp");
    const payload = resp.data;
    const rows = Array.isArray(payload) ? payload : (payload && Array.isArray(payload.data) ? payload.data : []);
    return rows.map((r) => {
      const get = (k) => r[k] ?? r[k?.toUpperCase?.()] ?? r[k?.toLowerCase?.()] ?? null;
      return {
        id_sales: get("ID_SALES") ?? get("id_sales") ?? null,
        nik_am: get("NIK_AM") ?? get("nik_am") ?? "",
        nama_am: get("NAMA_AM") ?? get("nama_am") ?? "",
        region: get("REGION") ?? get("region") ?? "",
        witel: get("WITEL") ?? get("witel") ?? "",
        status_approved: get("STATUS_APPROVED") ?? get("status_approved") ?? null,
        created_by: get("CREATED_BY") ?? get("created_by") ?? "manager",
        created_at: get("CREATED_AT") ?? get("created_at") ?? get("TS") ?? null,
        raw: r,
      };
    });
  } catch (err) {
    console.error("fetchTEMP error:", err);
    return [];
  }
}

/** -------------------------
 * fetchLOG - GET /api/profiling/log
 * Normalize: LOG_USER, WORK_LOG (timestamp), plus same identification columns
 * ------------------------- */
export async function fetchLOG() {
  try {
    const resp = await apiAxios.get("/profiling/log");
    const payload = resp.data;
    const rows = Array.isArray(payload) ? payload : (payload && Array.isArray(payload.data) ? payload.data : []);
    return rows.map((r) => {
      const get = (k) => r[k] ?? r[k?.toUpperCase?.()] ?? r[k?.toLowerCase?.()] ?? null;
      return {
        id_sales: get("ID_SALES") ?? get("id_sales") ?? null,
        nik_am: get("NIK_AM") ?? get("nik_am") ?? "",
        nama_am: get("NAMA_AM") ?? get("nama_am") ?? "",
        region: get("REGION") ?? get("region") ?? "",
        witel: get("WITEL") ?? get("witel") ?? "",
        log_user: get("LOG_USER") ?? get("log_user") ?? "",
        work_log: get("WORK_LOG") ?? get("work_log") ?? get("created_at") ?? null,
        raw: r,
      };
    });
  } catch (err) {
    console.error("fetchLOG error:", err);
    return [];
  }
}

/** -------------------------
 * runValidateAM
 * POST /api/profiling/import-from-ncrm then fetch TEMP & LOG
 * return { temp, log } where temp is normalized as above
 * ------------------------- */
export async function runValidateAM(user = "manager") {
  try {
    const resp = await apiAxios.post("/profiling/import-from-ncrm", { user });
    
    const payload = resp.data;

    if (payload.success === false) {  
        throw new Error(`Import failed: ${payload.message || 'Check Laravel log for details'}`);
    }
        const temp = (payload.rows || []).map((r) => {
        const get = (k) => r[k] ?? r[k?.toUpperCase?.()] ?? r[k?.toLowerCase?.()] ?? null;
        
        return {
            id_sales: get("ID_SALES") ?? get("id_sales") ?? null,
            nik_am: get("NIK_AM") ?? get("nik_am") ?? "",
            nama_am: get("NAMA_AM") ?? get("nama_am") ?? "",
            region: get("REGION") ?? get("region") ?? "",
            witel: get("WITEL") ?? get("witel") ?? "",
            status_approved: get("STATUS_APPROVED") ?? get("status_approved") ?? 'PENDING', 
            created_by: user,
            created_at: get("CREATED_AT") ?? get("created_at") ?? get("TS") ?? null,
            raw: r,
        };
    });

    return { temp, inserted: payload.inserted };
  } catch (error) {
    // Ubah format error agar konsisten jika ada kegagalan Axios atau throw di atas
    if (error.response) {
      // Error dari API (misalnya status 500)
      throw new Error(`Import failed: API returned ${error.response.status} - ${error.response.data?.message || 'Server error'}`);
    } 
    // Jika bukan error Axios, biarkan error asli (Import failed: ...) diteruskan
    throw error;
  }
}

/** -------------------------
 * generateCommit: POST /api/profiling/commit { user, ids }
 * ------------------------- */
export async function generateCommit(user = "system", ids = []) {
  try {
    const res = await apiAxios.post("/profiling/commit", { user, ids });
    return res.data;
  } catch (e) {
    console.error("generateCommit error:", e);
    throw e;
  }
}

/** -------------------------
 * diffCAtoATM - client-side comparer (by nik or id)
 * ------------------------- */
export function diffCAtoATM(ca = [], atm = []) {
  const atmKeys = new Set(
    (atm || [])
      .map((a) => {
        const nik = (a.nik_am ?? a.NIK_AM ?? "").toString().trim().toLowerCase();
        const id = (a.id_sales ?? a.ID_SALES ?? "").toString().trim().toLowerCase();
        return nik || id || null;
      })
      .filter(Boolean)
  );

  const valid = [];
  const missing = [];

  (ca || []).forEach((c) => {
    const nik = (c.nik_am ?? c.NIK_AM ?? "").toString().trim().toLowerCase();
    const id = (c.id_sales ?? c.ID_SALES ?? "").toString().trim().toLowerCase();
    const key = nik || id || null;
    if (!key) {
      missing.push(c);
      return;
    }
    if (atmKeys.has(key)) valid.push(c);
    else missing.push(c);
  });

  return { valid, missing };
}
