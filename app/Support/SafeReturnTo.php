<?php

namespace App\Support;

use Illuminate\Http\Request;

final class SafeReturnTo
{
    private const MEMBER_TASKS_PREFIX = '/member-tasks';

    public static function memberTasksOr(Request $request, string $fallback): string
    {
        $returnTo = $request->input('return_to');

        if (! is_string($returnTo) || $returnTo === '') {
            return $fallback;
        }

        if (self::isSafeMemberTasksUrl($returnTo, $request)) {
            return $returnTo;
        }

        return $fallback;
    }

    private static function isSafeMemberTasksUrl(string $url, Request $request): bool
    {
        if (str_starts_with($url, '//')) {
            return false;
        }

        $parsed = parse_url($url);
        $path = $parsed['path'] ?? '';

        if (! str_starts_with($path, self::MEMBER_TASKS_PREFIX)) {
            return false;
        }

        $host = $parsed['host'] ?? null;
        if ($host === null || $host === '') {
            return ! isset($parsed['scheme']);
        }

        return strtolower($host) === strtolower($request->getHost());
    }
}
