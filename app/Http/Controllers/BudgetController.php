<?php

namespace App\Http\Controllers;

use App\Enums\ProjectStatus;
use App\Enums\Role;
use App\Models\ProjectBudgetHistory;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
class BudgetController extends Controller
{
    public function edit(Request $request, Project $project): RedirectResponse
    {
        abort_unless($this->canUpdateBudget($request, $project), 403);

        return redirect()->route('projects.show', [
            'project' => $project->id,
            'detailTab' => 'budget',
            'budgetInput' => 1,
        ]);
    }

    public function update(Request $request, Project $project): RedirectResponse
    {
        abort_unless($this->canUpdateBudget($request, $project), 403);

        $budgetAmount = (float) ($project->budget_amount ?? 0);
        $maxAmount = max(0, (int) floor($budgetAmount * 2));

        $validated = $request->validate(
            [
                'actual_amount' => ['required', 'integer', 'regex:/^\d+$/', 'min:0', "max:{$maxAmount}"],
            ],
            [
                'required' => ':attribute は必須です。',
                'integer' => ':attribute は整数で入力してください。',
                'regex' => ':attribute は小数なしの整数で入力してください。',
                'min' => ':attribute は :min 以上で入力してください。',
                'max' => ':attribute は :max 以下で入力してください。',
            ],
            [
                'actual_amount' => '実績額',
            ],
        );

        $oldActualAmount = $project->actual_amount !== null ? (int) $project->actual_amount : null;
        $newActualAmount = (int) $validated['actual_amount'];

        $project->update([
            'actual_amount' => $validated['actual_amount'],
        ]);

        if ($oldActualAmount !== $newActualAmount) {
            ProjectBudgetHistory::query()->create([
                'project_id' => $project->id,
                'user_id' => $request->user()?->id,
                'old_actual_amount' => $oldActualAmount,
                'new_actual_amount' => $newActualAmount,
            ]);
        }

        $source = $request->string('source')->toString();
        if ($source === 'show-budget') {
            return redirect()
                ->route('projects.show', [
                    'project' => $project->id,
                    'detailTab' => 'budget',
                ])
                ->with('success', '予算実績を更新しました。');
        }

        if ($source === 'budget-input') {
            return redirect()
                ->route('projects.budget-input', $project)
                ->with('success', '予算実績を更新しました。');
        }

        return redirect()
            ->route('projects.show', $project)
            ->with('success', '予算実績を更新しました。');
    }

    private function canUpdateBudget(Request $request, Project $project): bool
    {
        $user = $request->user();

        return $project->status === ProjectStatus::Approved
            && (
                $project->primary_assignee_id === $user?->id
                || (
                    $user?->hasRole(Role::DeptManager->value)
                    && $user?->department_id === $project->department_id
                )
            )
            && $project->budget_amount !== null;
    }
}
