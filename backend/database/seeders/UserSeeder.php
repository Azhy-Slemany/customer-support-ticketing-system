<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // All users' email and passwords for clarification
        // [admin@example.com, admin$$$]
        // [support1@example.com, support1$$$], [support2@example.com, support2$$$], [support3@example.com, support3$$$]
        // [customer1@example.com, customer1$$$], [customer2@example.com, customer2$$$], [customer3@example.com, customer3$$$]

        $admin = User::createOrFirst([
            'name' => 'admin',
            'email' => 'admin@example.com',
        ], [
            'password' => 'admin$$$',
        ]);
        $admin->assignRole('admin');

        $supportList = ['support1', 'support2', 'support3'];
        foreach ($supportList as $support) {
            $support = User::createOrFirst([
                'name' => $support,
                'email' => "$support@example.com",
            ], [
                'password' => $support . '$$$',
            ]);
            $support->assignRole('support');
        }

        $customerList = ['customer1', 'customer2', 'customer3'];
        foreach ($customerList as $customer) {
            $customer = User::createOrFirst([
                'name' => $customer,
                'email' => "$customer@example.com",
            ], [
                'password' => $customer . '$$$',
            ]);
            $customer->assignRole('customer');
        }
    }
}
