<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'USERS';
    protected $primaryKey = 'USER_ID';

    public $incrementing = false;   
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'USER_ID','EMAIL','PASSWORD','NOTEL','ROLE','NIK','USERNAME','CREATED_AT','EDITED_AT','DELETED_AT'
    ];

    protected $hidden = ['PASSWORD'];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->CREATED_AT)) {
                $model->CREATED_AT = now();
            }
        });
    }
}
