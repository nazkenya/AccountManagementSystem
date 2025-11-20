<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
{
    $request->validate([
        'username' => 'required',
        'password' => 'required'
    ]);

    $user = DB::table('USERS')
        ->where('USERNAME', $request->username)
        ->first();

    if (!$user) {
        return response()->json(['message' => 'Username tidak ditemukan'], 401);
    }

    // ambil hashed password dari kolom yang benar (fallback)
    $hashedPassword = $user->password ?? $user->PASSWORD ?? null;
    if (!$hashedPassword) {
        return response()->json(['message' => 'Password not found for user'], 500);
    }

    if (!Hash::check($request->password, $hashedPassword)) {
        return response()->json(['message' => 'Password salah'], 401);
    }

    // ambil user id (fallback ke beberapa kemungkinan nama kolom)
    $uid = $user->user_id ?? $user->USER_ID ?? $user->USERID ?? null;
    if (!$uid) {
        return response()->json(['message' => 'User id not found'], 500);
    }

    // generate token raw (client receives raw token)
    $token = $uid . '|' . bin2hex(random_bytes(32));

    DB::table('personal_access_tokens')->insert([
        'user_id' => $uid,
        'token' => hash('sha256', $token),
        'created_at' => now(),
    ]);

    return response()->json([
        'user' => [
            'id' => $uid,
            'username' => $user->USERNAME ?? $user->username,
            'role' => $user->ROLE ?? $user->role
        ],
        'token' => $token
    ]);
}

    public function user(Request $request)
    {
        $token = $request->bearerToken();
        if (!$token) return response()->json(['message' => 'Unauthorized'], 401);

        $hashed = hash('sha256', $token);

        $row = DB::table('personal_access_tokens')->where('token', $hashed)->first();
        if (!$row) return response()->json(['message' => 'Invalid token'], 401);

        // Cari user dengan fallback ke beberapa nama kolom id
        $user = DB::table('USERS')->where('USER_ID', $row->user_id)->first();
        if (!$user) {
            $user = DB::table('USERS')->where('user_id', $row->user_id)->first();
        }
        if (!$user) {
            $user = DB::table('USERS')->where('USERID', $row->user_id)->first();
        }
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $uid = $user->USER_ID ?? $user->user_id ?? $user->USERID ?? null;
        $username = $user->USERNAME ?? $user->username ?? null;
        $roleDb = $user->ROLE ?? $user->role ?? null;
        $roleLower = $roleDb ? strtolower(trim($roleDb)) : null;
        $roleUpper = $roleDb ? strtoupper(trim($roleDb)) : null;

        return response()->json([
            'id' => $uid,
            'username' => $username,
            'role' => $roleLower,
            'ROLE' => $roleUpper
        ]);
    }

    public function logout(Request $request)
    {
        $token = $request->bearerToken();
        if ($token) {
            DB::table('personal_access_tokens')
                ->where('token', hash('sha256', $token))
                ->delete();
        }
        return response()->json(['message' => 'Logged out']);
    }
}
