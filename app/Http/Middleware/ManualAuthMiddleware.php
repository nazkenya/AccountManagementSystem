<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ManualAuthMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // ambil bearer token dari header
        $bearer = $request->bearerToken();

        Log::info('ManualAuthMiddleware - incoming', [
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'bearer_preview' => $bearer ? substr($bearer, 0, 40) : null,
        ]);

        if (!$bearer) {
            Log::warning('ManualAuthMiddleware - no token provided');
            return response()->json(['message' => 'Unauthorized (no token)'], 401);
        }

        // Jika personal_access_tokens.token disimpan sebagai hash('sha256', $token)
        $hashed = hash('sha256', $bearer);

        // cek hashed token dulu
        $row = DB::table('personal_access_tokens')->where('token', $hashed)->first();

        // fallback: cek plain token (jika ada yang menyimpan plain text)
        if (!$row) {
            $row = DB::table('personal_access_tokens')->where('token', $bearer)->first();
        }

        if (!$row) {
            Log::warning('ManualAuthMiddleware - token lookup failed', ['bearer_preview' => substr($bearer, 0, 40)]);
            return response()->json(['message' => 'Unauthorized (invalid token)'], 401);
        }

        // ambil user berdasarkan row->user_id (row->user_id seharusnya berisi USER_ID)
        $user = DB::table('USERS')->where('USER_ID', $row->user_id)->first();

        if (!$user) {
            // fallback: coba beberapa field id jika database tidak konsisten
            $user = DB::table('USERS')->where('USERID', $row->user_id)->first()
                ?? DB::table('USERS')->where('user_id', $row->user_id)->first();
        }

        if (!$user) {
            Log::warning('ManualAuthMiddleware - user not found for token', ['user_id' => $row->user_id]);
            return response()->json(['message' => 'Unauthorized (user not found)'], 401);
        }

        // Normalisasi properti user ke array lalu build object yang memiliki alias properti
        $userArr = (array) $user;

        // Resolve id/username/role dari berbagai kemungkinan kolom
        $userId = $userArr['USER_ID'] ?? $userArr['user_id'] ?? $userArr['USERID'] ?? $userArr['id'] ?? null;
        $username = $userArr['USERNAME'] ?? $userArr['username'] ?? $userArr['USER_NAME'] ?? null;
        $roleDb = $userArr['ROLE'] ?? $userArr['role'] ?? $userArr['role_name'] ?? null;

        // build user object with multiple aliases so controllers can access any variant
        $userObj = (object) $userArr;

        if ($userId) {
            $userObj->USER_ID = $userId;
            $userObj->user_id = $userId;
        }

        if ($username) {
            $userObj->USERNAME = $username;
            $userObj->username = $username;
        }

        if ($roleDb) {
            $userObj->ROLE = strtoupper(trim($roleDb));
            $userObj->role = strtolower(trim($roleDb));
        }

        // Set user resolver AND set attributes user for backward compatibility
        $request->setUserResolver(function() use ($userObj) {
            return $userObj;
        });
        $request->attributes->set('user', $userObj);

        Log::info('ManualAuthMiddleware - auth ok', [
            'user_id' => $userId,
            'username' => $username,
            'role' => ($userObj->ROLE ?? null),
        ]);

        return $next($request);
    }
}