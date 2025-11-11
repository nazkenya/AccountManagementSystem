<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ImportFromNcrmController extends Controller
{
    /**
     * Import dari NCRM -> TEMP_PROFELING + LOG_MASTER_PROFILE_RSMES
     * - TEMP_PROFELING: set CREATED_BY (user) dan CREATED_AT = SYSTIMESTAMP
     * - LOG_MASTER_PROFILE_RSMES: set LOG_USER (user) dan WORK_LOG = SYSTIMESTAMP, STATUS_APPROVED = 'PENDING'
     * Uses positional placeholders (?) for OCI8 compatibility.
     */
    public function store(Request $request)
    {
        $user = $request->input('user', 'system');
        Log::info("ImportFromNcrmController::store called", ['user' => $user]);

        // count before
        try {
            $beforeRow = DB::selectOne(
                "SELECT COUNT(*) AS CNT FROM TEMP_PROFELING WHERE ID_SALES LIKE 'TEMP_%' AND CREATED_BY = ?",
                [$user]
            );
            $beforeCount = (int) ($beforeRow->CNT ?? $beforeRow->cnt ?? 0);
        } catch (\Throwable $e) {
            Log::warning("Could not get beforeCount: " . $e->getMessage());
            $beforeCount = 0;
        }

        // INSERT ALL: ke TEMP_PROFELING (dengan CREATED_AT) dan LOG_MASTER_PROFILE_RSMES
        $sql = "
            INSERT ALL
                INTO TEMP_PROFELING (ID_SALES, NIK_AM, NAMA_AM, REGION, WITEL, STATUS_APPROVED, CREATED_BY, CREATED_AT)
                VALUES (ID_GEN, NIK_AM_CA, NAMA_AM_CA, REGION, WITEL, 'PENDING', ?, SYSTIMESTAMP)

                INTO LOG_MASTER_PROFILE_RSMES (ID_SALES, NIK_AM, NAMA_AM, REGION, WITEL, LOG_USER, WORK_LOG, STATUS_APPROVED)
                VALUES (ID_GEN, NIK_AM_CA, NAMA_AM_CA, REGION, WITEL, ?, SYSTIMESTAMP, 'PENDING')
            SELECT
                ID_GEN,
                NIK_AM_CA,
                NAMA_AM_CA,
                REGION,
                WITEL
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
                            SELECT 1 FROM MASTER_DATA_AM_RSMESV2 B WHERE B.NIK_AM = A.ACCOUNT_TEAM_NIK
                        )
                        AND NOT EXISTS (
                            SELECT 1 FROM TEMP_PROFELING TP WHERE TP.NIK_AM = A.ACCOUNT_TEAM_NIK
                        )
                ) t
                WHERE t.rn = 1
            )
        ";

        $bindings = [$user, $user]; // first -> TEMP.CREATED_BY, second -> LOG.LOG_USER

        try {
            Log::debug("Executing INSERT ALL (import)", $bindings);
            DB::statement($sql, $bindings);
            Log::info("Insert ALL executed");
        } catch (\Throwable $e) {
            Log::error("Insert ALL failed", ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['success' => false, 'message' => 'Oracle error', 'error' => $e->getMessage()], 500);
        }

        // count after
        try {
            $afterRow = DB::selectOne(
                "SELECT COUNT(*) AS CNT FROM TEMP_PROFELING WHERE ID_SALES LIKE 'TEMP_%' AND CREATED_BY = ?",
                [$user]
            );
            $afterCount = (int) ($afterRow->CNT ?? $afterRow->cnt ?? 0);
            $insertedCount = max(0, $afterCount - $beforeCount);
        } catch (\Throwable $e) {
            Log::warning("Could not get afterCount: " . $e->getMessage());
            $afterCount = 0;
            $insertedCount = 0;
        }

        // Ambil sample rows (sertakan CREATED_AT dari TEMP; juga kembalikan WORK_LOG dari LOG untuk referensi)
        try {
            $rows = DB::select(
                "
                SELECT
                    t.ID_SALES,
                    t.NIK_AM,
                    t.NAMA_AM,
                    t.REGION,
                    t.WITEL,
                    t.STATUS_APPROVED,
                    t.CREATED_BY,
                    t.CREATED_AT,
                    l.WORK_LOG
                FROM TEMP_PROFELING t
                LEFT JOIN (
                    SELECT ID_SALES, WORK_LOG FROM (
                        SELECT ID_SALES, WORK_LOG, ROW_NUMBER() OVER (PARTITION BY ID_SALES ORDER BY WORK_LOG DESC) AS RN
                        FROM LOG_MASTER_PROFILE_RSMES
                        WHERE LOG_USER = ?
                    ) x WHERE RN = 1
                ) l ON l.ID_SALES = t.ID_SALES
                WHERE t.ID_SALES LIKE 'TEMP_%' AND t.CREATED_BY = ?
                ORDER BY t.ID_SALES DESC
                FETCH FIRST 50 ROWS ONLY
                ",
                [$user, $user]
            );
        } catch (\Throwable $e) {
            Log::error("Fetch sample rows failed", ['error' => $e->getMessage()]);
            $rows = [];
        }

        return response()->json([
            'success' => true,
            'rows' => $rows,
            'count' => count($rows),
            'inserted_count' => $insertedCount,
            'before' => $beforeCount,
            'after' => $afterCount,
        ]);
    }
}