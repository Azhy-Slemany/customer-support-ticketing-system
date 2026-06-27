<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            'users.create',
            'users.view',
            'users.update',
            'users.delete',

            'support-tickets.create',
            'support-tickets.view',
            'support-tickets.reply',
            'support-tickets.close',
            'support-tickets.manage',

            'roles.manage',
            'permissions.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission);
        }
    }
}
