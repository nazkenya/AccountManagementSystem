// Validation services and utilities (final, connected to Laravel API)

export type AM = {
  nik_am: string
  id_sales?: string
  nama_am?: string
  region?: string
  witel?: string
  created_by?: string
}

export type TempRow = AM & { sumber: 'CA' | 'ATM'; status: 'valid' | 'tidak valid'; ts: string }

export type LogItem = {
  id: string
  actor: string
  action: 'VALIDATE_AM' | 'VALIDATE_KARYAWAN' | 'GENERATE' | 'SYNC' | 'CANCEL'
  count?: number
  duration_ms?: number
  ts: string
}

// ========================================================
// FETCH DATA DARI BACKEND
// ========================================================

export async function fetchATM(): Promise<AM[]> {
  const res = await fetch("/api/am");
  if (!res.ok) throw new Error("Gagal fetch data ATM");
  return await res.json();
}

export async function fetchCA(): Promise<AM[]> {
  const res = await fetch("/api/ca");
  if (!res.ok) throw new Error("Gagal fetch data CA");
  return await res.json();
}

// ========================================================
// COMPARE dan VALIDATE
// ========================================================

export async function runValidateAM(user = "manager") {
  const res = await fetch("http://localhost:8000/api/profiling/import-from-ncrm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user }),
  });

 if (!res.ok) {
    const text = await res.text();
    throw new Error(`Compare failed: ${text}`);
  }

   const temp = payload.rows || [];

  return {
    temp,
    inserted: payload.inserted_count || 0,
  };
}
// ========================================================
// VALIDASI KARYAWAN
// ========================================================
export async function runValidateKaryawan(actor: string) {
  const t0 = performance.now();
  const [karyawan, atm] = await Promise.all([fetch("/api/karyawan"), fetchATM()]);
  const karyawanData = await karyawan.json();
  const duration_ms = Math.round(performance.now() - t0);
  return {
    temp: karyawanData,
    summary: { total: karyawanData.length },
    log: <LogItem>{
      id: crypto.randomUUID(),
      actor,
      action: "VALIDATE_KARYAWAN",
      duration_ms,
      ts: new Date().toISOString(),
    },
  };
}

// ========================================================
// GENERATE KE AM MASTER
// ========================================================
export async function generateCommit(actor: string) {
  const res = await fetch("/api/profiling/commit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actor }),
  });
  if (!res.ok) throw new Error("Gagal generate commit");
  return await res.json();
}

// OPSIONAL
//export async function syncMasters(actor: string) {
  //const res = await fetch("/api/profiling/sync", {
    //method: "POST",
    //headers: { "Content-Type": "application/json" },
    //body: JSON.stringify({ actor }),
  //});
  //if (!res.ok) throw new Error("Sync gagal");
  //return await res.json();
//}

export async function cancelValidation(actor: string) {
  return {
    id: crypto.randomUUID(),
    actor,
    action: "CANCEL",
    ts: new Date().toISOString(),
  };
}