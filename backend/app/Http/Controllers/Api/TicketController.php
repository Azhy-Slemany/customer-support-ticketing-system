<?php

namespace App\Http\Controllers\Api;

use App\Enums\ContactPreference;
use App\Enums\TicketCategory;
use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Traits\ResponseHelper;
use DB;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Validator;

class TicketController extends Controller
{
    use ResponseHelper;

    public function getTickets(Request $request) {
        $perPage = $request->query('per_page', 20);
        $page = $request->query('page', 1);

        $user = $request->user();
        if ($user->hasRole(["admin", "support"])) {
            return Ticket::paginate(perPage: $perPage, page: $page);
        } elseif ($user->hasRole("customer")) {
            return Ticket::where('customer_id', $user->id)->paginate(perPage: $perPage, page: $page);
        }
        return $this->errorResponse("Unauthorized", statusCode: 401);
    }

    public function getTicket(Request $request, $id) {
        $ticket = Ticket::find($id);
        if (!$ticket) {
            return $this->errorResponse('ticket not found', statusCode: 404);
        }
        $user = $request->user();
        if ($user->hasExactRoles('customer') && $ticket->customer_id != $user->id) {
            return $this->errorResponse("Unauthorized", statusCode: 401);
        }

        return $this->successResponse($ticket);
    }

    public function createTicket(Request $request) {
        $validator = Validator::make($request->all(), [
            'title' => 'required|max:255',
            'description' => 'required|max:10000',
            'category' => ['required', Rule::in(TicketCategory::values())],
            'priority' => ['required', Rule::in(TicketPriority::values())],
            'booked_at' => 'required|date',
            'contact_preference' => ['required', Rule::in(ContactPreference::values())],
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator);
        }

        $validated = $validator->validated();

        $ticket = DB::transaction(function () use ($validated) {
            // Lock the latest ticket row so no other transaction can read/write
            // it until this transaction commits, preventing duplicate ticket numbers.
            $lastTicket = Ticket::lockForUpdate()->orderByDesc('ticket_number')->first();

            $nextNumber = $lastTicket ? $lastTicket->ticket_number + 1 : 1;

            return Ticket::create(array_merge(
                [
                    'customer_id' => auth()->id(),
                    'ticket_number' => $nextNumber,
                    'status' => TicketStatus::Open->value,
                ],
                $validated
            ));
        });

        return $this->successResponse($ticket, 'Ticket created successfully.', statusCode: 201);
    }

    public function updateTicket(Request $request, int $id) {
        $ticket = Ticket::find($id);
        if (!$ticket) {
            return $this->errorResponse('Ticket not found', statusCode: 404);
        }
        $user = $request->user();
        if ($user->hasExactRoles('customer') && $ticket->customer_id != $user->id) {
            return $this->errorResponse("Unauthorized", statusCode: 401);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|max:255',
            'description' => 'required|max:10000',
            'category' => ['required', Rule::in(TicketCategory::values())],
            'priority' => ['required', Rule::in(TicketPriority::values())],
            'booked_at' => 'required|date',
            'contact_preference' => ['required', Rule::in(ContactPreference::values())],
        ]);
        if ($validator->fails()) {
            return $this->validationErrorResponse($validator);
        }
        $validated = $validator->validated();

        $ticket->title = $validated['title'];
        $ticket->description = $validated['description'];
        $ticket->category = $validated['category'];
        $ticket->priority = $validated['priority'];
        $ticket->booked_at = $validated['booked_at'];
        $ticket->contact_preference = $validated['contact_preference'];
        $ticket->save();

        return $this->successResponse($ticket, 'Ticket updated successfully.');
    }

    public function deleteTicket(Request $request, $id) {
        $ticket = Ticket::find($id);
        if (!$ticket) {
            return $this->errorResponse('Ticket not found', statusCode: 404);
        }

        $ticket->delete();

        return $this->successResponse($id, 'Ticket deleted successfully.');
    }

    public function createComment(Request $request, int $ticketId) {
        $validator = Validator::make($request->all(), [
            'description' => 'required|max:10000',
        ]);
        if ($validator->fails()) {
            return $this->validationErrorResponse($validator);
        }

        $validated = $validator->validated();

        $ticket = Ticket::find($ticketId);
        $user = $request->user();
        if ($user->hasExactRoles('customer') && $ticket->customer_id != $user->id) {
            return $this->errorResponse("Unauthorized", statusCode: 401);
        }

        $comment = $ticket->comments()
            ->create(array_merge($validated, ['user_id' => $request->user()->id]));

        return $this->successResponse($comment, 'Comment posted successfully.', statusCode: 201);
    }
}
