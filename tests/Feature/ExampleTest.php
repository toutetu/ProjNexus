<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_root_redirects_guest_to_about_page(): void
    {
        $response = $this->get('/');

        $response->assertRedirect(route('manual.show', ['view' => 'about'], absolute: false));
    }
}
