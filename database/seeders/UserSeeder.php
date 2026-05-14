<?php

namespace Database\Seeders;

use App\Enums\Role as RoleEnum;
use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * ログイン画面のテストユーザー表用。投入データと同一の行順・内容を保つこと。
     *
     * @return list<array{roleLabel: string, email: string, department: string, representative: bool}>
     */
    public static function loginDemoAccounts(): array
    {
        return array_map(
            static fn (array $def): array => [
                'roleLabel' => $def['role']->label(),
                'email' => $def['email'],
                'department' => $def['department_name'],
                'representative' => $def['representative'],
            ],
            self::userDefinitions(),
        );
    }

    /**
     * @return list<array{name: string, email: string, department_name: string, role: RoleEnum, representative: bool}>
     */
    private static function userDefinitions(): array
    {
        $dev1Applicants = [
            ['name' => '高橋 朋子', 'email' => 'applicant@example.com', 'representative' => true],
            ['name' => '佐藤 美咲', 'email' => 'applicant-dev1-02@example.com', 'representative' => false],
            ['name' => '井上 翔', 'email' => 'applicant-dev1-03@example.com', 'representative' => false],
            ['name' => '鈴木 実', 'email' => 'applicant-dev1-04@example.com', 'representative' => false],
        ];

        $rows = [];
        foreach ($dev1Applicants as $row) {
            $rows[] = [
                'name' => $row['name'],
                'email' => $row['email'],
                'department_name' => '開発1部',
                'role' => RoleEnum::Applicant,
                'representative' => $row['representative'],
            ];
        }

        $rows[] = [
            'name' => '夏目 拓也',
            'email' => 'dept@example.com',
            'department_name' => '開発1部',
            'role' => RoleEnum::DeptManager,
            'representative' => true,
        ];

        $rows[] = [
            'name' => '本部 一郎',
            'email' => 'hq@example.com',
            'department_name' => '本部',
            'role' => RoleEnum::HqManager,
            'representative' => true,
        ];

        $extras = [
            ['name' => '申請 次郎', 'email' => 'applicant2@example.com', 'department_name' => '開発2部', 'role' => RoleEnum::Applicant],
            ['name' => '部門 慎二', 'email' => 'dept2@example.com', 'department_name' => '開発2部', 'role' => RoleEnum::DeptManager],
            ['name' => '申請 三郎', 'email' => 'applicant3@example.com', 'department_name' => '開発3部', 'role' => RoleEnum::Applicant],
            ['name' => '部門 由美', 'email' => 'dept3@example.com', 'department_name' => '開発3部', 'role' => RoleEnum::DeptManager],
        ];

        foreach ($extras as $attrs) {
            $rows[] = [
                'name' => $attrs['name'],
                'email' => $attrs['email'],
                'department_name' => $attrs['department_name'],
                'role' => $attrs['role'],
                'representative' => false,
            ];
        }

        return $rows;
    }

    public function run(): void
    {
        $hq = Department::where('type', Department::TYPE_HEADQUARTERS)->firstOrFail();
        $dept1 = Department::where('name', '開発1部')->firstOrFail();
        $dept2 = Department::where('name', '開発2部')->firstOrFail();
        $dept3 = Department::where('name', '開発3部')->firstOrFail();

        $departmentByName = [
            '本部' => $hq,
            '開発1部' => $dept1,
            '開発2部' => $dept2,
            '開発3部' => $dept3,
        ];

        foreach (self::userDefinitions() as $def) {
            $department = $departmentByName[$def['department_name']] ?? null;
            if ($department === null) {
                throw new \InvalidArgumentException("Unknown department: {$def['department_name']}");
            }

            $user = User::updateOrCreate(
                ['email' => $def['email']],
                [
                    'name' => $def['name'],
                    'password' => Hash::make('password'),
                    'department_id' => $department->id,
                ],
            );

            $user->syncRoles([$def['role']->value]);
        }
    }
}
