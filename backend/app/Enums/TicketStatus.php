<?php

namespace App\Enums;

use App\Traits\EnumHelpers;

enum TicketStatus: string
{
    use EnumHelpers;

    case Open = 'open';
    case InProgress = 'in_progress';
    case Resolved = 'resolved';
    case Closed = 'closed';
}
