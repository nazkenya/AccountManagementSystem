<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\DB;

class ManualAuthMiddleware
{
    public function handle($request, Closure $next)
    {
        $token = $request->bearerToken();
        if (!$token) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $hashed = hash('sha256', $token);
        $row = DB::table('personal_access_tokens')->where('token', $hashed)->first();
        if (!$row) {
            return response()->json(['message' => 'Invalid token'], 401);
        }

        $user = DB::table('USERS')->where('USER_ID', $row->user_id)->first();
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        
        $request->setUserResolver(function () use ($user) {
            return (object) $user;
        });
        return $next($request);
    }
}
