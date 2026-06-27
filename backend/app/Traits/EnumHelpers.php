<?php

namespace App\Traits;

trait EnumHelpers
{
    public static function values(): array
    {
        return array_map(fn($case) => $case->value, self::cases());
    }
}
