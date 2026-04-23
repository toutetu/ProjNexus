<?php

namespace App\Services;

use App\Enums\NotificationType;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Collection;

class NotificationService
{
    /**
     * @param  Collection<int, User>|array<int, User>  $users
     * @param  array<string, mixed>|null  $meta
     */
    public function notifyUsers(
        Collection|array $users,
        NotificationType $type,
        string $title,
        ?string $body = null,
        ?array $meta = null,
    ): void {
        $targets = $users instanceof Collection ? $users : collect($users);

        foreach ($targets->unique('id') as $user) {
            Notification::query()->create([
                'user_id' => $user->id,
                'type' => $type,
                'title' => $title,
                'body' => $body,
                'meta' => $meta,
            ]);
        }
    }
}
