<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['name' => '本部', 'type' => Department::TYPE_HEADQUARTERS],
            ['name' => '開発1部', 'type' => Department::TYPE_DEPARTMENT],
            ['name' => '開発2部', 'type' => Department::TYPE_DEPARTMENT],
            ['name' => '開発3部', 'type' => Department::TYPE_DEPARTMENT],
        ];

        foreach ($departments as $attrs) {
            Department::updateOrCreate(['name' => $attrs['name']], $attrs);
        }
    }
}
