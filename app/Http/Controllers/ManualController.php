<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ManualController extends Controller
{
    public function show(): Response
    {
        $quickPath = base_path('materials/manual/quick_manual.md');
        $detailedPath = base_path('materials/manual/user_manual.md');

        $quick = is_file($quickPath) ? (string) file_get_contents($quickPath) : '';
        $detailed = is_file($detailedPath) ? (string) file_get_contents($detailedPath) : '';

        $markdown = match (true) {
            $quick !== '' && $detailed !== '' => $quick."\n\n---\n\n".$detailed,
            $detailed !== '' => $detailed,
            $quick !== '' => $quick,
            default => "# 利用マニュアル\n\n本文を読み込めませんでした。",
        };

        $mtimes = array_filter([
            is_file($quickPath) ? filemtime($quickPath) : null,
            is_file($detailedPath) ? filemtime($detailedPath) : null,
        ]);
        $updatedAt = $mtimes !== [] ? date('c', max($mtimes)) : null;

        return Inertia::render('Manual/Index', [
            'markdown' => $markdown,
            'updatedAt' => $updatedAt,
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
