<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Validation\Validator;

trait ResponseHelper
{
    /**
     * Return success response
     *
     * @param mixed $data
     * @param string $message
     * @param int $statusCode
     * @return JsonResponse
     */
    protected function successResponse(mixed $data = null, string $message = 'Success', int $statusCode = 200): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => $data,
            'errors' => null
        ], $statusCode);
    }

    /**
     * Return error response
     *
     * @param string $message
     * @param mixed $errors
     * @param int $statusCode
     * @return JsonResponse
     */
    protected function errorResponse(string $message = 'Error', mixed $errors = null, int $statusCode = 400): JsonResponse
    {
        return response()->json([
            'status' => 'failed',
            'message' => $message,
            'data' => null,
            'errors' => $errors
        ], $statusCode);
    }

    /**
     * Return validation error response
     *
     * @param Validator $validator
     * @param string $message
     * @return JsonResponse
     */
    protected function validationErrorResponse(Validator $validator, string $message = 'Validation failed'): JsonResponse
    {
        return $this->errorResponse(
            $message,
            $validator->errors(),
            422
        );
    }

    /**
     * Return paginated response with meta data
     *
     * @param LengthAwarePaginator $paginator
     * @param string $message
     * @return JsonResponse
     */
    protected function paginatedResponse(LengthAwarePaginator $paginator, string $message = 'Success'): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total()
            ],
            'errors' => null
        ]);
    }
}
