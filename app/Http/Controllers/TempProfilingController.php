<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class TempProfilingController extends Controller
{
    /**
     * Return rows from TEMP_PROFELING.
     * We explicitly select only columns that ada pada tabel (sesuai schema yang kamu berikan)
     * sehingga tidak memanggil kolom yang tidak ada (mis. CREATED_BY).
     * Menambahkan CREATED_AT dan CREATED_BY sebagai kolom yang diharapkan.
     */
    public function temp_t(Request $request): JsonResponse
    {
        try {
            // Kolom yang ada di TEMP_PROFELING (menambahkan CREATED_AT dan CREATED_BY)
            $cols = [
                'ID_SALES',
                'NIK_AM',
                'NAMA_AM',
                'REGION',
                'WITEL',
                'STATUS_APPROVED',
                'CREATED_BY', 
                'CREATED_AT',
            ];

            $rows = DB::table('TEMP_PROFELING')
                ->select($cols)
                // Order by CREATED_AT agar data terbaru muncul di atas
                ->orderByDesc('CREATED_AT') 
                ->get();

            return response()->json($rows);
        } catch (\Throwable $e) {
            // kembalikan error terstruktur agar frontend bisa lihat pesan
            return response()->json([
                'error' => 'Failed to read TEMP_PROFELING',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}