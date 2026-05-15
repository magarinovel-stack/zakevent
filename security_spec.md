# Security Specification for ZAKEVENTS

## Data Invariants
1. A **User** profile can only be modified by the user themselves.
2. A **ProviderProfile** can be created by a user with role 'PRESTATAIRE', but its 'status' can only be modified by an 'ADMIN'.
3. A **Booking** can only be seen by the client who made it or the provider who received it.
4. Transitions for **Booking.status** are strict: PENDING -> CONFIRMED -> COMPLETED...
5. **chargilyTransactionId** is immutable once set.
6. **Review** can only be created by the client of a COMPLETED booking.

## The Dirty Dozen Payloads (Forbidden)
1. User A updates User B's profile.
2. Provider sets their own status to 'APPROVED'.
3. Client reads another client's bookings.
4. Provider updates the 'clientId' of a booking.
5. User injects 1MB string into 'city' field.
6. User creates a review for a booking they don't own.
7. User creates a review for a booking that is 'PENDING'.
8. User modifies 'createdAt' timestamp.
9. User modifies 'priceDa' of a package after a booking is made (using update-gap).
10. Unauthenticated user listing all messages.
11. Provider deleting a review.
12. Client updating 'commissionDa'.

## The Invariants
- Identity roles must be verified against `/users/{uid}`.
- Relational sync: Booking must exist for Review.
- Temporal integrity: All timestamps use `request.time`.
