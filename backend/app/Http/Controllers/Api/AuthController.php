<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ResponseHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Validator;

class AuthController extends Controller
{
    use ResponseHelper;

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->with(['roles', 'permissions'])->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->successResponse($this->userResponse($user, $token));
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return $this->successResponse();
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ])->assignRole('customer');
        $user->refresh();

        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->successResponse($this->userResponse($user, $token), statusCode: 201);
    }

    public function refreshToken(Request $request)
    {
        $request->user()->tokens()->delete();
        return $this->successResponse([
            'token' => $request->user()->createToken('auth-token')->plainTextToken,
        ]);
    }

    public function getUser(Request $request)
    {
        return $this->successResponse($this->userResponse($request->user()));
    }

    private function userResponse(User $user, ?string $token = null) {
        $data = [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name')->toArray(),
                'permissions' => $user->permissions->pluck('name')->toArray(),
            ],
        ];

        if ($token) {
            $data['token'] = $token;
        }

        return $data;
    }
}
