<?php

namespace Tests\Feature;

use App\Enums\ProjectStatus;
use App\Enums\Role;
use App\Models\Department;
use App\Models\Project;
use App\Models\User;
use Database\Seeders\DepartmentSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectBudgetConsumptionFilterTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([DepartmentSeeder::class, RolePermissionSeeder::class]);
    }

    public function test_consumption_filter_uses_decimal_ratio_for_integer_amounts(): void
    {
        $dept = Department::query()->where('name', '開発1部')->firstOrFail();
        $hq = User::factory()->create();
        $hq->assignRole(Role::HqManager->value);

        $applicant = User::factory()->create(['department_id' => $dept->id]);
        $applicant->assignRole(Role::Applicant->value);

        // 金額は整数で保存する（SQLite では整数どうしの割り算が切り捨てになる）
        $amounts = [
            'safe' => [1_000_000, 500_000],
            'normal' => [1_000_000, 700_000],
            'warn' => [1_000_000, 950_000],
            'over' => [4_500_000, 4_860_000],
        ];
        $ids = [];
        foreach ($amounts as $key => [$budget, $actual]) {
            $ids[$key] = Project::query()->create([
                'title' => "消費率検証 {$key}",
                'applicant_id' => $applicant->id,
                'department_id' => $dept->id,
                'status' => ProjectStatus::Approved,
                'estimated_amount' => $budget,
                'budget_amount' => $budget,
                'actual_amount' => $actual,
                'revision' => 1,
            ])->id;
        }

        foreach ($ids as $consumption => $expectedId) {
            $response = $this->actingAs($hq)->get(
                route('projects.index', ['tab' => 'budget', 'consumption' => $consumption], absolute: false),
            );

            $response->assertOk();
            $rows = $response->viewData('page')['props']['projects']['data'];
            $this->assertSame([$expectedId], collect($rows)->pluck('id')->all(), "consumption={$consumption}");
        }
    }
}
