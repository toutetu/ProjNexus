<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ManualController extends Controller
{
    /** 紹介ページの「ドキュメント」から配信するプレゼン資料（リポジトリ内パス） */
    private const PRESENTATION_PATH = 'materials/presentation_drafts/プレゼンテーション＿20260626.pdf';

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
            'portfolioUrl' => asset('portfolio/index.html'),
            // PDF が無い環境ではリンクを出さない
            'presentationUrl' => is_file(base_path(self::PRESENTATION_PATH))
                ? route('manual.presentation')
                : null,
        ]);
    }

    /** プレゼン資料 PDF をブラウザ内で開ける形（inline）で返す */
    public function presentation(): BinaryFileResponse
    {
        $path = base_path(self::PRESENTATION_PATH);

        abort_unless(is_file($path), 404);

        return response()->file($path, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="ProjNexus_presentation_20260626.pdf"',
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
