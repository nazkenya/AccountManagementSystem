// Validation services and utilities
// TODO: Replace mock implementations with real API calls

export type AM = {
  nik_am: string
  id_sales?: string
  nama_am?: string
  region?: string
  witel?: string
  updated_at?: string
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

// Mock fetchers
export async function fetchATM(): Promise<AM[]> {
  // TODO: GET /api/master/atm
  return [
    { nik_am: '1001', id_sales: 'S-01', nama_am: 'Budi Santoso', region: 'Jakarta', witel: 'Jaksel' },
    { nik_am: '1002', id_sales: 'S-02', nama_am: 'Siti Nurhaliza', region: 'Bandung', witel: 'Bandung' },
    { nik_am: '1003', id_sales: 'S-03', nama_am: 'Ahmad Wijaya', region: 'Surabaya', witel: 'Surabaya' },
  ]
}

export async function fetchCA(): Promise<AM[]> {
  // TODO: GET /api/master/ca
  return [
    { nik_am: '1001', id_sales: 'S-01', nama_am: 'Budi Santoso', region: 'Jakarta', witel: 'Jaksel' },
    { nik_am: '9999', id_sales: 'S-99', nama_am: 'Ghost User', region: 'Unknown', witel: '-' },
    { nik_am: '', id_sales: 'S-00', nama_am: 'Missing NIK', region: 'Unknown', witel: '-' },
  ]
}

export async function fetchKaryawan(): Promise<AM[]> {
  // Simulate an employee dataset similar shape
  return [
    { nik_am: '2001', id_sales: 'K-01', nama_am: 'Karyawan A', region: 'Jakarta', witel: 'Jaksel' },
    { nik_am: '1002', id_sales: 'S-02', nama_am: 'Siti Nurhaliza', region: 'Bandung', witel: 'Bandung' },
  ]
}

// Diff utilities
export function diffCAtoATM(ca: AM[], atm: AM[]) {
  const now = new Date().toISOString()
  const atmKeys = new Set(
    atm
      .map((a) => (a.nik_am && a.nik_am.trim() ? `nik:${a.nik_am.trim()}` : a.id_sales ? `id:${a.id_sales}` : ''))
      .filter(Boolean)
  )

  const resultValid: TempRow[] = []
  const resultInvalid: TempRow[] = []

  for (const row of ca) {
    const nik = row.nik_am?.trim()
    const id = row.id_sales?.trim()
    const hasKey = nik ? `nik:${nik}` : id ? `id:${id}` : ''

    if (!nik && !id) {
      resultInvalid.push({ ...row, sumber: 'CA', status: 'tidak valid', ts: now })
      continue
    }

    if (hasKey && atmKeys.has(hasKey)) {
      resultValid.push({ ...row, sumber: 'CA', status: 'valid', ts: now })
    } else {
      resultInvalid.push({ ...row, sumber: 'CA', status: 'tidak valid', ts: now })
    }
  }

  return { valid: resultValid, invalid: resultInvalid }
}

export function diffKaryawanToATM(karyawan: AM[], atm: AM[]) {
  return diffCAtoATM(karyawan, atm)
}

// Actions (mock)
export async function runValidateAM(actor: string) {
  const t0 = performance.now()
  const [ca, atm] = await Promise.all([fetchCA(), fetchATM()])
  const { valid, invalid } = diffCAtoATM(ca, atm)
  const duration_ms = Math.round(performance.now() - t0)
  return {
    temp: [...valid, ...invalid],
    summary: { total: ca.length, valid: valid.length, invalid: invalid.length },
    log: <LogItem>{
      id: crypto.randomUUID(),
      actor,
      action: 'VALIDATE_AM',
      count: invalid.length,
      duration_ms,
      ts: new Date().toISOString(),
    },
  }
}

export async function runValidateKaryawan(actor: string) {
  const t0 = performance.now()
  const [karyawan, atm] = await Promise.all([fetchKaryawan(), fetchATM()])
  const { valid, invalid } = diffKaryawanToATM(karyawan, atm)
  const duration_ms = Math.round(performance.now() - t0)
  return {
    temp: [...valid, ...invalid],
    summary: { total: karyawan.length, valid: valid.length, invalid: invalid.length },
    log: <LogItem>{
      id: crypto.randomUUID(),
      actor,
      action: 'VALIDATE_KARYAWAN',
      count: invalid.length,
      duration_ms,
      ts: new Date().toISOString(),
    },
  }
}

export async function generateCommit(actor: string) {
  // TODO: POST /api/validation/generate
  return <LogItem>{
    id: crypto.randomUUID(),
    actor,
    action: 'GENERATE',
    ts: new Date().toISOString(),
  }
}

export async function syncMasters(actor: string) {
  // TODO: POST /api/validation/sync
  return <LogItem>{
    id: crypto.randomUUID(),
    actor,
    action: 'SYNC',
    ts: new Date().toISOString(),
  }
}

export async function cancelValidation(actor: string) {
  // TODO: POST /api/validation/cancel
  return <LogItem>{
    id: crypto.randomUUID(),
    actor,
    action: 'CANCEL',
    ts: new Date().toISOString(),
  }
}
