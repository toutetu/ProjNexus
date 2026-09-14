<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AboutLandingTest extends TestCase
{
    use RefreshDatabase;

    public function test_about_manual_view_is_public_and_exposes_required_inertia_props(): void
    {
        $this->get(route('manual.show', ['view' => 'about'], absolute: false))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Manual/Index')
                ->where('auth.user', null)
                ->has('markdown')
                ->has('updatedAt')
                ->where('portfolioUrl', asset('portfolio/index.html')));
    }

    public function test_root_keeps_redirecting_authenticated_users_to_dashboard(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/')
            ->assertRedirect(route('dashboard', absolute: false));
    }
}
