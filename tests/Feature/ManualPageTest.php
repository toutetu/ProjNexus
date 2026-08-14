<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ManualPageTest extends TestCase
{
    public function test_manual_page_is_public_and_exposes_the_portfolio_url(): void
    {
        $this->get(route('manual.show'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Manual/Index')
                ->where('portfolioUrl', asset('portfolio/index.html'))
                ->has('markdown')
                ->has('updatedAt'));
    }

    public function test_portfolio_static_bundle_contains_every_referenced_asset(): void
    {
        $this->assertFileExists(public_path('portfolio/index.html'));

        foreach ([
            '04_projects_show_approved_apply.png',
            '14_hq_manager_budget_overview.png',
            '24_member_tasks_board.png',
            '25_member_tasks_members.png',
        ] as $file) {
            $this->assertFileExists(public_path("portfolio/assets/{$file}"));
        }
    }
}
