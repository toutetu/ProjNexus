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

        /**
         * ②採点者確認用・③予備: `ScenarioMirrorSeeder` が参照する並行アカウント（開発1部／本部は①と同構造）。
         * パスワードは上記と同じ `password`。手順は `doc/Design/Information.md` §2.1。
         */
        foreach (
            [
                ['track-b-applicant@example.com', '【採点】申請 花子', $dept1, RoleEnum::Applicant],
                ['track-b-dept@example.com', '【採点】部門 次郎', $dept1, RoleEnum::DeptManager],
                ['track-b-hq@example.com', '【採点】本部 三郎', $hq, RoleEnum::HqManager],
                ['track-c-applicant@example.com', '【予備】申請 四郎', $dept1, RoleEnum::Applicant],
                ['track-c-dept@example.com', '【予備】部門 五郎', $dept1, RoleEnum::DeptManager],
                ['track-c-hq@example.com', '【予備】本部 六郎', $hq, RoleEnum::HqManager],
            ] as $row
        ) {
            [$email, $name, $department, $role] = $row;
            $u = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => Hash::make('password'),
                    'department_id' => $department->id,
                ],
            );
            $u->syncRoles([$role->value]);
        }
    }
}
