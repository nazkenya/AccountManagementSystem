<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommitProfilingController extends Controller
{
    /**
     * POST /api/profiling/commit
     * Body: { "user": "role", "ids": ["TEMP_XXXX", "TEMP_YYYY"] }
     *
     * Fungsi:
     * - Ambil data dari TEMP_PROFELING sesuai ID_SALES
     * - Insert ke MASTER_DATA_AM_RSMESV2
     * - Update STATUS_APPROVED menjadi "committed"
     * - Tambah log ke LOG_MASTER_PROFILE_RSMES
     */
    public function store(Request $request)
    {
        $user = $request->input('user', 'system');
        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return response()->json(['error' => 'No IDs provided'], 400);
        }

        try {
            return DB::transaction(function () use ($user, $ids) {
                // 1️⃣ Ambil data dari TEMP_PROFELING
                $rows = DB::table('TEMP_PROFELING')
                    ->whereIn('ID_SALES', $ids)
                    ->get();

                if ($rows->isEmpty()) {
                    return response()->json(['error' => 'No matching TEMP rows found'], 404);
                }

                // 2️⃣ Insert ke MASTER_DATA_AM_RSMESV2
                $insertRows = [];
                foreach ($rows as $r) {
                    $insertRows[] = [
                        'ID_SALES'  => $r->ID_SALES,
                        'NIK_AM'    => $r->NIK_AM,
                        'NAMA_AM'   => $r->NAMA_AM,
                        'TR'        => $r->REGION,
                        'WITEL'     => $r->WITEL,
                        'AM_AKTIF'  => 'AM AKTIF', // bisa sesuaikan default aktif
                        'UPDATE_LOG'=> DB::raw('SYSTIMESTAMP'),
                        'CREATED_BY'=> $user,
                    ];
                }

                DB::table('MASTER_DATA_AM_RSMESV2')->insert($insertRows);

                // 3️⃣ Update STATUS_APPROVED di TEMP_PROFELING jadi “committed”
                DB::table('TEMP_PROFELING')
                    ->whereIn('ID_SALES', $ids)
                    ->update([
                        'STATUS_APPROVED' => 'committed',
                        'UPDATED_AT' => DB::raw('SYSTIMESTAMP'),
                        'UPDATED_BY' => $user,
                    ]);

                // 4️⃣ Catat log ke LOG_MASTER_PROFILE_RSMES
                foreach ($rows as $r) {
                    DB::table('LOG_MASTER_PROFILE_RSMES')->insert([
                        'ID_SALES' => $r->ID_SALES,
                        'NIK_AM'   => $r->NIK_AM,
                        'NAMA_AM'  => $r->NAMA_AM,
                        'REGION'   => $r->REGION,
                        'WITEL'    => $r->WITEL,
                        'LOG_USER' => $user,
                        'WORK_LOG' => DB::raw('SYSTIMESTAMP'),
                    ]);
                }

                // 5️⃣ Return hasil sukses
                $lastLog = DB::table('LOG_MASTER_PROFILE_RSMES')
                    ->orderByDesc('WORK_LOG')
                    ->first();

                return response()->json([
                    'success' => true,
                    'inserted' => count($insertRows),
                    'ids' => $ids,
                    'log' => $lastLog,
                ]);
            });
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Commit failed',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
