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
     */
    public function temp_t(Request $request): JsonResponse
    {
        try {
            // Kolom yang ada di TEMP_PROFELING (sesuaikan bila ada tambahan)
            $cols = [
                'ID_SALES',
                'NIK_AM',
                'NAMA_AM',
                'REGION',
                'WITEL',
                'STATUS_APPROVED', 
            ];

            $rows = DB::table('TEMP_PROFELING')
                ->select($cols)
                // jika ada kolom timestamp yang tersedia dan ingin di-order, ubah di sini
                // ->orderBy('CREATED_AT', 'desc')
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
