<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TicketController;
use Illuminate\Support\Facades\Route;


Route::post('/auth/login', [AuthController::class, 'login'])->name('login');
Route::post('/auth/register', [AuthController::class, 'register'])->name('register');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'getUser'])->name('user');
    Route::prefix('auth')->group(function () {
        Route::post('/refresh-token', [AuthController::class, 'refreshToken'])->name('refresh');
        Route::delete('/logout', [AuthController::class, 'logout'])->name('logout');
    });

    Route::prefix('tickets')->group(function () {
        Route::get('/', [TicketController::class, 'getTickets'])->middleware('permission:support-tickets.view,api');
        Route::post('/', [TicketController::class, 'createTicket'])->middleware('permission:support-tickets.create');
        Route::get('/{ticket}', [TicketController::class, 'getTicket'])->middleware('permission:support-tickets.view');
        Route::put('/{ticket}', [TicketController::class, 'updateTicket'])->middleware('permission:support-tickets.manage');
        Route::delete('/{ticket}', [TicketController::class, 'deleteTicket'])->middleware('permission:support-tickets.manage');

        Route::post('/{ticket}/comments', [TicketController::class, 'createComment'])->middleware('permission:support-tickets.reply');;
    });
});
