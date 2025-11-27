<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

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
            Log::warning('AuthController@login - password not found for user', ['username' => $request->username]);
            return response()->json(['message' => 'Password not found for user'], 500);
        }

        if (!Hash::check($request->password, $hashedPassword)) {
            return response()->json(['message' => 'Password salah'], 401);
        }

        // ambil user id (fallback ke beberapa kemungkinan nama kolom)
        $uid = $user->user_id ?? $user->USER_ID ?? $user->USERID ?? $user->id ?? null;
        if (!$uid) {
            Log::error('AuthController@login - user id not found', ['username' => $request->username, 'user_row' => (array)$user]);
            return response()->json(['message' => 'User id not found'], 500);
        }

        // generate token raw (client receives raw token)
        $token = $uid . '|' . bin2hex(random_bytes(32));

        try {
            $inserted = DB::table('personal_access_tokens')->insert([
                'user_id' => $uid,
                'token' => hash('sha256', $token),
                'created_at' => now(),
            ]);
            if (!$inserted) {
                Log::error('AuthController@login - failed insert token', ['uid' => $uid]);
                return response()->json(['message' => 'Gagal menyimpan token'], 500);
            }
        } catch (\Throwable $e) {
            Log::error('AuthController@login - exception insert token', ['uid' => $uid, 'err' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal menyimpan token'], 500);
        }

        $username = $user->USERNAME ?? $user->username ?? null;
        $role = $user->ROLE ?? $user->role ?? null;

        return response()->json([
            'user' => [
                'id' => $uid,
                'username' => $username,
                'role' => $role
            ],
            'token' => $token
        ]);
    }

    public function user(Request $request)
    {
        // Prefer middleware-provided user object if available
        $user = $request->user() ?? $request->attributes->get('user');

        if (!$user) {
            // fallback: verify token manually
            $token = $request->bearerToken();
            if (!$token) return response()->json(['message' => 'Unauthorized'], 401);

            $hashed = hash('sha256', $token);
            $row = DB::table('personal_access_tokens')->where('token', $hashed)->first();
            if (!$row) return response()->json(['message' => 'Invalid token'], 401);

            $user = DB::table('USERS')->where('USER_ID', $row->user_id)->first();
            if (!$user) return response()->json(['message' => 'User not found'], 401);
        }

        // resolve fields with fallback names
        $id = $user->USER_ID ?? $user->user_id ?? $user->USERID ?? $user->id ?? null;
        $username = $user->USERNAME ?? $user->username ?? $user->user ?? null;
        $role = $user->ROLE ?? $user->role ?? $user->Role ?? null;

        // if essential data is missing, return error
        if (!$id || !$username) {
            Log::warning('AuthController@user - user data incomplete', ['user_obj' => (array)$user]);
            return response()->json(['message' => 'User data incomplete'], 500);
        }

        return response()->json([
            'id' => $id,
            'username' => $username,
            'role' => $role
        ]);
    }

    public function logout(Request $request)
    {
        $token = $request->bearerToken();
        if ($token) {
            try {
                DB::table('personal_access_tokens')
                    ->where('token', hash('sha256', $token))
                    ->delete();
            } catch (\Throwable $e) {
                Log::warning('AuthController@logout - failed to delete token', ['err' => $e->getMessage()]);
            }
        }
        return response()->json(['message' => 'Logged out']);
    }
}