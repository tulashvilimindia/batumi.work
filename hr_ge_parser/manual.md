# HR.GE API - Manual Endpoint Input

## Instructions
Add any endpoints you discover manually (from browser DevTools, network inspection, etc.) below.
Format: `METHOD URL` followed by any relevant headers or body.

---

## User-Provided Endpoints

### Add your discoveries here:

```
# Example format:
# POST https://api.p.hr.ge/public-portal/tenant/1/api/v3/announcement/list
# Headers: Content-Type: application/json
# Body: {"page": 1, "pageSize": 20}
```

---

## Endpoints to Investigate

1. Open hr.ge in Chrome
2. Open DevTools (F12) -> Network tab
3. Filter by "XHR" or "Fetch"
4. Navigate to job listings page
5. Copy the API calls you see

---

## Priority Investigation Areas

- [ ] Job listing/search endpoint (POST body structure)
- [ ] Pagination parameters
- [ ] Filter parameters (location, industry, salary)
- [ ] Authentication headers (if any)
- [ ] Rate limiting headers

---

## Notes Section

(Add any observations here)

