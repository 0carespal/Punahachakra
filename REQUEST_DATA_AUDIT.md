# Request Data Audit

Date: 2026-09-09

## Findings

Company request creation was already connected to `POST /api/v1/requirements`, but the company dashboard and tracking view rendered fixed demo values. The Requests navigation also opened only the create form, so created records were not visible in the portal.

## Files Containing Request Placeholder Data

- `frontend/src/pages/CompanyPortal.tsx`: fixed dashboard metrics, request details, dates, tracking history, payment/match demo values, and fabricated request-form defaults.
- `frontend/src/pages/KabadiwalaPortal.tsx`: assigned-request and request-detail demo company/request values. These are outside the company request list and still need backend assignment data before they can be replaced safely.
- `frontend/src/imports/pasted_text/kabadiwala-connect-prototype.md`: design prompt containing intentional mock-data examples. It is not runtime code.

## Files Modified

- `backend/app/schemas/requirement.py`: added backend-derived `status` to requirement responses.
- `backend/app/repositories/requirement_repository.py`: eager-loads negotiations and transactions used to derive status.
- `frontend/src/services/requirement.service.ts`: added the requirement status type.
- `frontend/src/pages/CompanyPortal.tsx`: loads company requirements, uses database values for dashboard metrics and recent request, adds Request Logs, refreshes after creation, and removes fabricated request defaults/tracking values.

## Connected API Endpoints

- `POST /api/v1/requirements`: creates a company request.
- `GET /api/v1/requirements/me?page=1&page_size=100`: loads the logged-in company's requests, newest first through the backend repository ordering.
- `GET /api/v1/requirements/{requirement_id}`: remains available for request detail/tracking expansion.
- Requirement status is derived from persisted negotiations and transactions: `ACTIVE`, `MATCHED`, `NEGOTIATING`, `COMPLETED`, or `CANCELLED`.

## Remaining Mock Data

- `frontend/src/lib/constants.ts`: mock Kabadiwala directory used by profile/match fallback UI.
- `frontend/src/pages/CompanyPortal.tsx`: match/profile/payment screens still contain demo Kabadiwala, offer, and payment presentation data. These are not used by the request dashboard or Request Logs.
- `frontend/src/pages/KabadiwalaPortal.tsx`: assigned request, offer, earnings, and rating demo presentation data remain.
- `frontend/src/imports/pasted_text/kabadiwala-connect-prototype.md`: non-runtime prototype instructions and mock examples.

The company dashboard, recent request display, Request Logs, active count, request status, and post-create refresh now use backend requirement data.
