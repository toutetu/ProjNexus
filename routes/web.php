<?php


use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\ManualController;
use App\Http\Controllers\MemberTaskController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectTaskController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
});

Route::get('/dashboard', function () {
    return redirect()->route('projects.index', ['tab' => 'approval']);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/manual', [ManualController::class, 'show'])->name('manual.show');
Route::get('/manual/assets/{file}', [ManualController::class, 'asset'])
    ->where('file', '[A-Za-z0-9_\-\.]+\.(png|jpe?g|gif|svg|webp)$')
    ->name('manual.asset');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/projects/create', [ProjectController::class, 'create'])->name('projects.create');
    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::get('/projects/{project}/edit', [ProjectController::class, 'edit'])->name('projects.edit');
    Route::put('/projects/{project}', [ProjectController::class, 'update'])->name('projects.update');
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])->name('projects.destroy');

    Route::get('/projects/{project}', [ProjectController::class, 'show'])->name('projects.show');
    Route::post('/projects/{project}/submit', [ApprovalController::class, 'submit'])->name('projects.submit');
    Route::post('/projects/{project}/take-back', [ApprovalController::class, 'takeBack'])->name('projects.takeBack');
    Route::post('/projects/{project}/approve', [ApprovalController::class, 'approve'])->name('projects.approve');
    Route::post('/projects/{project}/reject', [ApprovalController::class, 'reject'])->name('projects.reject');
    Route::put('/projects/{project}/budget', [BudgetController::class, 'update'])->name('projects.budget.update');
    Route::post('/projects/{project}/tasks', [ProjectTaskController::class, 'store'])->name('projects.tasks.store');
    Route::put('/projects/{project}/tasks/{task}', [ProjectTaskController::class, 'update'])->name('projects.tasks.update');
    Route::delete('/projects/{project}/tasks/{task}', [ProjectTaskController::class, 'destroy'])->name('projects.tasks.destroy');
    Route::post('/projects/{project}/tasks/{task}/comments', [ProjectTaskController::class, 'storeComment'])->name('projects.tasks.comments.store');

    Route::get('/member-tasks', [MemberTaskController::class, 'index'])->name('member-tasks.index');

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
