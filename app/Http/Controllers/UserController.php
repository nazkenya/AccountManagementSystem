<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function index()
    {
        // Contoh ambil data dari tabel Oracle
        $users = DB::table('MASTER_DATA_AM_RSMESV2')->limit(10)->get();

        return response()->json($users);
    }
}
