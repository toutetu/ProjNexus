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
                ->where('portfolioUrl', asset('portfolio/index.html'))
                // プレゼン資料 PDF は実名を含むため削除済み。ファイルが無いのでリンクは出さない
                ->where('presentationUrl', null));
    }

    public function test_presentation_pdf_returns_not_found_when_file_is_missing(): void
    {
        $this->get(route('manual.presentation', absolute: false))
            ->assertNotFound();
    }

    public function test_root_keeps_redirecting_authenticated_users_to_dashboard(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/')
            ->assertRedirect(route('dashboard', absolute: false));
    }
}
