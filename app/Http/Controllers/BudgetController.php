<?php

namespace App\Http\Controllers;

use App\Enums\ProjectStatus;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    public function update(Request $request, Project $project): RedirectResponse
    {
        abort_unless($this->canUpdateBudget($request, $project), 403);

        $budgetAmount = (float) ($project->budget_amount ?? 0);
        $maxAmount = max(0, (int) floor($budgetAmount * 2));

        $validated = $request->validate(
            [
                'actual_amount' => ['required', 'integer', 'min:0', "max:{$maxAmount}"],
            ],
            [
                'required' => ':attribute は必須です。',
                'integer' => ':attribute は整数で入力してください。',
                'min' => ':attribute は :min 以上で入力してください。',
                'max' => ':attribute は :max 以下で入力してください。',
            ],
            [
                'actual_amount' => '実績額',
            ],
        );

        $project->update([
            'actual_amount' => $validated['actual_amount'],
        ]);

        return redirect()
            ->route('projects.show', $project)
            ->with('success', '予算実績を更新しました。');
    }

    private function canUpdateBudget(Request $request, Project $project): bool
    {
        $user = $request->user();

        return $project->status === ProjectStatus::Approved
            && $project->primary_assignee_id === $user?->id
            && $project->budget_amount !== null;
    }
}
