<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CommitProfilingController extends Controller
{
    // Helper: dapatkan field dari row (object atau array) dengan case-insensitive keys
    protected function safeField($row, $candidates = [], $default = null)
    {
        if (!$row) return $default;

        // Jika row adalah object (stdClass)
        if (is_object($row)) {
            $vars = get_object_vars($row); // associative array
        } elseif (is_array($row)) {
            $vars = $row;
        } else {
            return $default;
        }

        // normalisasi keys -> lowercase
        $lowered = [];
        foreach ($vars as $k => $v) {
            $lowered[strtolower($k)] = $v;
        }

        // cek candidates (akan coba dalam urutan yang diberikan)
        foreach ($candidates as $cand) {
            $lk = strtolower($cand);
            if (array_key_exists($lk, $lowered)) {
                return $lowered[$lk];
            }
        }

        return $default;
    }

    public function commit(Request $request)
    {
        $user = $request->input('user', 'system');
        $ids = $request->input('ids', []);

        if (empty($ids) || !is_array($ids)) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada ID valid untuk diproses.'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $committedIds = [];

            foreach ($ids as $id) {
                if (!$id || $id === 'null' || $id === 'undefined') {
                    continue;
                }

                // Ambil data dari TEMP_PROFELING
                $temp = DB::table('TEMP_PROFELING')->where('ID_SALES', $id)->first();

                if (!$temp) {
                    // log untuk debugging — data tidak ditemukan
                    Log::warning("CommitProfiling: TEMP_PROFELING not found for ID_SALES={$id}");
                    continue;
                }

                // Ambil fields dengan safeField (coba beberapa variasi nama kolom)
                $nik   = $this->safeField($temp, ['NIK_AM', 'nik_am', 'nik']);
                $nama  = $this->safeField($temp, ['NAMA_AM', 'nama_am', 'nama']);
                $region  = $this->safeField($temp, ['REGION', 'region', 'tr']);
                $witel = $this->safeField($temp, ['WITEL', 'witel']);
                $created_by_temp = $this->safeField($temp, ['CREATED_BY', 'created_by', 'creator']);

                // optional: jika semua kunci penting kosong, skip dan log
                if (empty($nik) && empty($nama) && empty($region) && empty($witel)) {
                    Log::warning("CommitProfiling: skipping ID {$id} because extracted fields are empty", [
                        'id' => $id,
                        'temp_row' => (is_object($temp) ? get_object_vars($temp) : $temp)
                    ]);
                    continue;
                }

                // Insert atau update ke MASTER_DATA_AM_RSMESV2
                DB::table('MASTER_DATA_AM_RSMESV2')->updateOrInsert(
                    ['ID_SALES' => $id],
                    [
                        'NIK_AM'    => $nik,
                        'NAMA_AM'   => $nama,
                        'TR'        => $region,
                        'WITEL'     => $witel,
                        'CREATED_BY'=> $user,
                        'UPDATE_LOG'=> now(),
                    ]
                );

                // Update status di LOG_MASTER_PROFILE_RSMES
                $updatedRows = DB::table('LOG_MASTER_PROFILE_RSMES')
                    ->where('ID_SALES', $id)
                    ->update([
                        'STATUS_APPROVED' => 'APPROVED',
                        'WORK_LOG'        => now(),
                        'LOG_USER'        => $user,
                    ]);

                if ($updatedRows === 0) {
                    DB::table('LOG_MASTER_PROFILE_RSMES')->insert([
                        'ID_SALES' => $id,
                        'NIK_AM'   => $nik,
                        'NAMA_AM'  => $nama,
                        'REGION'   => $region,
                        'WITEL'    => $witel,
                        'LOG_USER' => $user,
                        'WORK_LOG' => now(),
                        'STATUS_APPROVED' => 'APPROVED',
                    ]);
                }

                // Hapus dari TEMP_PROFELING
                DB::table('TEMP_PROFELING')->where('ID_SALES', $id)->delete();

                $committedIds[] = $id;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Commit berhasil dieksekusi.',
                'committed_count' => count($committedIds),
                'committed_ids' => $committedIds,
            ], 200);
        } catch (\Throwable $e) {
            DB::rollBack();

            // Log error detail untuk debugging
            Log::error('CommitProfiling failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Commit gagal: ' . $e->getMessage(),
            ], 500);
        }
    }
}