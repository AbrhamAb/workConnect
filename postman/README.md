# WorkConnect Postman Setup

Import these two files into Postman:

- `postman/WorkConnect API.postman_collection.json`
- `postman/WorkConnect API.postman_environment.json`

## Environment

Set the active environment to `WorkConnect Local`.

Default variables:

- `baseUrl` = `http://localhost:8080`
- `apiBaseUrl` = `http://localhost:8080/api/v1`
- `workerProfileID` = `1`
- `categoryID` = `1`
- `requestID` = `1`
- `customerToken`, `workerToken`, `adminToken` are filled automatically by the register/login tests.

Important: the health check is at `http://localhost:8080/health`, not under `/api/v1`.
If you send `GET {{apiBaseUrl}}/health`, Postman will return `404 Not Found` because that path does not exist.

## Recommended Order

1. `Public/Health`
2. `Auth/Register` for customer, worker, and admin.
3. `Auth/Login` if you want to refresh tokens.
4. `Auth/Me` for each role.
5. `Admin/Pending Worker Verifications` and `Admin/Verify Worker`.
6. `Public/List Workers` and `Public/Get Worker Profile`.
7. `Customer/Create Service Request`.
8. `Worker/Accept or Reject Request`.
9. `Worker/Complete Request` after the work is done.
10. `Messages/List Conversations`, `Messages/List Messages By Request`, and `Messages/Send Message`.
11. `Customer/Initiate Payment`.
12. `Customer/Review Request` after the service request is completed.

## Notes

- The customer, worker, and admin register/login requests save tokens into environment variables automatically.
- The `workerProfileID`, `requestID`, and `categoryID` variables may need to be updated after real API responses if your seeded IDs differ.
- `workerProfileID` is the worker profile row id, not the auth user id.
- `Auth/Me` for a worker now returns `workerProfileId` so you can use the correct ID directly in Postman.
- `Customer/Review Request` will return a validation or state error until the request is in the completed state.
- `Worker/Complete Request` moves an accepted request to `completed`, which is what unlocks customer review.
- Messaging endpoints only work after the worker accepts the request.

If you want to do it manually in Postman, open the `Auth/Login` request, go to `Scripts`, then `Post-response`, and use:

```javascript
if (pm.response.code === 200) {
  const body = pm.response.json();
  if (body.token) {
    pm.environment.set("customerToken", body.token);
    pm.collectionVariables.set("customerToken", body.token);
    console.log("customerToken updated", body.token);
  }
}
```

If it still looks unchanged, check the environment editor's `Current Value` column, not just `Initial Value`.
The login response updates the active environment only when `WorkConnect Local` is selected.

## Seed Suggestions

After importing, it is easiest to run the collection in this order:

- Register all three roles.
- Log in all three roles.
- Use `Admin/Pending Worker Verifications` to find the worker profile ID.
- Use `Admin/Verify Worker`.
- Use `Public/List Workers` to confirm the worker is visible.
- Create a customer request and capture `requestID` from the response.
- Accept the request as the worker.
- Mark the request completed as the worker.
- Send/list messages.
- Initiate payment.
- Use `Worker/Complete Request` before `Customer/Review Request`; no DB hack is needed anymore.
