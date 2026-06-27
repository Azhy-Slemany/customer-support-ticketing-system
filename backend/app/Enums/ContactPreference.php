<?php

namespace App\Enums;

use App\Traits\EnumHelpers;

enum ContactPreference: string
{
    use EnumHelpers;

    case Email = 'email';
    case Phone = 'phone';
}
