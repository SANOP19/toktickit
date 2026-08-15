# Lab 1 — Test Plan and Evidence

All test files live under server/tests/lab-01/ and client/tests/lab-01/.

| # | Tool | Test | Result |
|---|------|------|--------|
| 1 | Supertest | GET /api/health returns 200, status=ok | PASS |
| 2 | Supertest | GET /api/categories returns 4 seeded categories in id order | PASS |
| 3 | Vitest | Heading renders | PASS |
| 4 | Vitest | Success state shows Online + category list | PASS |
| 5 | Vitest | Error state shows Offline + message | PASS |

### Terminal Output Evidence

```text
Server Tests:
 RUN  v2.1.9 C:/Users/nopni/Downloads/toktickit/server

 ✓ tests/lab-01/health.test.ts (1 test) 20ms
 ✓ tests/lab-01/categories.test.ts (1 test) 48ms

 Test Files  2 passed (2)
      Tests  2 passed (2)

Client Tests:
 RUN  v2.1.9 C:/Users/nopni/Downloads/toktickit/client

 ✓ tests/lab-01/App.test.tsx (3 tests) 82ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
```
