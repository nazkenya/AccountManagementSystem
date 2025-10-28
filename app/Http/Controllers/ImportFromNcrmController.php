<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ImportFromNcrmController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->input('user', 'system');
        Log::info("🚀 ImportFromNcrmController::store called", ['user' => $user]);

        // FIX V3: Mengkonsolidasikan bind variable untuk CREATED_BY dan LOG_USER
        // menjadi satu nama (:log_user) untuk menghindari potensi ambiguitas atau bug parser
        // saat menggunakan INSERT ALL dengan dua bind variable bernama serupa.
        $sql = "
            INSERT ALL
                INTO TEMP_PROFELING (ID_SALES, NIK_AM, NAMA_AM, REGION, WITEL, STATUS_APPROVED, CREATED_BY)
                VALUES (ID_GEN, NIK_AM_CA, NAMA_AM_CA, REGION, WITEL, 'PENDING', :log_user)

                INTO LOG_MASTER_PROFILE_RSMES (ID_SALES, NIK_AM, NAMA_AM, REGION, WITEL, LOG_USER, WORK_LOG)
                VALUES (ID_GEN, NIK_AM_CA, NAMA_AM_CA, REGION, WITEL, :log_user, SYSTIMESTAMP)
            SELECT
                src.ID_GEN,
                src.NIK_AM_CA,
                src.NAMA_AM_CA,
                src.REGION,
                src.WITEL
            FROM (
                SELECT
                    'TEMP_' || ROWNUM AS ID_GEN,
                    t.NIK_AM_CA,
                    t.NAMA_AM_CA,
                    t.REGION,
                    t.WITEL,
                    t.rn
                FROM (
                    SELECT
                        A.ACCOUNT_TEAM_NIK AS NIK_AM_CA,
                        A.ACCOUNT_TEAM_NAME AS NAMA_AM_CA,
                        A.REGION,
                        A.WITEL,
                        ROW_NUMBER() OVER (PARTITION BY A.ACCOUNT_TEAM_NIK ORDER BY A.ACCOUNT_CREATED DESC) AS rn
                    FROM NCRM_ACCOUNT A
                    WHERE
                        A.ACCOUNT_TEAM_NIK IS NOT NULL
                        AND (A.SEGMENT LIKE '%RBS%' OR A.SEGMENT = 'ERM RBS' OR A.SEGMENT LIKE '%DBS%')
                        AND NOT EXISTS (
                            SELECT 1
                            FROM MASTER_DATA_AM_RSMESV2 B
                            WHERE B.NIK_AM = A.ACCOUNT_TEAM_NIK
                        )
                ) t
                WHERE t.rn = 1
            ) src
                                       

        ";
        
        // Memastikan bind variables sesuai dengan nama yang digunakan di SQL
        // Hanya perlu satu binding untuk :log_user
        $bindings = ['log_user' => $user];

        try {
            Log::debug("🧠 About to execute INSERT ALL with bindings: ", $bindings);
            DB::statement($sql, $bindings);
            Log::info("✅ Insert ALL executed successfully");

            // fetch recently inserted rows. We use :user to match the CREATED_BY column.
            $rows = DB::select("SELECT ID_SALES, NIK_AM, NAMA_AM, REGION, WITEL, STATUS_APPROVED FROM TEMP_PROFELING WHERE ID_SALES LIKE 'TEMP_%' AND CREATED_BY = :user ORDER BY ID_SALES DESC FETCH FIRST 50 ROWS ONLY", ['user' => $user]);

            return response()->json([
                'success' => true,
                'rows' => $rows,
                'count' => count($rows),
            ]);
        } catch (\Exception $e) {
            Log::error("❌ Insert ALL failed", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Oracle error',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
