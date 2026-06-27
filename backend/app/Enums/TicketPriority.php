<?php

namespace App\Enums;

use App\Traits\EnumHelpers;

enum TicketPriority: string
{
    use EnumHelpers;

    case Low = 'low';
    case Normal = 'normal';
    case High = 'high';
    case Urgent = 'urgent';
}
