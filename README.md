# BioCatch Web SDK Assignment – Shahar Shlomo

A simple React Single Page Application that simulates an online user journey:
**Home → Login → Account Overview → Make Payment → Logout**.

The app loads the provided client-side JavaScript SDK, generates and manages a **Customer Session ID (CSID)**, changes context per screen, and triggers mocked server-side API calls (`init`, `getScore`) using `fetch`.

---

### 1) Client-Side SDK Integration
- Loads the provided SDK script in `index.html`.
- Generates a CSID and calls:
  - `cdApi.setCustomerSessionId(CSID)`
  - `cdApi.changeContext(contextName)` per screen

### 2) User Journey Simulation (SPA)
Screens:
- Home
- Login (triggers `init`)
- Account Overview
- Payment (triggers `getScore`)
- Logout

### 3) API Flow Simulation (Frontend Only)
- Sends `POST` requests using `fetch` to the provided Zapier webhook endpoint:
  - `action: "init"` on Login
  - `action: "getScore"` on Payment

### 4) Guardrail: `getScore` Only After `init`
- If the user tries to pay before login, the app shows a clear UI error message and logs it to the console.

---

## Note About CORS

The webhook endpoint may block browser calls due to **CORS policy** (no `Access-Control-Allow-Origin` header).
Because of that, the browser may fail the request before returning a readable response.

In This project:
- The app **still continues the user flow** even if the request is blocked.
- The app prints the error to console (expected behavior for this assignment environment).
- If the response is available, the app attempts to parse JSON and validate it.

---

## Response Validation (Console Only)
When a JSON response is available, the app performs a simple validation and logs the result.

Expected (example):
```json
{
  "attempt": "xxxx",
  "id": "019b...",
  "request_id": "019b...",
  "status": "success"
}
