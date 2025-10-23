<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProfilingController extends Controller
{
    // GET /api/ca
    public function caList(Request $request)
    {
        // Raw SQL -- menggunakan WITH + ROW_NUMBER untuk ambil row terbaru per ACCOUNT_TEAM_NIK
        // Pastikan sintaks cocok dengan Oracle DB kamu. Sesuaikan nama kolom/tabel jika perlu.
        $sql = <<<SQL
WITH tes AS (
  SELECT 
    A.ACCOUNT_TEAM_NIK AS nik_am,
    A.ACCOUNT_TEAM_NAME AS nama_am,
    A.REGION AS region,
    A.WITEL AS witel,
    A.ACCOUNT_CREATED AS created_at,
    ROW_NUMBER() OVER (PARTITION BY A.ACCOUNT_TEAM_NIK ORDER BY A.ACCOUNT_CREATED DESC) rn
  FROM NCRM_ACCOUNT A
  WHERE 
    A.ACCOUNT_TEAM_NIK IS NOT NULL
    AND (
      A.SEGMENT LIKE '%RBS%'
      OR A.SEGMENT = 'ERM RBS'
      OR A.SEGMENT LIKE '%DBS%'
    )
)
SELECT
  t.nik_am,
  t.nama_am,
  t.region,
  t.witel,
  t.created_at
FROM tes t
WHERE t.rn = 1
-- Exclude those that already exist in MASTER_DATA_AM_RSMESV2
AND NOT EXISTS (
  SELECT 1 FROM MASTER_DATA_AM_RSMESV2 m WHERE m.NIK_AM = t.nik_am
)
SQL;

        try {
            // Gunakan DB::select untuk raw query
            $rows = DB::select(DB::raw($sql));

            // DEBUG: kalau mau lihat di log (komen jika tidak perlu)
            Log::debug('CA rows fetched: count=' . count($rows));
            if (count($rows) > 0) {
                Log::debug('CA first row sample: ' . json_encode($rows[0]));
            }

            // DB::select mengembalikan array objek stdClass — kembalikan JSON
            return response()->json($rows);
        } catch (\Throwable $e) {
            Log::error('caList error: ' . $e->getMessage());
            return response()->json(['error' => 'Query failed', 'message' => $e->getMessage()], 500);
        }
    }
}
