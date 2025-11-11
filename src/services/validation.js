import axios from "axios";

const API_BASE_FULL = "http://localhost:8000/api"; // sesuaikan bila perlu
const apiAxios = axios.create({
  baseURL: API_BASE_FULL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

/* ----------------------
   Helpers / Normalizer
   ---------------------- */
function safeGet(r = {}, key) {
  if (!r || !key) return null;
  if (Object.prototype.hasOwnProperty.call(r, key)) return r[key];
  const up = key.toUpperCase();
  if (Object.prototype.hasOwnProperty.call(r, up)) return r[up];
  const low = key.toLowerCase();
  if (Object.prototype.hasOwnProperty.call(r, low)) return r[low];
  return null;
}

function normalizeRowCommon(r = {}) {
  return {
    id_sales: safeGet(r, "ID_SALES") ?? safeGet(r, "id_sales") ?? null,
    nik_am: safeGet(r, "NIK_AM") ?? safeGet(r, "nik_am") ?? "",
    nama_am: safeGet(r, "NAMA_AM") ?? safeGet(r, "nama_am") ?? "",
    region: safeGet(r, "REGION") ?? safeGet(r, "region") ?? "",
    witel: safeGet(r, "WITEL") ?? safeGet(r, "witel") ?? "",
    status_approved: safeGet(r, "STATUS_APPROVED") ?? safeGet(r, "status_approved") ?? null,
    created_by: safeGet(r, "CREATED_BY") ?? safeGet(r, "created_by") ?? null,
    created_at: safeGet(r, "CREATED_AT") ?? safeGet(r, "created_at") ?? safeGet(r, "TS") ?? null,
    raw: r,
  };
}

/* ----------------------
   ATM (master) fetch
   Endpoint assumption: GET /api/am
   ---------------------- */
export async function getAMs(fields = null) {
  try {
    const qs = fields && Array.isArray(fields) && fields.length ? `?fields=${encodeURIComponent(fields.join(","))}` : "";
    const resp = await apiAxios.get(`/am${qs}`);
    const payload = resp.data ?? resp;
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return [];
  } catch (err) {
    console.error("getAMs error:", err);
    return [];
  }
}

export async function fetchATM(fields = null) {
  try {
    const rows = await getAMs(fields);
    if (!Array.isArray(rows)) return [];
    return rows.map((r) => {
      const base = normalizeRowCommon(r);
      // extra mapping if master uses different fields
      return {
        ...base,
        // keep original raw object for further needs
        raw: r,
      };
    });
  } catch (err) {
    console.error("fetchATM error:", err);
    return [];
  }
}

/* ----------------------
   CA fetch
   Endpoint: GET /api/ca
   ---------------------- */
export async function fetchCA() {
  try {
    const resp = await apiAxios.get("/ca");
    const payload = resp.data ?? resp;
    const rows = Array.isArray(payload) ? payload : (payload && Array.isArray(payload.data) ? payload.data : []);
    return rows.map((r) => ({
      nik_am: safeGet(r, "NIK_AM_CA") ?? safeGet(r, "NIK_AM") ?? safeGet(r, "nik_am") ?? "",
      nama_am: safeGet(r, "NAMA_AM_CA") ?? safeGet(r, "NAMA_AM") ?? safeGet(r, "nama_am") ?? "",
      region: safeGet(r, "REGION") ?? safeGet(r, "region") ?? "",
      witel: safeGet(r, "WITEL") ?? safeGet(r, "witel") ?? "",
      created_at: safeGet(r, "ACCOUNT_CREATED") ?? safeGet(r, "created_at") ?? null,
      raw: r,
    }));
  } catch (err) {
    console.error("fetchCA error:", err);
    return [];
  }
}

/* ----------------------
   TEMP fetch
   Endpoint: GET /api/profiling/temp
   ---------------------- */
export async function fetchTEMP() {
  try {
    const resp = await apiAxios.get("/profiling/temp");
    const payload = resp.data ?? resp;
    const rows = Array.isArray(payload) ? payload : (payload && Array.isArray(payload.data) ? payload.data : []);
    return rows.map((r) => normalizeRowCommon(r));
  } catch (err) {
    console.error("fetchTEMP error:", err);
    return [];
  }
} 

/* ----------------------
   LOG fetch
   Endpoint: GET /api/profiling/log
   Normalize log_user, work_log
   ---------------------- */
export async function fetchLOG() {
  try {
    const resp = await apiAxios.get("/profiling/log");
    const payload = resp.data ?? resp;
    const rows = Array.isArray(payload) ? payload : (payload && Array.isArray(payload.data) ? payload.data : []);
    return rows.map((r) => {
      const base = normalizeRowCommon(r);
      return {
        ...base,
        log_user: safeGet(r, "LOG_USER") ?? safeGet(r, "log_user") ?? null,
        work_log: safeGet(r, "WORK_LOG") ?? safeGet(r, "work_log") ?? safeGet(r, "created_at") ?? null,
        raw: r,
      };
    });
  } catch (err) {
    console.error("fetchLOG error:", err);
    return [];
  }
}

/* ----------------------
   runValidateAM (Compare)
   POST /api/profiling/import-from-ncrm { user }
   Accepts different result shapes and normalizes
   ---------------------- */
export async function runValidateAM(user = "system") {
  try {
    const resp = await apiAxios.post("/profiling/import-from-ncrm", { user });
    const payload = resp.data ?? resp;

    if (payload === null || payload === undefined) {
      throw new Error("Empty response from import endpoint");
    }
    if (payload.success === false) {
      const srv = payload.message || payload.error || JSON.stringify(payload);
      throw new Error(`Import failed: ${srv}`);
    }

    // normalize incoming rows under keys: rows | temp | data
    const rawRows = Array.isArray(payload.rows)
      ? payload.rows
      : Array.isArray(payload.temp)
      ? payload.temp
      : Array.isArray(payload.data)
      ? payload.data
      : [];

    const temp = rawRows.map((r) => {
      const base = normalizeRowCommon(r);
      return {
        ...base,
        // ensure default pending if missing
        status_approved: base.status_approved ?? "PENDING",
        created_by: base.created_by ?? user,
        raw: r,
      };
    });

    const inserted_count = payload.inserted_count ?? payload.inserted ?? payload.insertedRows ?? 0;
    const log = payload.log ?? null;
    return { temp, inserted_count, log };
  } catch (err) {
    // extract server error if available
    if (err?.response) {
      const status = err.response.status;
      const body = err.response.data;
      const serverMsg = (body && (body.message || body.error || JSON.stringify(body))) || err.response.statusText;
      throw new Error(`Import failed: API returned ${status} - ${serverMsg}`);
    }
    throw err;
  }
}

/* ----------------------
   generateCommit (Commit)
   POST /api/profiling/commit { user, ids }
   Returns backend payload; throws Error with server message on failure
   ---------------------- */
export async function generateCommit(user = "system", ids = []) {
  if (!Array.isArray(ids)) throw new Error("ids must be an array");
  try {
    const res = await apiAxios.post("/profiling/commit", { user, ids });
    const payload = res.data ?? res;
    if (payload && payload.success === false) {
      const srv = payload.message || payload.error || JSON.stringify(payload);
      throw new Error(`Commit failed: ${srv}`);
    }
    // success
    return payload;
  } catch (err) {
    if (err?.response) {
      const status = err.response.status;
      const body = err.response.data;
      const serverMsg = body && (body.message || body.error || JSON.stringify(body));
      const msg = serverMsg ? `Server: ${serverMsg}` : err.message;
      const out = new Error(`Request failed with status code ${status} - ${msg}`);
      out.response = err.response;
      throw out;
    }
    throw err;
  }
}

/* ----------------------
   diffCAtoATM - helper compare
   ---------------------- */
export function diffCAtoATM(ca = [], atm = []) {
  const atmKeys = new Set();
  (atm || []).forEach((a) => {
    const nik = (a.nik_am ?? a.NIK_AM ?? "").toString().trim().toLowerCase();
    const id = (a.id_sales ?? a.ID_SALES ?? "").toString().trim().toLowerCase();
    if (nik) atmKeys.add(`nik:${nik}`);
    if (id) atmKeys.add(`id:${id}`);
  });

  const valid = [];
  const missing = [];

  (ca || []).forEach((c) => {
    const nik = (c.nik_am ?? c.NIK_AM ?? "").toString().trim().toLowerCase();
    const id = (c.id_sales ?? c.ID_SALES ?? "").toString().trim().toLowerCase();
    const hasNik = nik ? atmKeys.has(`nik:${nik}`) : false;
    const hasId = id ? atmKeys.has(`id:${id}`) : false;
    if (hasNik || hasId) valid.push(c);
    else missing.push(c);
  });

  return { valid, missing };
}

/* ----------------------
   Default export not used; named exports above are used by components
   ---------------------- */
export default {
  fetchATM,
  fetchCA,
  fetchTEMP,
  fetchLOG,
  runValidateAM,
  generateCommit,
  diffCAtoATM,
};