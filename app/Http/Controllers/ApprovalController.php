<?php

namespace App\Http\Controllers;

use App\Enums\ApprovalLevel;
use App\Models\Project;
use App\Services\ApprovalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ApprovalController extends Controller
{
    public function __construct(private readonly ApprovalService $approvalService)
    {
    }

    public function submit(Project $project, Request $request): RedirectResponse
    {
        $this->approvalService->submit($project, $request->user());

        return redirect()->route('projects.index', ['tab' => 'approval']);
    }

    public function approve(Project $project, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'level' => ['required', 'in:dept,hq'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        if ($validated['level'] === ApprovalLevel::Dept->value) {
            $this->approvalService->approveDept($project, $request->user(), $validated['comment'] ?? null);
        } else {
            $this->approvalService->approveHq($project, $request->user(), $validated['comment'] ?? null);
        }

        return redirect()->route('projects.index', ['tab' => 'approval', 'filter' => 'pending']);
    }

    public function reject(Project $project, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'level' => ['required', 'in:dept,hq'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        $this->approvalService->reject(
            project: $project,
            approver: $request->user(),
            level: ApprovalLevel::from($validated['level']),
            comment: $validated['comment'] ?? null,
        );

        return redirect()->route('projects.index', ['tab' => 'approval']);
    }
}
