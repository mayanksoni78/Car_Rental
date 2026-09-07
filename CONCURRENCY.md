# Hardening Booking Concurrency in Car Rental App

This document explains the concurrency controls implemented in the car rental application to prevent double-booking race conditions under high concurrent load. 

## The Problem: Race Conditions

In a typical booking flow, the application checks if a car is available for a requested date range and, if true, creates a new booking record:

```javascript
// The problematic approach
const isAvailable = await checkAvailability(carId, dates);
if (isAvailable) {
   await Booking.create({...}); // RACE CONDITION HERE
}
```

If two users try to book the same car at the exact same millisecond, they both pass the `checkAvailability` check before either user creates a booking. The result is two conflicting bookings for the same car.

## The Solution: Atomic Operations & Transactions

To make this provably correct without adding external queues or caches (like Redis), we handle concurrency directly at the database level using MongoDB atomic operations and transactions.

### 1. Atomic Locking (`findOneAndUpdate`)

We modified the `Car` schema to include an array of `reservedSlots`. Instead of separating the availability check and the insertion, we combine them into a single, indivisible atomic operation using Mongoose's `findOneAndUpdate`.

```javascript
const updatedCar = await Car.findOneAndUpdate(
    {
        _id: carId,
        isAvailable: true,
        // The Lock: This query fails if ANY existing reservedSlot overlaps with the requested dates
        reservedSlots: {
            $not: {
                $elemMatch: {
                    pickupDate: { $lt: requestedReturnDate },
                    returnDate: { $gt: requestedPickupDate }
                }
            }
        }
    },
    {
        // The Atomic Action: Push the new dates into the array
        $push: { 
            reservedSlots: { pickupDate, returnDate, bookingId }
        }
    }
);
```

Because MongoDB processes single-document updates atomically, if 50 requests hit this line simultaneously, only **one** request will successfully match the document and push its slot. The remaining 49 requests will return `null` and safely fail.

### 2. ACID Transactions

The booking process involves updating the `Car` model (locking the slot) and creating a `Booking` record. To ensure data consistency, both operations are wrapped inside a **MongoDB Transaction** (`session.startTransaction()`). 

If creating the booking or initiating the payment fails, the entire transaction is rolled back, instantly freeing up the `reservedSlots` lock on the car without any manual cleanup.

### 3. Retry Logic with Exponential Backoff

In high-concurrency environments, MongoDB transactions can sometimes throw `TransientTransactionError` or `WriteConflict` (e.g., error code 112). We implemented a recursive retry wrapper (`withRetry`) that uses exponential backoff. If a legitimate transaction fails purely due to a database-level write conflict, it pauses for a few milliseconds and tries again automatically without dropping the user's request.

### 4. Idempotency Keys

To prevent double-charging or duplicate bookings caused by users double-clicking the "Book" button or network retries, the endpoint now accepts an `Idempotency-Key` header.

We added a unique index on the `idempotencyKey` field in the `Booking` schema. If a network request is duplicated, MongoDB immediately rejects the second insertion via a `Duplicate Key Error` (11000), which our controller catches and safely ignores, returning success without creating a duplicate record.

## Stress Testing

We have a standalone script (`stress-test.js`) that simulates heavy concurrent load to prove this architecture. 

It fires **50 simultaneous requests** attempting to book the exact same car for the exact same dates.
- **Expected Result:** 1 request succeeds (HTTP 200), 49 requests are safely rejected (HTTP 400).
- **Run the test:** `node stress-test.js` from the `server` directory.
