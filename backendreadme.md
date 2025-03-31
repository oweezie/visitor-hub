# Visitor Management System API Documentation

## Introduction

This documentation provides a comprehensive guide to the Visitor Management System API. The API allows you to manage premises, visitors, and authentication for a complete visitor management solution. This guide includes detailed information about each endpoint, request/response formats, and testing instructions.

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Data Models](#data-models)
4. [Authentication Flow](#authentication-flow)
5. [Premise Management Flow](#premise-management-flow)
6. [Visitor Management Flow](#visitor-management-flow)
7. [QR Code Generation and Usage](#qr-code-generation-and-usage)
8. [API Endpoints Reference](#api-endpoints-reference)
9. [Error Handling](#error-handling)
10. [Offline Support](#offline-support)
11. [Testing the APIs](#testing-the-apis)

## System Overview

The Visitor Management System is designed to streamline the process of managing visitors at various premises. It provides a secure and efficient way to register, track, and manage visitors, while maintaining detailed records of all visitor activities.

Key features include:
- Admin user management with premise-specific access
- QR code generation for premises
- Visitor sign-in and sign-out tracking
- Approval workflow for visitor access
- Comprehensive reporting and analytics
- Mobile-friendly interface for both visitors and administrators

## Architecture

The system follows a modern Django REST Framework architecture with the following components:

### Backend Components
- **Django REST Framework**: Provides the API layer
- **PostgreSQL Database**: Stores all system data
- **JWT Authentication**: Secures API endpoints
- **QR Code Generation**: Creates unique QR codes for premises
- **Media Storage**: Manages visitor ID photos and QR code images

### Frontend Components (Not covered in this documentation)
- **React.js SPA**: Admin dashboard
- **Mobile-responsive Web App**: Visitor sign-in interface

### System Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Admin User  │────▶│  Auth API   │────▶│  Database   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Premise   │────▶│ Premise API │────▶│  QR Code    │
│ Management  │     │             │     │ Generation  │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           │
                           ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Visitor   │────▶│ Visitor API │────▶│  Approval   │
│   Sign-in   │     │             │     │  Workflow   │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Data Models

The system is built around the following core data models:

### Premise Model
```python
class Premise:
    name: str                # Name of the premise
    address: str             # Physical address
    qr_code: str             # Unique QR code identifier
    qr_code_image: ImageField # Generated QR code image
    created_at: datetime     # Creation timestamp
    updated_at: datetime     # Last update timestamp
```

### AdminUser Model
```python
class AdminUser:
    username: str            # Username for login
    email: str               # Email address
    password: str            # Hashed password
    premises: [Premise]      # Many-to-many relationship with premises
    groups: [Group]          # User groups for permissions
    user_permissions: [Permission] # Specific user permissions
```

### Visitor Model
```python
class Visitor:
    premise: Premise         # Associated premise
    first_name: str          # Visitor's first name
    second_name: str         # Visitor's last name
    phone_number: str        # Contact phone number
    person_visiting: str     # Name of person being visited
    room_number: str         # Room or office number
    reason: str              # Purpose of visit
    id_photo: ImageField     # Visitor's ID photo
    ip_address: str          # IP address used for sign-in
    status: str              # Current status (pending, signed_in, rejected, signed_out)
    submitted_at: datetime   # When visitor submitted sign-in request
    sign_in_time: datetime   # When visitor was approved and signed in
    sign_out_time: datetime  # When visitor signed out
    rejected_at: datetime    # When visitor was rejected
```

## Authentication Flow

The system uses JWT (JSON Web Tokens) for authentication with the following flow:

1. **Admin Signup**:
   - Admin creates an account with username, email, password
   - Creates initial premise during signup
   - System generates QR code for the premise
   - Returns JWT tokens for immediate authentication

2. **Admin Signin**:
   - Admin provides username and password
   - System validates credentials
   - Returns JWT access and refresh tokens
   - Access token used for API authorization

3. **Token Refresh**:
   - When access token expires, refresh token used to obtain new tokens
   - Extends session without requiring re-authentication

4. **Authentication Middleware**:
   - Validates JWT token on protected endpoints
   - Extracts user information
   - Enforces permission checks

### Authentication Sequence Diagram

```
┌─────────┐                  ┌─────────┐                  ┌─────────┐
│  Admin  │                  │   API   │                  │Database │
└────┬────┘                  └────┬────┘                  └────┬────┘
     │                            │                            │
     │ 1. Signup Request          │                            │
     │ (username, email, password)│                            │
     │ --------------------------->                            │
     │                            │                            │
     │                            │ 2. Create User & Premise   │
     │                            │ --------------------------->
     │                            │                            │
     │                            │ 3. Generate QR Code        │
     │                            │<----------------------------
     │                            │                            │
     │ 4. Return Tokens & User Data                            │
     │<----------------------------                            │
     │                            │                            │
     │ 5. Signin Request          │                            │
     │ (username, password)       │                            │
     │ --------------------------->                            │
     │                            │                            │
     │                            │ 6. Validate Credentials    │
     │                            │ --------------------------->
     │                            │                            │
     │ 7. Return Tokens           │                            │
     │<----------------------------                            │
     │                            │                            │
     │ 8. API Request with Token  │                            │
     │ --------------------------->                            │
     │                            │                            │
     │                            │ 9. Validate Token          │
     │                            │ --------------------------->
     │                            │                            │
     │ 10. Return API Response    │                            │
     │<----------------------------                            │
┌────┴────┐                  ┌────┴────┐                  ┌────┴────┐
│  Admin  │                  │   API   │                  │Database │
└─────────┘                  └─────────┘                  └─────────┘
```

## Premise Management Flow

The premise management workflow allows administrators to create and manage multiple premises:

1. **Create Premise**:
   - Admin provides premise name and address
   - System generates unique QR code
   - QR code image is created and stored
   - Premise is associated with admin user

2. **List Premises**:
   - Admin can view all premises they manage
   - Includes QR code URLs for each premise

3. **Update Premise**:
   - Admin can modify premise details
   - QR code remains unchanged for continuity

4. **Delete Premise**:
   - Admin can remove premises they manage
   - Associated visitor records are preserved for audit purposes

### Premise QR Code Generation

The system automatically generates QR codes for each premise:
- QR code contains a URL with the premise ID
- When scanned, directs visitors to sign-in page
- QR code image is stored and accessible via API

## Visitor Management Flow

The visitor management process follows these steps:

1. **Visitor Sign-In**:
   - Visitor scans premise QR code
   - Completes sign-in form with personal details
   - Uploads ID photo if required
   - System records IP address for later sign-out
   - Status set to "pending"

2. **Admin Approval**:
   - Admin receives notification of pending visitor
   - Reviews visitor details
   - Approves or rejects visitor
   - If approved, status changes to "signed_in" and timestamp recorded
   - If rejected, status changes to "rejected" and timestamp recorded

3. **Visitor Sign-Out**:
   - Visitor scans QR code again
   - System matches IP address to find active visitor record
   - Updates status to "signed_out" and records timestamp
   - Calculates visit duration

### Visitor Status Flow

```
┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
│  Pending  │────▶│ Signed In │────▶│ Signed Out│     │ Rejected  │
└───────────┘     └───────────┘     └───────────┘     └───────────┘
      ▲                                                     ▲
      │                                                     │
      └─────────────────────────────────────────────────────┘
```

## QR Code Generation and Usage

QR codes are central to the system's functionality:

1. **Generation Process**:
   - When a premise is created, a unique UUID is generated
   - This UUID is encoded in the QR code
   - QR code image is generated using the `qrcode` library
   - Image is stored in the media directory

2. **QR Code Content**:
   - Contains URL to visitor sign-in page
   - Includes premise ID as parameter
   - Example: `http://visitor-signin.example.com/visitors/signin/?premise_id=123`

3. **Visitor Usage**:
   - Visitor scans QR code with smartphone
   - Browser opens sign-in page pre-populated with premise ID
   - After completing form, system knows which premise they're visiting

4. **Sign-Out Process**:
   - Visitor scans same QR code
   - System detects IP address matches an active visitor
   - Automatically processes sign-out

### QR Code Implementation

```python
# QR Code generation in Premise model
def save(self, *args, **kwargs):
    # Generate a unique QR code if not provided
    if not self.qr_code:
        self.qr_code = str(uuid.uuid4())
    
    # First save to ensure we have an ID
    super().save(*args, **kwargs)
    
    # Generate QR code image if it doesn't exist
    if not self.qr_code_image:
        # Create QR code data URL for visitor sign-in
        qr_data = f"http://visitor-signin.example.com/visitors/signin/?premise_id={self.id}"
        
        # Generate QR code image
        qr_img = qrcode.make(qr_data)
        
        # Create a BytesIO buffer to hold the image
        buffer = BytesIO()
        
        # Save the image to the buffer
        qr_img.save(buffer, format='PNG')
        
        # Create a Django File object
        filename = f'premise_qr_{self.id}.png'
        self.qr_code_image.save(
            filename,
            File(buffer),
            save=False
        )
        
        # Save the model again to store the image
        super().save(*args, **kwargs)
```

## API Endpoints Reference

### Base URL
/api/v1/

### Authentication
- Sign Up: POST /api/v1/auth/signup/
- Sign In: POST /api/v1/auth/signin/

### Premises Management
- List Premises: GET /api/v1/auth/premises/
- Create Premise: POST /api/v1/auth/premises/
- Retrieve Premise: GET /api/v1/auth/premises/{premise_id}/
- Update Premise: PUT /api/v1/auth/premises/{premise_id}/
- Delete Premise: DELETE /api/v1/auth/premises/{premise_id}/
- Get QR Code: GET /api/v1/auth/premises/{premise_id}/qr_code/
- Download QR Code: GET /api/v1/auth/premises/{premise_id}/download_qr_code/

### Visitor Management
- List Visitors: GET /api/v1/visitors/
- Visitor Sign In: POST /api/v1/visitors/signin/
- Approve Visitor: POST /api/v1/visitors/{visitor_id}/approve/
- Reject Visitor: POST /api/v1/visitors/{visitor_id}/reject/
- Visitor Sign Out: POST /api/v1/visitors/signout/

For detailed API documentation with request/response examples, see [docs/COMPREHENSIVE_API_DOC.md](docs/COMPREHENSIVE_API_DOC.md).

## Authentication APIs

### Admin Signup

Register a new administrator account.

- **URL**: `/api/auth/signup/`
- **Method**: `POST`
- **Headers**: 
  - Content-Type: application/json

**Request Body**:
```json
{
  "username": "admin_user",
  "email": "admin@example.com",
  "password": "securePassword123",
  "confirm_password": "securePassword123",
  "premise_name": "Headquarters",
  "premise_address": "123 Main Street, City, Country" // Optional
}
```

**Response (200 OK)**:
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin_user",
    "email": "admin@example.com"
  }
}
```

### Admin Login

Authenticate an administrator and receive an access token.

- **URL**: `/api/auth/signin/`
- **Method**: `POST`
- **Headers**: 
  - Content-Type: application/json

**Request Body**:
```json
{
  "username": "admin_user",
  "password": "securePassword123"
}
```

**Response (200 OK)**:
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin_user",
    "email": "admin@example.com"
  }
}
```

## Premise Management APIs

### Create Premise

Create a new premise in the system.

- **URL**: `/api/v1/auth/premises/`
- **Method**: `POST`
- **Headers**: 
  - Authorization: Bearer {accessToken}
  - Content-Type: application/json

**Request Body**:
```json
{
  "name": "Branch Office",
  "address": "456 Side Street, City, Country"
}
```

**Response (201 Created)**:
```json
{
  "id": 2,
  "name": "Branch Office",
  "address": "456 Side Street, City, Country",
  "qr_code": "550e8400-e29b-41d4-a716-446655440000",
  "qr_code_image": "/media/premise_qrcodes/premise_qr_2.png",
  "qr_code_url": "/media/premise_qrcodes/premise_qr_2.png",
  "created_at": "2023-06-15T11:30:00Z",
  "updated_at": "2023-06-15T11:30:00Z"
}
```

### Get All Premises

Retrieve a list of all premises managed by the authenticated admin.

- **URL**: `/api/v1/auth/premises/`
- **Method**: `GET`
- **Headers**: 
  - Authorization: Bearer {accessToken}

**Response (200 OK)**:
```json
[
  {
    "id": 1,
    "name": "Headquarters",
    "address": "123 Main Street, City, Country",
    "qr_code": "550e8400-e29b-41d4-a716-446655440000",
    "qr_code_image": "/media/premise_qrcodes/premise_qr_1.png",
    "qr_code_url": "/media/premise_qrcodes/premise_qr_1.png",
    "created_at": "2023-06-15T10:30:00Z",
    "updated_at": "2023-06-15T10:30:00Z"
  },
  {
    "id": 2,
    "name": "Branch Office",
    "address": "456 Side Street, City, Country",
    "qr_code": "550e8400-e29b-41d4-a716-446655440001",
    "qr_code_image": "/media/premise_qrcodes/premise_qr_2.png",
    "qr_code_url": "/media/premise_qrcodes/premise_qr_2.png",
    "created_at": "2023-06-15T11:30:00Z",
    "updated_at": "2023-06-15T11:30:00Z"
  }
]
```

## Visitor Management APIs

### Visitor Sign In

Register a new visitor at a premise.

- **URL**: `/api/v1/visitors/signin/`
- **Method**: `POST`
- **Headers**: 
  - Content-Type: application/json

**Request Body**:
```json
{
  "premise": 1,
  "first_name": "John",
  "second_name": "Doe",
  "phone_number": "+1234567890",
  "person_visiting": "Jane Smith",
  "room_number": "301",
  "reason": "Job Interview",
  "id_photo": "[base64 encoded image]"
}
```

**Response (201 Created)**:
```json
{
  "premise": 1,
  "first_name": "John",
  "second_name": "Doe",
  "phone_number": "+1234567890",
  "person_visiting": "Jane Smith",
  "room_number": "301",
  "reason": "Job Interview",
  "id_photo": "/media/visitor_photos/visitor_1.jpg",
  "ip_address": "192.168.1.100"
}
```

### Approve Visitor

Approve a pending visitor.

- **URL**: `/api/v1/visitors/{visitor_id}/approve/`
- **Method**: `POST`
- **Headers**: 
  - Authorization: Bearer {accessToken}
  - Content-Type: application/json

**Request Body**:
```json
{
  "sign_in_time": "2023-06-15T13:15:00Z"
}
```

**Response (200 OK)**:
```json
{
  "sign_in_time": "2023-06-15T13:15:00Z"
}
```

### Visitor Sign Out

Register a visitor's sign-out.

- **URL**: `/api/v1/visitors/signout/`
- **Method**: `POST`
- **Headers**: 
  - Content-Type: application/json

**Request Body**:
```json
{
  "premise": 1,
  "sign_out_time": "2023-06-15T16:45:00Z"
}
```

**Response (200 OK)**:
```json
{
  "sign_out_time": "2023-06-15T16:45:00Z"
}
```

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests.

### Common Status Codes

- **200 OK**: The request was successful
- **201 Created**: A new resource was successfully created
- **400 Bad Request**: The request was invalid or cannot be served
- **401 Unauthorized**: Authentication is required or has failed
- **403 Forbidden**: The authenticated user doesn't have permission
- **404 Not Found**: The requested resource does not exist
- **422 Unprocessable Entity**: The request was well-formed but contains semantic errors
- **500 Internal Server Error**: An error occurred on the server

### Error Response Format

All error responses follow this format:

```json
{
  "error": "A human-readable error message",
  "details": {
    "field_name": [
      "Error message for this field"
    ]
  }
}
```

### Common Error Scenarios

1. **Authentication Errors**:
   - Invalid credentials during login
   - Expired or invalid JWT token
   - Missing authorization header

2. **Permission Errors**:
   - Attempting to access a premise not managed by the user
   - Attempting to approve/reject visitors without admin rights

3. **Validation Errors**:
   - Missing required fields
   - Invalid data formats (email, phone number)
   - Password confirmation mismatch

4. **Resource Errors**:
   - Premise or visitor not found
   - Attempting to sign out a visitor who isn't signed in

## Offline Support

The system includes mechanisms to handle offline scenarios:

1. **QR Code Availability**:
   - QR codes are stored as image files
   - Can be printed and displayed physically at premises
   - Reduces dependency on constant internet connectivity

2. **Visitor Sign-In Queue**:
   - If network connectivity is lost during sign-in:
     - Data can be stored locally in browser storage
     - Automatically submitted when connectivity is restored

3. **Admin Dashboard Caching**:
   - Recent visitor data is cached for offline viewing
   - Changes made offline are synchronized when connection is restored

4. **Progressive Web App Support**:
   - Frontend can be implemented as a PWA
   - Allows installation on devices for offline access
   - Service workers can cache essential resources

### Offline Data Synchronization

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Local      │     │ Connection  │     │  Server     │
│  Storage    │────▶│ Restored    │────▶│  Database   │
└─────────────┘     └─────────────┘     └─────────────┘
       ▲                                       │
       │                                       │
       │                                       ▼
┌─────────────┐                         ┌─────────────┐
│  Offline    │                         │  Updated    │
│  Actions    │                         │    Data     │
└─────────────┘                         └─────────────┘
```

## Testing the APIs

### Using Postman

1. **Setup Postman Collection**:
   - Download the [Visitor Management System Postman Collection](https://example.com/visitor-management-postman.json)
   - Import the collection into Postman
   - Set up environment variables for `baseUrl` and `accessToken`

2. **Authentication**:
   - Use the "Admin Login" request to obtain an access token
   - The token will be automatically set in the environment variables

3. **Testing Endpoints**:
   - All endpoints are organized by category in the collection
   - Each request includes pre-configured headers and example request bodies
   - Use the "Tests" tab to see example assertions

### Using cURL

Here are examples of how to use cURL to test the API endpoints:

**Admin Login**:
```bash
curl -X POST http://localhost:8000/api/v1/auth/signin/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin_user",
    "password": "securePassword123"
  }'
```

**Create Premise (with authentication)**:
```bash
curl -X POST http://localhost:8000/api/v1/auth/premises/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Headquarters Building",
    "address": "123 Main Street, City, Country"
  }'
```

**Visitor Sign-In**:
```bash
curl -X POST http://localhost:8000/api/v1/visitors/signin/ \
  -H "Content-Type: application/json" \
  -d '{
    "premise": 1,
    "first_name": "John",
    "second_name": "Doe",
    "phone_number": "+1234567890",
    "person_visiting": "Jane Smith",
    "room_number": "301",
    "reason": "Job Interview"
  }'
```

For more detailed API documentation and examples, please refer to the [Comprehensive API Documentation](docs/COMPREHENSIVE_API_DOC.md).

## Authentication APIs

### Admin Signup

Register a new administrator account.

- **URL**: `/api/auth/signup/`
- **Method**: `POST`
- **Headers**: 
  - Content-Type: application/json

**Request Body**:
```json
{
  "username": "admin_user",
  "email": "admin@example.com",
  "password": "securePassword123",
  "confirm_password": "securePassword123",
  "premise_name": "Headquarters",
  "premise_address": "123 Main Street, City, Country" // Optional
}
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Admin account created successfully",
  "data": {
    "id": "12345",
    "username": "admin_user",
    "email": "admin@example.com",
    "premise": {
      "id": "premise123",
      "name": "Headquarters",
      "address": "123 Main Street, City, Country"
    },
    "createdAt": "2023-06-15T10:30:00Z"
  }
}
```

### Admin Login

Authenticate an administrator and receive an access token.

- **URL**: `/api/auth/login/`
- **Method**: `POST`
- **Headers**: 
  - Content-Type: application/json

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "12345",
      "username": "admin_user",
      "email": "admin@example.com",
      "fullName": "Admin User"
    }
  }
}
```

### Refresh Token

Obtain a new access token using a refresh token.

- **URL**: `/api/auth/refresh/`
- **Method**: `POST`
- **Headers**: 
  - Content-Type: application/json

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Logout

Invalidate the current session.

- **URL**: `/api/auth/logout/`
- **Method**: `POST`
- **Headers**: 
  - Authorization: Bearer {accessToken}
  - Content-Type: application/json

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

## Premise Management APIs

### Create Premise

Create a new premise in the system.

- **URL**: `/api/premises/`
- **Method**: `POST`
- **Headers**: 
  - Authorization: Bearer {accessToken}
  - Content-Type: application/json

**Request Body**:
```json
{
  "name": "Headquarters Building",
  "address": "123 Main Street, City, Country",
  "contactPerson": "John Doe",
  "contactEmail": "john.doe@example.com",
  "contactPhone": "+1234567890",
  "maxDailyVisitors": 100
}
```

**Response (201 Created)**:
```json
{
  "status": "success",
  "message": "Premise created successfully",
  "data": {
    "id": "premise123",
    "name": "Headquarters Building",
    "address": "123 Main Street, City, Country",
    "contactPerson": "John Doe",
    "contactEmail": "john.doe@example.com",
    "contactPhone": "+1234567890",
    "maxDailyVisitors": 100,
    "createdAt": "2023-06-15T11:30:00Z",
    "updatedAt": "2023-06-15T11:30:00Z"
  }
}
```

### Get All Premises

Retrieve a list of all premises.

- **URL**: `/api/premises/`
- **Method**: `GET`
- **Headers**: 
  - Authorization: Bearer {accessToken}

**Query Parameters**:
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)

**Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Premises retrieved successfully",
  "data": {
    "premises": [
      {
        "id": "premise123",
        "name": "Headquarters Building",
        "address": "123 Main Street, City, Country",
        "contactPerson": "John Doe",
        "contactEmail": "john.doe@example.com",
        "contactPhone": "+1234567890",
        "maxDailyVisitors": 100,
        "createdAt": "2023-06-15T11:30:00Z",
        "updatedAt": "2023-06-15T11:30:00Z"
      },
      {
        "id": "premise456",
        "name": "Branch Office",
        "address": "456 Side Street, City, Country",
        "contactPerson": "Jane Smith",
        "contactEmail": "jane.smith@example.com",
        "contactPhone": "+1987654321",
        "maxDailyVisitors": 50,
        "createdAt": "2023-06-16T09:15:00Z",
        "updatedAt": "2023-06-16T09:15:00Z"
      }
    ],
    "pagination": {
      "total": 2,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

### Get Premise by ID

Retrieve details of a specific premise.

- **URL**: `/api/premises/{premiseId}/`
- **Method**: `GET`
- **Headers**: 
  - Authorization: Bearer {accessToken}

**Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Premise retrieved successfully",
  "data": {
    "id": "premise123",
    "name": "Headquarters Building",
    "address": "123 Main Street, City, Country",
    "contactPerson": "John Doe",
    "contactEmail": "john.doe@example.com",
    "contactPhone": "+1234567890",
    "maxDailyVisitors": 100,
    "createdAt": "2023-06-15T11:30:00Z",
    "updatedAt": "2023-06-15T11:30:00Z"
  }
}
```

### Update Premise

Update an existing premise.

- **URL**: `/api/premises/{premiseId}/`
- **Method**: `PUT`
- **Headers**: 
  - Authorization: Bearer {accessToken}
  - Content-Type: application/json

**Request Body**:
```json
{
  "name": "Updated Headquarters",
  "address": "123 Main Street, City, Country",
  "contactPerson": "John Doe",
  "contactEmail": "john.doe@example.com",
  "contactPhone": "+1234567890",
  "maxDailyVisitors": 150
}
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Premise updated successfully",
  "data": {
    "id": "premise123",
    "name": "Updated Headquarters",
    "address": "123 Main Street, City, Country",
    "contactPerson": "John Doe",
    "contactEmail": "john.doe@example.com",
    "contactPhone": "+1234567890",
    "maxDailyVisitors": 150,
    "createdAt": "2023-06-15T11:30:00Z",
    "updatedAt": "2023-06-15T14:45:00Z"
  }
}
```

### Delete Premise

Delete a premise from the system.

- **URL**: `/api/premises/{premiseId}/`
- **Method**: `DELETE`
- **Headers**: 
  - Authorization: Bearer {accessToken}

**Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Premise deleted successfully"
}
```

## Visitor Management APIs

### Create Visitor

Register a new visitor in the system.

- **URL**: `/api/visitors/`
- **Method**: `POST`
- **Headers**: 
  - Authorization: Bearer {accessToken}
  - Content-Type: application/json

**Request Body**:
```json
{
  "fullName": "Alice Johnson",
  "email": "alice.johnson@example.com",
  "phone": "+1122334455",
  "company": "ABC Corp",
  "purpose": "Business Meeting",
  "hostName": "Bob Smith",
  "hostEmail": "bob.smith@example.com",
  "hostPhone": "+1555666777"
}
```

**Response (201 Created)**:
```json
{
  "status": "success",
  "message": "Visitor created successfully",
  "data": {
    "id": "visitor789",
    "fullName": "Alice Johnson",
    "email": "alice.johnson@example.com",
    "phone": "+1122334455",
    "company": "ABC Corp",
    "purpose": "Business Meeting",
    "hostName": "Bob Smith",
    "hostEmail": "bob.smith@example.com",
    "hostPhone": "+1555666777",
    "createdAt": "2023-06-15T13:00:00Z",
    "updatedAt": "2023-06-15T13:00:00Z"
  }
}
```

### Get All Visitors

Retrieve a list of all visitors.

- **URL**: `/api/visitors/`
- **Method**: `GET`
- **Headers**: 
  - Authorization: Bearer {accessToken}

**Query Parameters**:
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `premiseId` (optional): Filter visitors by premise
- `status` (optional): Filter by check-in status (checked-in, checked-out, all)

**Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Visitors retrieved successfully",
  "data": {
    "visitors": [
      {
        "id": "visitor789",
        "fullName": "Alice Johnson",
        "email": "alice.johnson@example.com",
        "phone": "+1122334455",
        "company": "ABC Corp",
        "purpose": "Business Meeting",
        "hostName": "Bob Smith",
        "hostEmail": "bob.smith@example.com",
        "hostPhone": "+1555666777",
        "status": "checked-in",
        "checkInTime": "2023-06-15T13:15:00Z",
        "checkOutTime": null,
        "premiseId": "premise123",
        "createdAt": "2023-06-15T13:00:00Z",
        "updatedAt": "2023-06-15T13:15:00Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

### Get Visitor by ID

Retrieve details of a specific visitor.

- **URL**: `/api/visitors/{visitorId}/`
- **Method**: `GET`
- **Headers**: 
  - Authorization: Bearer {accessToken}

**Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Visitor retrieved successfully",
  "data": {
    "id": "visitor789",
    "fullName": "Alice Johnson",
    "email": "alice.johnson@example.com",
    "phone": "+1122334455",
    "company": "ABC Corp",
    "purpose": "Business Meeting",
    "hostName": "Bob Smith",
    "hostEmail": "bob.smith@example.com",
    "hostPhone": "+1555666777",
    "status": "checked-in",
    "checkInTime": "2023-06-15T13:15:00Z",
    "checkOutTime": null,
    "premiseId": "premise123",
    "createdAt": "2023-06-15T13:00:00Z",
    "updatedAt": "2023-06-15T13:15:00Z"
  }
}
```

### Update Visitor

Update an existing visitor's information.

- **URL**: `/api/visitors/{visitorId}/`
- **Method**: `PUT`
- **Headers**: 
  - Authorization: Bearer {accessToken}
  - Content-Type: application/json

**Request Body**:
```json
{
  "fullName": "Alice Johnson",
  "email": "alice.johnson@example.com",
  "phone": "+1122334455",
  "company": "XYZ Corp",
  "purpose": "Business Meeting",
  "hostName": "Bob Smith",
  "hostEmail": "bob.smith@example.com",
  "hostPhone": "+1555666777"
}
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Visitor updated successfully",
  "data": {
    "id": "visitor789",
    "fullName": "Alice Johnson",
    "email": "alice.johnson@example.com",
    "phone": "+1122334455",
    "company": "XYZ Corp",
    "purpose": "Business Meeting",
    "hostName": "Bob Smith",
    "hostEmail": "bob.smith@example.com",
    "hostPhone": "+1555666777",
    "status": "checked-in",
    "checkInTime": "2023-06-15T13:15:00Z",
    "checkOutTime": null,
    "premiseId": "premise123",
    "createdAt": "2023-06-15T13:00:00Z",
    "updatedAt": "2023-06-15T15:30:00Z"
  }
}
```

### Check-in Visitor

Register a visitor's check-in at a premise.

- **URL**: `/api/visitors/{visitorId}/check-in/`
- **Method**: `POST`
- **Headers**: 
  - Authorization: Bearer {accessToken}
  - Content-Type: application/json

**Request Body**:
```json
{
  "premiseId": "premise123",
  "notes": "Visitor has been issued a temporary badge"
}
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Visitor checked in successfully",
  "data": {
    "id": "visitor789",
    "fullName": "Alice Johnson",
    "status": "checked-in",
    "checkInTime": "2023-06-15T13:15:00Z",
    "premiseId": "premise123",
    "badgeNumber": "V12345",
    "notes": "Visitor has been issued a temporary badge"
  }
}
```

### Check-out Visitor

Register a visitor's check-out from a premise.

- **URL**: `/api/visitors/{visitorId}/check-out/`
- **Method**: `POST`
- **Headers**: 
  - Authorization: Bearer {accessToken}
  - Content-Type: application/json

**Request Body**:
```json
{
  "notes": "Visitor returned badge and left the premises"
}
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Visitor checked out successfully",
  "data": {
    "id": "visitor789",
    "fullName": "Alice Johnson",
    "status": "checked-out",
    "checkInTime": "2023-06-15T13:15:00Z",
    "checkOutTime": "2023-06-15T16:45:00Z",
    "premiseId": "premise123",
    "duration": "3 hours 30 minutes",
    "notes": "Visitor returned badge and left the premises"
  }
}
```

### Delete Visitor

Remove a visitor from the system.

- **URL**: `/api/visitors/{visitorId}/`
- **Method**: `DELETE`
- **Headers**: 
  - Authorization: Bearer {accessToken}

**Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Visitor deleted successfully"
}
```

## Testing the APIs

### Using Postman

1. **Setup Postman Collection**:
   - Download the [Visitor Management System Postman Collection](https://example.com/visitor-management-postman.json)
   - Import the collection into Postman
   - Set up environment variables for `baseUrl` and `accessToken`

2. **Authentication**:
   - Use the "Admin Login" request to obtain an access token
   - The token will be automatically set in the environment variables

3. **Testing Endpoints**:
   - All endpoints are organized by category in the collection
   - Each request includes pre-configured headers and example request bodies
   - Use the "Tests" tab to see example assertions

### Using cURL

Here are examples of how to use cURL to test the API endpoints:

**Admin Login**:
```bash
curl -X POST https://api.visitormanagement.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securePassword123"
  }'
```

**Create Premise (with authentication)**:
```bash
curl -X POST https://api.visitormanagement.com/api/premises \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Headquarters Building",
    "address": "123 Main Street, City, Country",
    "contactPerson": "John Doe",
    "contactEmail": "john.doe@example.com",
    "contactPhone": "+1234567890",
    "maxDailyVisitors": 100
  }'
```

**Check-in Visitor**:
```bash
curl -X POST https://api.visitormanagement.com/api/visitors/visitor789/check-in \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "premiseId": "premise123",
    "notes": "Visitor has been issued a temporary badge"
  }'
```

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests.

### Common Status Codes

- **200 OK**: The request was successful
- **201 Created**: A new resource was successfully created
- **400 Bad Request**: The request was invalid or cannot be served
- **401 Unauthorized**: Authentication is required or has failed
- **403 Forbidden**: The authenticated user doesn't have permission
- **404 Not Found**: The requested resource does not exist
- **422 Unprocessable Entity**: The request was well-formed but contains semantic errors
- **500 Internal Server Error**: An error occurred on the server

### Error Response Format

All error responses follow this format:

```json
{
  "status": "error",
  "message": "A human-readable error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is already in use"
    }
  ],
  "code": "RESOURCE_ALREADY_EXISTS"
}
```

### Common Error Codes

- `INVALID_CREDENTIALS`: Authentication failed due to invalid credentials
- `RESOURCE_NOT_FOUND`: The requested resource does not exist
- `VALIDATION_ERROR`: The request data failed validation
- `RESOURCE_ALREADY_EXISTS`: A resource with the same unique identifier already exists
- `PERMISSION_DENIED`: The user doesn't have permission to perform the action
- `TOKEN_EXPIRED`: The authentication token has expired
- `INTERNAL_ERROR`: An unexpected error occurred on the server

### Validation Errors

For validation errors (422 Unprocessable Entity), the response will include details about each validation failure:

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Must be a valid email address"
    },
    {
      "field": "phone",
      "message": "Phone number must be in international format"
    }
  ],
  "code": "VALIDATION_ERROR"
}
``` 
