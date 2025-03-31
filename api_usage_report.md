# API Usage and Evaluation Report

## 1. Overview

This report provides an evaluation of the API usage across the Django backend and the React frontend. The backend is built using Django with apps for authentication and visitor management, while the frontend, built with React (Vite), consumes these endpoints through dedicated service files. While the backend endpoints are defined and follow best practices, certain frontend components still utilize mock data, and there are discrepancies in payload field naming.

## 2. Backend API Endpoints Summary

**Authentication Endpoints:**

- **POST /api/v1/auth/signup/**: User registration via `AuthViewSet.signup`.
- **POST /api/v1/auth/signin/**: User login via `AuthViewSet.signin`.
- **POST /api/v1/auth/refresh/**: JWT token refresh endpoint, used by axios interceptors.
- **POST /api/v1/auth/logout/**: Intended for logout operations (endpoint defined in the auth service).

### Signup API Request Example

**Request URL:** `http://localhost:8080/api/v1/auth/signup/`

**Request Method:** POST

**Status Code:** 404 Not Found

**Remote Address:** `[::1]:8080`

**Referrer Policy:** strict-origin-when-cross-origin

**Response Headers:** _[Raw information from the browser]_ 

**Request Headers:** _[Raw information from the browser]_ 

**Payload:**
```json
{
  "username": "owinoalfred",
  "email": "owin@win.com",
  "password": "sixesrolling",
  "confirm_password": "sixesrolling",
  "first_name": "alfred",
  "last_name": "owino",
  "premise_name": "nana hostel",
  "premise_address": ""
}
```

**Premises Management Endpoints:**

- **GET /api/v1/auth/premises/**: Retrieves a list of premises.
- **POST /api/v1/auth/premises/**: Creates a new premise.
- **GET /api/v1/auth/premises/{premise_id}/**: Retrieves details for a specific premise.
- **PUT /api/v1/auth/premises/{premise_id}/**: Updates a specific premise's information.
- **DELETE /api/v1/auth/premises/{premise_id}/**: Deletes a premise.
- **GET /api/v1/auth/premises/{premise_id}/qr_code/**: Retrieves the QR code URL for the premise.
- **GET /api/v1/auth/premises/{premise_id}/download_qr_code/**: Provides a download link for the QR code image.

**Visitor Management Endpoints:**

- **GET /api/v1/visitors/**: Lists visitors with filtering options.
- **POST /api/v1/visitors/signin/**: Processes visitor sign-in; accepts multipart form data.
- **POST /api/v1/visitors/{visitor_id}/approve/**: Approves a visitor and updates sign-in status.
- **POST /api/v1/visitors/{visitor_id}/reject/**: Rejects a visitor and logs rejection time.
- **POST /api/v1/visitors/signout/**: Processes visitor sign-out based on IP address matching.
- **GET /api/v1/visitors/{visitor_id}/**: Retrieves detailed visitor information (for admin use).

## 3. Frontend API Usage Analysis

- **Auth Service (auth.ts):**
  - Provides methods for signup, signin, token refresh, and logout, corresponding directly to backend endpoints.

- **Premises Service (premises.ts):**
  - Includes methods for handling premises CRUD operations and QR code retrieval. However, components like the QR Code page use mock data instead of live API calls.

- **Visitors Service (visitors.ts):**
  - Implements visitor sign-in, approval, rejection, and sign-out. The sign-in form in the `VisitorSignIn.tsx` component submits data that does not fully align with the expected backend fields.

## 4. Identified Gaps and Recommendations

1. **Usage of Mock Data in Frontend:**
   - Some components, such as the QR Code generator, use hardcoded mock data. Updating these components to call live API endpoints will improve integration.

2. **Payload Mismatches in Visitor Sign-In:**
   - The frontend form uses field names (e.g., `last_name`, `email`, `company`, `purpose`, `host_name`, `host_email`) that differ from the backend's expected names (`first_name`, `second_name`, `phone_number`, `person_visiting`, `room_number`, `reason`). Alignment of these fields is necessary.

3. **Unused or Unreferenced Endpoints:**
   - Endpoints for QR code generation and download are defined but not utilized in production. Evaluation is required to determine whether to integrate or deprecate these endpoints.

4. **General Backend Quality:**
   - The backend is well-structured and adheres to best practices. Enhanced API documentation and test coverage can further strengthen integration with the frontend.

## 5. Next Steps

- **Frontend Developers:**
  - Replace mock data with live API calls using the endpoints defined in `premisesApi` and ensure consistency in payload structure.

- **Backend Developers:**
  - Provide detailed API documentation, especially for token refresh and logout endpoints, and ensure thorough testing.

- **Project Leads:**
  - Continually review API usage to identify potential refactoring or deprecation needs.

---

**Conclusion:**

The existing backend is robust and well-organized, but the frontend integration can be improved by utilizing live endpoints and by aligning field names between the frontend and backend. Maintaining and periodically updating this report will help ensure ongoing consistency and integration quality.
