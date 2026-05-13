<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ManualController extends Controller
{
    public function show(): Response
    {
        $path = base_path('materials/manual/user_manual.md');

        $markdown = is_file($path)
            ? (string) file_get_contents($path)
            : "# 利用マニュアル\n\n本文を読み込めませんでした。";

        return Inertia::render('Manual/Index', [
            'markdown' => $markdown,
            'updatedAt' => is_file($path) ? date('c', filemtime($path)) : null,
        ]);
    }

    public function asset(string $file): BinaryFileResponse
    {
        $safe = basename($file);
        $path = base_path('materials/manual/images/'.$safe);

        abort_unless(is_file($path), 404);

        return response()->file($path);
    }
}
