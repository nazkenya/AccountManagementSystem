<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ImportFromNcrmController extends Controller
{
    /**
     * POST /api/profiling/import-from-ncrm
     * - Cari kandidat di NCRM_ACCOUNT (latest per ACCOUNT_TEAM_NIK)
     * - Filter: segment RBS/DBS
     * - Exclude yang sudah ada di MASTER_DATA_AM_RSMESV2 (by NIK)
     * - Insert ke TEMP_PROFELING with STATUS_APPROVED = 'prosess approval'
     * - Insert one log row into LOG_MASTER_PROFILE_RSMES
     *
     * Request body: { user?: string } (optional)
     */
    public function store(Request $request)
    {
        $user = $request->input('user', auth()->user()->name ?? 'system');

        try {
            return DB::transaction(function () use ($user) {
                // 1) Prepare candidate query (latest per ACCOUNT_TEAM_NIK)
                $sub = DB::table('NCRM_ACCOUNT')
                    ->selectRaw('ACCOUNT_TEAM_NIK, MAX(ACCOUNT_CREATED) AS max_created')
                    ->whereNotNull('ACCOUNT_TEAM_NIK')
                    ->groupBy('ACCOUNT_TEAM_NIK');

                $candidates = DB::table('NCRM_ACCOUNT as A')
                    ->joinSub($sub, 't', function ($join) {
                        $join->on('A.ACCOUNT_TEAM_NIK', '=', 't.ACCOUNT_TEAM_NIK')
                             ->on('A.ACCOUNT_CREATED', '=', 't.max_created');
                    })
                    ->select(
                        DB::raw('A.ACCOUNT_TEAM_NIK AS NIK_AM_CA'),
                        DB::raw('A.ACCOUNT_TEAM_NAME AS NAMA_AM_CA'),
                        'A.REGION',
                        'A.WITEL'
                    )
                    ->whereNotNull('A.ACCOUNT_TEAM_NIK')
                    ->where(function ($q) {
                        $q->where('A.SEGMENT', 'like', '%RBS%')
                          ->orWhere('A.SEGMENT', '=', 'ERM RBS')
                          ->orWhere('A.SEGMENT', 'like', '%DBS%');
                    })
                    // exclude those already in MASTER_DATA_AM_RSMESV2 by NIK
                    ->whereNotExists(function ($q) {
                        $q->select(DB::raw(1))
                          ->from('MASTER_DATA_AM_RSMESV2 as B')
                          ->whereRaw('B.NIK_AM = A.ACCOUNT_TEAM_NIK');
                    })
                    ->get();

                if ($candidates->isEmpty()) {
                    // still create a log row (optional) — here we create a minimal log
                    $log = [
                        'ID_SALES' => null,
                        'NIK_AM' => null,
                        'NAMA_AM' => null,
                        'REGION' => null,
                        'WITEL' => null,
                        'LOG_USER' => $user,
                        'WORK_LOG' => DB::raw('SYSTIMESTAMP'),
                    ];
                    DB::table('LOG_MASTER_PROFILE_RSMES')->insert($log);

                    return response()->json([
                        'inserted' => [],
                        'log' => DB::table('LOG_MASTER_PROFILE_RSMES')->orderByDesc('WORK_LOG')->first(),
                        'message' => 'No new candidates.',
                    ]);
                }

                // 2) Filter out ones already present in TEMP_PROFELING (avoid duplicates)
                $toInsert = [];
                foreach ($candidates as $c) {
                    $nik = trim($c->NIK_AM_CA ?? '');
                    if ($nik === '') continue;

                    $existsInTemp = DB::table('TEMP_PROFELING')
                        ->whereRaw('NVL(NIK_AM, \'\') = ?', [$nik]) // NVL for Oracle null-safe
                        ->exists();

                    if ($existsInTemp) continue;

                    $idSales = 'TEMP_' . strtoupper(Str::random(8));

                    $toInsert[] = [
                        'ID_SALES' => $idSales,
                        'NIK_AM' => $nik,
                        'NAMA_AM' => $c->NAMA_AM_CA ?? null,
                        'REGION' => $c->REGION ?? null,
                        'WITEL' => $c->WITEL ?? null,
                        'STATUS_APPROVED' => 'prosess approval',
                    ];
                }

                // Bulk insert if any
                if (!empty($toInsert)) {
                    // DB::table()->insert() accepts array of rows
                    DB::table('TEMP_PROFELING')->insert($toInsert);
                }

                // Create log entry (record who ran the import)
                $logEntry = [
                    'ID_SALES' => null,
                    'NIK_AM' => null,
                    'NAMA_AM' => null,
                    'REGION' => null,
                    'WITEL' => null,
                    'LOG_USER' => $user,
                    'WORK_LOG' => DB::raw('SYSTIMESTAMP'),
                ];
                DB::table('LOG_MASTER_PROFILE_RSMES')->insert($logEntry);

                $lastLog = DB::table('LOG_MASTER_PROFILE_RSMES')->orderByDesc('WORK_LOG')->first();

                return response()->json([
                    'inserted' => $toInsert,
                    'log' => $lastLog,
                    'message' => count($toInsert) ? 'Inserted into TEMP_PROFELING' : 'No new rows inserted (already in TEMP).',
                ]);
            });
        } catch (\Exception $e) {
            // Helpful debug message: include DB error but be careful in production
            return response()->json([
                'error' => 'Import failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
