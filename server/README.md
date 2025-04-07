# API Authentication

## Đăng ký tài khoản

POST /api/auth/register

Request body:

```json
{
  "name": "Tên người dùng",
  "email": "email@example.com",
  "password": "mật khẩu",
  "phone": "số điện thoại"
}
```

Response:

```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "name": "Tên người dùng",
    "email": "email@example.com",
    "phone": "số điện thoại",
    "role": "user"
  }
}
```

## Đăng nhập

POST /api/auth/login

Request body:

```json
{
  "email": "email@example.com",
  "password": "mật khẩu"
}
```

Response:

```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "name": "Tên người dùng",
    "email": "email@example.com",
    "phone": "số điện thoại",
    "role": "user"
  }
}
```

## Lấy thông tin người dùng

GET /api/auth/me

Headers:

```
Authorization: Bearer jwt_token
```

Response:

```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "Tên người dùng",
    "email": "email@example.com",
    "phone": "số điện thoại",
    "role": "user"
  }
}
```

## Cập nhật thông tin người dùng

PUT /api/auth/me

Headers:

```
Authorization: Bearer jwt_token
```

Request body:

```json
{
  "name": "Tên mới",
  "phone": "số điện thoại mới"
}
```

Response:

```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "Tên mới",
    "email": "email@example.com",
    "phone": "số điện thoại mới",
    "role": "user"
  }
}
```

## Đổi mật khẩu

PUT /api/auth/change-password

Headers:

```
Authorization: Bearer jwt_token
```

Request body:

```json
{
  "currentPassword": "mật khẩu hiện tại",
  "newPassword": "mật khẩu mới"
}
```

Response:

```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công"
}
```
