<?php

use App\Enums\NotificationType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * MySQL の ENUM はマイグレーション漏れ・順序差でアプリの NotificationType とずれると INSERT が 500 になる。
 * 本番(MySQL)では VARCHAR に統一し、SQLite は変更しない（テスト用・ENUM は Laravel がチェック制約で扱う）。
 */
return new class extends Migration
{
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();
        if (! in_array($driver, ['mysql', 'mariadb'], true)) {
            return;
        }

        $table = Schema::getConnection()->getTablePrefix().'notifications';
        DB::statement("ALTER TABLE `{$table}` MODIFY COLUMN type VARCHAR(64) NOT NULL");
    }

    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();
        if (! in_array($driver, ['mysql', 'mariadb'], true)) {
            return;
        }

        $table = Schema::getConnection()->getTablePrefix().'notifications';
        $values = implode(
            ',',
            array_map(
                static fn (string $value): string => "'{$value}'",
                NotificationType::values(),
            ),
        );

        DB::statement("ALTER TABLE `{$table}` MODIFY COLUMN type ENUM({$values}) NOT NULL");
    }
};
