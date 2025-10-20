<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AMController extends Controller
{
    // kolom yang diizinkan (masukkan variasi case agar aman)
    private $allowedColumns = [
        'ID_SALES','id_sales',
        'NIK_AM','nik_am',
        'NAMA_AM','nama_am',
        'TR','tr',
        'WITEL','witel',
        'TELDA','telda',
        'UPDATED_DATE','updated_date',
        'AM_AKTIF_POSISI_OKTOBER_2025','am_aktif_posisi_oktober_2025','am_aktif',
        // kolom popover yang kamu minta
        'NOTEL','notel',
        'EMAIL','email',
        'LEVEL_AM','level_am',
        'TGL_AKTIF','tgl_aktif',
        'UPDATE_PERPANJANGAN_KONTRAK','update_perpanjangan_kontrak',
        'TGL_AKHIR_KONTRAK_PRO_HIRE','tgl_akhir_kontrak_pro_hire',
        'LAMA_MENJADI_PRO_HIRE','lama_menjadi_pro_hire',
        'TGL_OUT_SEBAGAI_AM','tgl_out_sebagai_am',
        'KET_OUT','ket_out',
    ];

    public function AmList(Request $request)
    {
        $fieldsParam = $request->query('fields');

        if ($fieldsParam) {
            $requested = array_map('trim', explode(',', $fieldsParam));
            // Filter columns case-insensitive
            $allowedLower = [];
            foreach ($this->allowedColumns as $c) $allowedLower[strtolower($c)] = $c;

            $cols = [];
            foreach ($requested as $r) {
                $rl = strtolower($r);
                if (isset($allowedLower[$rl])) $cols[] = $allowedLower[$rl];
            }
            $columns = array_values(array_unique($cols));
            if (empty($columns)) {
                // fallback default
                $columns = ['ID_SALES','NIK_AM','NAMA_AM','TR','WITEL'];
            }
        } else {
            // default: semua kolom yang kita ingin tampilkan di popover (plus dasar)
            $columns = [
                'ID_SALES','NIK_AM','NAMA_AM','TR','WITEL',
                'NOTEL','EMAIL','LEVEL_AM','TGL_AKTIF',
                'UPDATE_PERPANJANGAN_KONTRAK','TGL_AKHIR_KONTRAK_PRO_HIRE',
                'LAMA_MENJADI_PRO_HIRE','TGL_OUT_SEBAGAI_AM','KET_OUT',
                'AM_AKTIF_POSISI_OKTOBER_2025'
            ];
        }

        // ambil data dari database
        $rows = DB::table('MASTER_DATA_AM_RSMESV2')->select($columns)->get();
        return response()->json($rows);
    }
}
