<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Support\NotificationActionUrl;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $paginator = $user->appNotifications()
            ->latest()
            ->paginate(20);

        $notifications = [
            'data' => $paginator->getCollection()->map(function (Notification $notification) use ($user) {
                $actions = NotificationActionUrl::resolveActions(
                    $user,
                    $notification->type,
                    $notification->meta,
                );

                return [
                    'id' => $notification->id,
                    'type' => $notification->type->value,
                    'title' => $notification->title,
                    'body' => $notification->body,
                    'meta' => $notification->meta,
                    'readAt' => $notification->read_at?->toIso8601String(),
                    'createdAt' => $notification->created_at->toIso8601String(),
                    'projectActionHref' => $actions['project']['href'] ?? null,
                    'projectActionLabel' => $actions['project']['label'] ?? null,
                    'taskActionHref' => $actions['task']['href'] ?? null,
                    'taskActionLabel' => $actions['task']['label'] ?? null,
                ];
            })->values(),
            'links' => $paginator->linkCollection()->toArray(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
            ],
        ];

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    public function markRead(Request $request, Notification $notification): RedirectResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($notification->read_at === null) {
            $notification->update(['read_at' => now()]);
        }

        return redirect()->back();
    }
}
