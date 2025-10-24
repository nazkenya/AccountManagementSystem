<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AMController;
use App\Http\Controllers\ProfilingController;
use App\Http\Controllers\TempProfilingController;
use App\Http\Controllers\LogProfilingController;
use App\Http\Controllers\CommitProfilingController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

//API PROFILING & VALIDATION AM
Route::get('/users', [UserController::class, 'index']);
Route::get('/am', [AMController::class, 'AmList']);
Route::get('/ca', [ProfilingController::class, 'caList']);
Route::get('/profiling/temp', [TempProfilingController::class, 'temp_t']);
Route::get('/profiling/log', [LogProfilingController::class, 'log_i']);
Route::post('/profiling/import-from-ncrm', [ImportFromNcrmController::class, 'store']);
Route::post('/profiling/commit', [CommitProfilingController::class, 'store']);