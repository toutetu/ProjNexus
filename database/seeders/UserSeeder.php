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

        /** 開発1部：申請者4名（S-14 モック想定）＋部門管理者 */
        $dev1Applicants = [
            ['name' => '高橋 朋子', 'email' => 'applicant@example.com'],
            ['name' => '佐藤 美咲', 'email' => 'applicant-dev1-02@example.com'],
            ['name' => '井上 翔', 'email' => 'applicant-dev1-03@example.com'],
            ['name' => '鈴木 実', 'email' => 'applicant-dev1-04@example.com'],
        ];

        foreach ($dev1Applicants as $row) {
            $user = User::updateOrCreate(
                ['email' => $row['email']],
                [
                    'name' => $row['name'],
                    'password' => Hash::make('password'),
                    'department_id' => $dept1->id,
                ],
            );
            $user->syncRoles([RoleEnum::Applicant->value]);
        }

        $deptManagerDev1 = User::updateOrCreate(
            ['email' => 'dept@example.com'],
            [
                'name' => '夏目 拓也',
                'password' => Hash::make('password'),
                'department_id' => $dept1->id,
            ],
        );
        $deptManagerDev1->syncRoles([RoleEnum::DeptManager->value]);

        $hqUser = User::updateOrCreate(
            ['email' => 'hq@example.com'],
            [
                'name' => '本部 一郎',
                'password' => Hash::make('password'),
                'department_id' => $hq->id,
            ],
        );
        $hqUser->syncRoles([RoleEnum::HqManager->value]);

        /** 他部門の検証用アカウント */
        $extras = [
            ['name' => '申請 次郎', 'email' => 'applicant2@example.com', 'department' => $dept2, 'role' => RoleEnum::Applicant],
            ['name' => '部門 慎二', 'email' => 'dept2@example.com', 'department' => $dept2, 'role' => RoleEnum::DeptManager],
            ['name' => '申請 三郎', 'email' => 'applicant3@example.com', 'department' => $dept3, 'role' => RoleEnum::Applicant],
            ['name' => '部門 美咲', 'email' => 'dept3@example.com', 'department' => $dept3, 'role' => RoleEnum::DeptManager],
        ];

        foreach ($extras as $attrs) {
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
