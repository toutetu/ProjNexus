<?php

namespace Database\Seeders;

use App\Enums\Role as RoleEnum;
use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $hq = Department::where('type', Department::TYPE_HEADQUARTERS)->firstOrFail();
        $dept1 = Department::where('name', '開発1部')->firstOrFail();
        $dept2 = Department::where('name', '開発2部')->firstOrFail();
        $dept3 = Department::where('name', '開発3部')->firstOrFail();

        // CLAUDE.md §11 のテストアカウント（primary）
        $accounts = [
            [
                'name' => '申請 太郎',
                'email' => 'applicant@example.com',
                'department' => $dept1,
                'role' => RoleEnum::Applicant,
            ],
            [
                'name' => '部門 花子',
                'email' => 'dept@example.com',
                'department' => $dept1,
                'role' => RoleEnum::DeptManager,
            ],
            [
                'name' => '本部 一郎',
                'email' => 'hq@example.com',
                'department' => $hq,
                'role' => RoleEnum::HqManager,
            ],
        ];

        // 動作検証強化用：他部門にも申請者・部門管理者を1名ずつ
        $extras = [
            ['name' => '申請 次郎', 'email' => 'applicant2@example.com', 'department' => $dept2, 'role' => RoleEnum::Applicant],
            ['name' => '部門 慎二', 'email' => 'dept2@example.com', 'department' => $dept2, 'role' => RoleEnum::DeptManager],
            ['name' => '申請 三郎', 'email' => 'applicant3@example.com', 'department' => $dept3, 'role' => RoleEnum::Applicant],
            ['name' => '部門 美咲', 'email' => 'dept3@example.com', 'department' => $dept3, 'role' => RoleEnum::DeptManager],
        ];

        foreach (array_merge($accounts, $extras) as $attrs) {
            $user = User::updateOrCreate(
                ['email' => $attrs['email']],
                [
                    'name' => $attrs['name'],
                    'password' => Hash::make('password'),
                    'department_id' => $attrs['department']->id,
                ],
            );

            $user->syncRoles([$attrs['role']->value]);
        }
    }
}
