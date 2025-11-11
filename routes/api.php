<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AMController;
use App\Http\Controllers\ProfilingController;
use App\Http\Controllers\TempProfilingController;
use App\Http\Controllers\LogProfilingController;
use App\Http\Controllers\CommitProfilingController;
use App\Http\Controllers\ImportFromNcrmController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('manual.auth')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/users', [UserController::class, 'index']);

    //ECRM-Workspace
    Route::get('/am', [AMController::class, 'AmList']);
    Route::get('/ca', [ProfilingController::class, 'caList']);
    Route::get('/profiling/temp', [TempProfilingController::class, 'temp_t']);
    Route::get('/profiling/log', [LogProfilingController::class, 'log_i']);
    Route::post('/profiling/import-from-ncrm', [ImportFromNcrmController::class, 'store']);
    Route::post('/profiling/commit', [CommitProfilingController::class, 'commit']);
});
