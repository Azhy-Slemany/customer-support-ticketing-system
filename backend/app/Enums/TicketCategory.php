<?php

namespace App\Enums;

use App\Traits\EnumHelpers;

enum TicketCategory: string
{
    use EnumHelpers;

    case TechnicalIssue = 'technical_issue';
    case Billing = 'billing';
    case AccountAccess = 'account_access';
    case ProductQuestion = 'product_question';
    case FeatureRequest = 'feature_request';
    case Other = 'other';
}
