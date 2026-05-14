<?php

namespace App\Http\Middleware;

use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'department_id' => $user->department_id,
                    'department' => $user->department?->only(['id', 'name', 'type']),
                    'roles' => $user->getRoleNames()->values(),
                ] : null,
            ],
            'flash' => [
                'error' => fn () => $request->session()->get('error'),
                'success' => fn () => $request->session()->get('success'),
            ],
            'unreadNotificationCount' => fn () => $user
                ? $user->appNotifications()->whereNull('read_at')->count()
                : 0,
            'pendingApprovalCount' => fn () => $user
                ? Project::query()
                    ->visibleTo($user)
                    ->forTab('approval')
                    ->pendingFor($user)
                    ->count()
                : 0,
        ];
    }
}
