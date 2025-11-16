# Backend OAuth Endpoints Setup

## Laravel OAuth Implementation

### 1. Install Required Packages

```bash
composer require laravel/socialite
composer require laravel/passport  # For API authentication
```

### 2. Environment Configuration (.env)

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://your-domain.com/auth/google/callback

# Facebook OAuth  
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
FACEBOOK_REDIRECT_URI=http://your-domain.com/auth/facebook/callback

# App Settings
APP_URL=http://your-domain.com
FRONTEND_URL=appfashion://oauth/callback
```

### 3. Socialite Configuration (config/services.php)

```php
return [
    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI'),
    ],
    
    'facebook' => [
        'client_id' => env('FACEBOOK_CLIENT_ID'),
        'client_secret' => env('FACEBOOK_CLIENT_SECRET'),
        'redirect' => env('FACEBOOK_REDIRECT_URI'),
    ],
];
```

### 4. Database Migration for OAuth

```bash
php artisan make:migration add_oauth_fields_to_users_table
```

```php
// Migration file
public function up()
{
    Schema::table('users', function (Blueprint $table) {
        $table->string('provider')->nullable();
        $table->string('provider_id')->nullable();
        $table->string('avatar')->nullable();
        $table->timestamp('email_verified_at')->nullable();
    });
}
```

### 5. User Model Updates

```php
// app/Models/User.php
protected $fillable = [
    'name', 'email', 'password', 'provider', 'provider_id', 'avatar'
];

public function findOrCreateOAuthUser($provider, $oauthUser)
{
    $user = User::where('email', $oauthUser->getEmail())->first();
    
    if ($user) {
        // Update existing user with OAuth info
        $user->update([
            'provider' => $provider,
            'provider_id' => $oauthUser->getId(),
            'avatar' => $oauthUser->getAvatar(),
        ]);
        return $user;
    }
    
    // Create new user
    return User::create([
        'name' => $oauthUser->getName(),
        'email' => $oauthUser->getEmail(),
        'provider' => $provider,
        'provider_id' => $oauthUser->getId(),
        'avatar' => $oauthUser->getAvatar(),
        'email_verified_at' => now(),
    ]);
}
```