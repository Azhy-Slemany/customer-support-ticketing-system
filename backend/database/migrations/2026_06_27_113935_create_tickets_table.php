<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            id.
public ticket number.
            title.
            description.
            category.
            priority.
            status.
            customer id.
            booked support date/time.
            contact preference.
            created at.
            updated at.
            $table->unsignedBigInteger('customer_id');
            $table->unsignedInteger('ticket_number');
            $table->string('title');
            $table->text('description');
            $table->enum('category');
            $table->timestamps();

            $table->foreign('customer_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
