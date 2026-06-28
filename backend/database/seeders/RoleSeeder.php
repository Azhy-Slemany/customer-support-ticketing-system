<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear the cache as spatie permission caches permissions that results in error
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $admin = Role::findOrCreate('admin');
        $admin->givePermissionTo([
            'users.create',
            'users.view',
            'users.update',
            'users.delete',

            'support-tickets.view',
            'support-tickets.reply',
            'support-tickets.close',
            'support-tickets.manage',

            'roles.manage',
            'permissions.manage',
        ]);

        $support = Role::findOrCreate('support');
        $support->givePermissionTo([
            'support-tickets.view',
            'support-tickets.reply',
            'support-tickets.close',
            'support-tickets.manage',
        ]);

        $customer = Role::findOrCreate('customer');
        $customer->givePermissionTo([
            'support-tickets.create',
            'support-tickets.view',
            'support-tickets.reply',
        ]);
    }
}
