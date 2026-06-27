<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;


Route::post('/auth/login', [AuthController::class, 'login'])->name('login');
Route::post('/auth/register', [AuthController::class, 'register'])->name('register');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'getUser'])->name('user');
    Route::prefix('auth')->group(function () {
        Route::post('/refresh-token', [AuthController::class, 'refreshToken'])->name('refresh');
        Route::delete('/logout', [AuthController::class, 'logout'])->name('logout');
    });
});
