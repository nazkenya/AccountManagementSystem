<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class LogProfilingController extends Controller
{
    /**
     * Return rows from LOG_MASTER_PROFILE_RSMES.
     * Columns: ID_SALES, NIK_AM, NAMA_AM, REGION, WITEL, LOG_USER, WORK_LOG (timestamp)
     */
    public function log_i(Request $request): JsonResponse
    {
        try {
            $cols = [
                'ID_SALES',
                'NIK_AM',
                'NAMA_AM',
                'REGION',
                'WITEL',
                'LOG_USER',
                'WORK_LOG', // TIMESTAMP(6)
            ];

            $rows = DB::table('LOG_MASTER_PROFILE_RSMES')
                ->select($cols)
                ->orderByDesc('WORK_LOG')
                ->get();

            return response()->json($rows);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Failed to read LOG_MASTER_PROFILE_RSMES',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}