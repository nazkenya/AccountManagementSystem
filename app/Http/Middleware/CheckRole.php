<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CheckRole
{    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (!$user) {
            $user = $request->attributes->get('user');
        }

        if (!$user) {
            return response()->json(['message' => 'Forbidden (no user)'], 403);
        }

        $role = null;
        if (is_object($user)) {
            $role = $user->ROLE ?? $user->role ?? $user->Role ?? null;

            if ($role === null) {
                try {
                    $arr = (array) $user;
                    // normalisasi keys ke lowercase
                    $lower = array_change_key_case($arr, CASE_LOWER);
                    if (isset($lower['role'])) $role = $lower['role'];
                    if (isset($lower['role_name'])) $role = $lower['role_name'];
                } catch (\Throwable $e) {
                }
            }
        } elseif (is_array($user)) {
            $lu = array_change_key_case($user, CASE_LOWER);
            $role = $lu['role'] ?? $lu['role_name'] ?? null;
        }

        if (!$role) {
            Log::warning('CheckRole: user has no role property', ['user' => is_object($user) ? (array)$user : $user]);
            return response()->json(['message' => 'Forbidden (no role)'], 403);
        }

        $roleUp = strtoupper(trim($role));
        $allowedUpper = array_map(function($r){ return strtoupper(trim($r)); }, $roles);

        if (!in_array($roleUp, $allowedUpper, true)) {
            return response()->json(['message' => 'Forbidden (insufficient role)'], 403);
        }

        return $next($request);
    }
}
