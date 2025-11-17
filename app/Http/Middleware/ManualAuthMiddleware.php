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

        $user = DB::table('USERS')->where('USER_ID', $row->user_id)->first();
        if (!$user) {
            Log::warning('ManualAuthMiddleware - user not found for token', ['user_id' => $row->user_id]);
            return response()->json(['message' => 'Unauthorized (user not found)'], 401);
        }

        $request->setUserResolver(function() use ($user) {
            return (object) $user;
        });

        Log::info('ManualAuthMiddleware - auth ok', ['user_id' => $row->user_id, 'username' => $user->USERNAME ?? $user->username ?? null]);

        return $next($request);
    }
}
