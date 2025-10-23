// src/services/validation.js
// Validation-related API helpers — fetchATM menggunakan getAMs() (axios)
import axios from "axios";

/**
 * Simple axios client for AMController (you provided earlier)
 * Keep baseURL same as your backend (http://localhost:8000/api)
 */
const apiAxios = axios.create({
  baseURL: "http://localhost:8000/api",
  timeout: 15000,
});

/**
 * getAMs()
 * Minimal wrapper axios -> returns array (normalizes {data: [...] } or array)
 */
export async function getAMs(fields = null) {
  try {
    const qs = fields && fields.length ? `?fields=${encodeURIComponent(fields.join(","))}` : "";
    const resp = await apiAxios.get(`/am${qs}`);
    const payload = resp.data;
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    // If backend returns object keyed by something else, try to guess
    return Array.isArray(payload) ? payload : [];
  } catch (err) {
    console.error("getAMs error:", err);
    return [];
  }
}

// -----------------------------------------------------------------------------
// apiFetch helper (uses relative /api path). Keep for other endpoints.
// If you prefer, change API_BASE to "http://localhost:8000/api".
const API_BASE = "/api";
async function apiFetch(path, opts = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...opts,
  });
  if (!res.ok) {
    const txt = await res.text();
    const err = new Error(`API error ${res.status}: ${txt}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}
// -----------------------------------------------------------------------------


/**
 * fetchATM
 * Mengambil data ATM (master AM) lewat getAMs() dan normalisasi bentuk data
 * supaya mudah dipakai di ValidationPanel (nik_am, id_sales, nama_am, region, witel, dll).
 * Accept optional fields array to request limited columns from backend.
 */
export async function fetchATM(fields = null) {
  try {
    const rows = await getAMs(fields);
    if (!Array.isArray(rows)) return [];

    // Normalize keys (terima variasi casing)
    return rows.map((r) => {
      const normalize = (k) =>
        r[k] ?? r[k.toUpperCase?.()] ?? r[k.toLowerCase?.()] ?? r[String(k).toUpperCase()] ?? r[String(k).toLowerCase()] ?? null;

      // prefer common names: id_sales, nik_am, nama_am, region/tr, witel
      const id_sales = r.ID_SALES ?? r.id_sales ?? r.id_sales?.toString?.() ?? normalize("id_sales") ?? normalize("ID_SALES");
      const nik_am = r.NIK_AM ?? r.nik_am ?? normalize("nik_am") ?? normalize("NIK_AM");
      const nama_am = r.NAMA_AM ?? r.nama_am ?? normalize("nama_am") ?? normalize("NAMA_AM");
      const region = r.TR ?? r.tr ?? r.REGION ?? r.region ?? normalize("tr") ?? normalize("region");
      const witel = r.WITEL ?? r.witel ?? normalize("witel") ?? normalize("WITEL");

      // include extra useful fields if present
      const notel = r.NOTEL ?? r.notel ?? r.TELDA ?? r.telda ?? null;
      const email = r.EMAIL ?? r.email ?? null;
      const am_aktif = r.AM_AKTIF ?? r.am_aktif ?? r.AM_AKTIF ?? r.am_aktif ?? null;

      return {
        ...r, // keep original fields so popover can read any column
        id_sales,
        nik_am,
        nama_am,
        region,
        witel,
        notel,
        email,
        am_aktif,
      };
    });
  } catch (e) {
    console.error("fetchATM error:", e);
    return [];
  }
}

/**
 * fetchCA
 * adjust endpoint if necessary - default tries GET /api/ca
 */
export async function fetchCA() {
  try {
    // panggil endpoint /api/ca
    const resp = await apiAxios.get('/ca');
    const payload = resp.data;

    const rows = Array.isArray(payload) ? payload : (payload && Array.isArray(payload.data) ? payload.data : []);
    return rows.map((r) => {
      // r sudah kita normalisasi di backend jadi kemungkinan key: nik_am, nama_am, region, witel, created_at
      return {
        nik_am: r.nik_am ?? r.NIK_AM ?? r.NIK_AM_CA ?? '',
        nama_am: r.nama_am ?? r.NAMA_AM ?? r.NAMA_AM_CA ?? '',
        region: r.region ?? r.REGION ?? '',
        witel: r.witel ?? r.WITEL ?? '',
        created_at: r.created_at ?? r.ACCOUNT_CREATED ?? null,
        // keep original raw if needed:
        raw: r,
      };
    });
  } catch (err) {
    console.error("fetchCA error:", err);
    return [];
  }
}

/**
 * fetchTEMP - GET /api/profiling/temp
 */
export async function fetchTEMP() {
  try {
    const data = await apiFetch("/profiling/temp");
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  } catch (e) {
    console.error("fetchTEMP error:", e);
    return [];
  }
}

/**
 * fetchLOG - GET /api/profiling/log
 */
export async function fetchLOG() {
  try {
    const data = await apiFetch("/profiling/log");
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  } catch (e) {
    console.error("fetchLOG error:", e);
    return [];
  }
}

/**
 * runValidateAM
 * POST /api/profiling/import-from-ncrm { user }
 * then fetch TEMP & LOG and return normalized temp + log
 */
export async function runValidateAM(user = "system") {
  try {
    await apiFetch("/profiling/import-from-ncrm", {
      method: "POST",
      body: JSON.stringify({ user }),
    });

    const [tempRaw, logRaw] = await Promise.all([fetchTEMP(), fetchLOG()]);

    const normalizedTemp = (tempRaw || []).map((r) => {
      // normalize column names (support many casings)
      const get = (k) => r[k] ?? r[k.toUpperCase?.()] ?? r[k.toLowerCase?.()] ?? null;
      return {
        id_sales: get("ID_SALES") ?? get("id_sales") ?? null,
        nik_am: get("NIK_AM") ?? get("nik_am") ?? "",
        nama_am: get("NAMA_AM") ?? get("nama_am") ?? "",
        region: get("REGION") ?? get("region") ?? get("TR") ?? get("tr") ?? "",
        witel: get("WITEL") ?? get("witel") ?? "",
        ts: get("created_at") ?? get("createdAt") ?? get("WORK_LOG") ?? null,
        sumber: "CA",
        status: "tidak valid",
        ...r,
      };
    });

    const logEntry = Array.isArray(logRaw) ? (logRaw.length ? logRaw[0] : null) : logRaw;

    return { temp: normalizedTemp, log: logEntry };
  } catch (e) {
    console.error("runValidateAM error:", e);
    throw e;
  }
}

/**
 * generateCommit
 * POST /api/profiling/commit { user, ids }
 */
export async function generateCommit(user = "system", ids = []) {
  try {
    const res = await apiFetch("/profiling/commit", {
      method: "POST",
      body: JSON.stringify({ user, ids }),
    });
    return res;
  } catch (e) {
    console.error("generateCommit error:", e);
    throw e;
  }
}

/**
 * diffCAtoATM - local diff helper (by nik_am or id_sales)
 */
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
