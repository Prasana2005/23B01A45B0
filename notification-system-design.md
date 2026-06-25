# Notification System Design

# Stage 1

## Core Actions

The notification system should support the following operations:

- Fetch all notifications
- Fetch unread notifications
- Create a notification
- Mark a notification as read
- Mark all notifications as read
- Delete a notification
- Deliver real-time notifications

---

## REST API Design

### 1. Get All Notifications

**Method:** GET

**Endpoint:**

```text
/api/notifications
```

**Headers**

```text
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Response**

```json
{
  "notifications": [
    {
      "id": "uuid",
      "studentId": 1042,
      "type": "Placement",
      "title": "Placement Drive",
      "message": "Broadcom Inc. hiring",
      "isRead": false,
      "createdAt": "2026-06-25T09:27:16Z"
    }
  ]
}
```

---

### 2. Get Unread Notifications

**Method:** GET

**Endpoint**

```text
/api/notifications/unread
```

**Response**

```json
{
  "notifications": []
}
```

---

### 3. Create Notification

**Method:** POST

**Endpoint**

```text
/api/notifications
```

**Request**

```json
{
  "studentId": 1042,
  "type": "Placement",
  "title": "Placement Drive",
  "message": "Broadcom Inc. hiring"
}
```

**Response**

```json
{
  "message": "Notification created successfully"
}
```

---

### 4. Mark Notification as Read

**Method:** PATCH

**Endpoint**

```text
/api/notifications/{id}/read
```

**Response**

```json
{
  "message": "Notification marked as read"
}
```

---

### 5. Mark All Notifications as Read

**Method:** PATCH

**Endpoint**

```text
/api/notifications/read-all
```

**Response**

```json
{
  "message": "All notifications marked as read"
}
```

---

### 6. Delete Notification

**Method:** DELETE

**Endpoint**

```text
/api/notifications/{id}
```

**Response**

```json
{
  "message": "Notification deleted successfully"
}
```

---

## Real-Time Notification Mechanism

I propose using **WebSockets (Socket.IO)** for real-time notification delivery.

### Workflow

1. User logs in to the application.
2. A WebSocket connection is established.
3. Whenever a new notification is created, the server immediately pushes it to the connected user.
4. Every notification is also stored in the database so that users can access it later.

### Advantages

- Instant notification delivery
- Low latency
- Reduces repeated polling requests
- Scales well for thousands of connected users

# Stage 2

## Database Selection

For this notification system, I would prefer **PostgreSQL** as the database. Notifications have a clear relationship with students, and PostgreSQL is reliable for handling structured data. It supports transactions, indexing, and can efficiently manage a large number of records while maintaining data consistency.

## Database Schema

### Students

| Field     | Type                  |
| --------- | --------------------- |
| studentId | INTEGER (Primary Key) |
| name      | VARCHAR               |
| email     | VARCHAR               |

### Notifications

| Field            | Type                                 |
| ---------------- | ------------------------------------ |
| notificationId   | UUID (Primary Key)                   |
| studentId        | INTEGER (Foreign Key)                |
| notificationType | ENUM('Event', 'Result', 'Placement') |
| title            | VARCHAR                              |
| message          | TEXT                                 |
| isRead           | BOOLEAN                              |
| createdAt        | TIMESTAMP                            |

Each notification belongs to one student, while a student can have multiple notifications.

## Challenges as the System Grows

If the application grows to millions of notifications, a few issues may appear:

- Retrieving notifications may become slower.
- Searching unread notifications can take more time.
- Storage requirements will increase.
- A large number of simultaneous users can increase database load.

## Possible Improvements

To keep the application responsive, I would:

- Create indexes on frequently searched columns such as **studentId**, **isRead**, and **createdAt**.
- Fetch notifications page by page instead of loading everything at once.
- Archive very old notifications that users rarely access.
- Use Redis caching for frequently requested notification data.
- Partition notification records by date if the dataset becomes extremely large.

## Sample Queries

### Fetch all notifications of a student

```sql
SELECT *
FROM notifications
WHERE studentId = ?
ORDER BY createdAt DESC;
```

### Fetch unread notifications

```sql
SELECT *
FROM notifications
WHERE studentId = ?
AND isRead = FALSE
ORDER BY createdAt DESC;
```

### Mark a notification as read

```sql
UPDATE notifications
SET isRead = TRUE
WHERE notificationId = ?;
```

### Delete a notification

```sql
DELETE FROM notifications
WHERE notificationId = ?;
```

# Stage 3

## Is the given query correct?

Yes, the query is functionally correct because it returns all unread notifications for a particular student and sorts them by the most recent notification first.

```sql
SELECT *
FROM notifications
WHERE studentId = 1042
AND isRead = FALSE
ORDER BY createdAt DESC;
```

However, as the application grows to **50,000 students** and **5 million notifications**, this query will start taking longer to execute if the database has to scan a large number of records every time.

---

## Why is the query becoming slow?

The main reason is the increase in data volume. Without proper indexing, the database may perform a full table scan before filtering the required records.

The query also performs three operations:

- Filter by **studentId**
- Filter by **isRead**
- Sort using **createdAt**

Sorting a large number of rows can become expensive if suitable indexes are not available.

---

## How would I improve it?

Instead of relying on separate indexes, I would create a **composite index** that matches the query pattern.

```sql
CREATE INDEX idx_student_unread_created
ON notifications(studentId, isRead, createdAt DESC);
```

With this index, the database can directly locate unread notifications of a student in the required order, avoiding unnecessary scans and sorting.

---

## Expected Computation Cost

Without an index, the query is approximately **O(n)** because many rows may need to be scanned.

With the composite index, the lookup becomes much faster, approximately **O(log n)** to locate the matching records, followed by reading only the relevant rows.

---

## Should every column be indexed?

No.

Adding indexes on every column is not a good practice.

Reasons:

- Every INSERT, UPDATE and DELETE operation becomes slower because all indexes must also be updated.
- Extra disk space is consumed.
- Many indexes may never be used by the query optimizer.

Indexes should only be created on columns that are frequently used for filtering, sorting or joining.

---

## Query to find students who received Placement notifications in the last 7 days

```sql
SELECT DISTINCT studentId
FROM notifications
WHERE notificationType = 'Placement'
AND createdAt >= NOW() - INTERVAL '7 days';
```

This query returns the unique student IDs that received placement-related notifications during the last seven days.

# Stage 4

## Improving Performance When Notifications Are Loaded Frequently

Currently, notifications are fetched from the database every time a student opens or refreshes a page. As the number of users increases, this creates unnecessary load on the database and affects the application's response time.

To improve performance, I would use a combination of the following approaches.

### 1. Redis Cache

Frequently accessed notifications can be stored temporarily in Redis. When a user requests notifications, the application first checks the cache. If the data is available, it is returned immediately without querying the database. If not, the data is fetched from the database and stored in Redis for future requests.

**Advantages**

- Faster response time
- Reduced database load
- Better user experience

**Trade-off**

- Cache must be updated whenever notifications change.
- Additional memory is required.

---

### 2. Pagination

Instead of loading every notification, the application should fetch only a limited number of records, such as 20 notifications per request.

Example:

```text id="7lxmgg"
GET /api/notifications?page=1&limit=20
```

**Advantages**

- Smaller response size
- Faster queries
- Lower memory usage

**Trade-off**

- Users need additional requests to view older notifications.

---

### 3. Real-Time Updates

After the initial notification list is loaded, new notifications should be delivered using **WebSockets (Socket.IO)** instead of repeatedly requesting data from the server.

**Advantages**

- Instant notification delivery
- Eliminates continuous polling
- Reduces unnecessary API requests

**Trade-off**

- Managing WebSocket connections adds some implementation complexity.

---

### 4. Database Indexing

Create indexes on commonly queried columns such as:

- studentId
- isRead
- createdAt

This helps the database quickly locate unread notifications without scanning the entire table.

**Trade-off**

- Indexes consume additional storage.
- Write operations become slightly slower because indexes must also be updated.

---

## Final Recommendation

Instead of relying on only one optimization technique, I would combine:

- PostgreSQL indexing for efficient queries
- Redis caching for frequently accessed notifications
- Pagination to reduce response size
- WebSockets for real-time updates

Using these together provides good scalability while keeping both database load and response time under control.

# Stage 5

## Problems with the Current Implementation

The current implementation processes every student one after another.

```text
send_email()
save_to_db()
push_to_app()
```

This approach has a few drawbacks:

- Every operation waits for the previous one to finish, making the process slow.
- If sending an email fails, the remaining operations may not execute correctly.
- Processing 50,000 students sequentially will take a very long time.
- If the server crashes midway, some students may receive notifications while others may not.

---

## What if Email Fails for 200 Students?

If email delivery fails for 200 students, I would not stop the entire process.

The notification should already be stored in the database, and the failed email requests should be placed into a retry queue. A background worker can later retry sending those emails until they succeed or reach the retry limit.

This prevents data loss and improves reliability.

---

## Improved Design

Instead of processing everything synchronously, I would use an asynchronous architecture.

Flow:

1. HR clicks **Notify All**.
2. Notification details are saved once.
3. A message is pushed to a queue (RabbitMQ/Kafka/BullMQ).
4. Multiple worker processes consume the queue.
5. Each worker:
   - Saves the notification for a student.
   - Sends the email.
   - Pushes the in-app notification.

6. Failed email requests are automatically retried.

This approach is much faster because multiple workers can process students in parallel.

---

## Should Database Save and Email Sending Happen Together?

No.

Saving the notification and sending the email should not be tightly coupled.

The notification should first be saved successfully so that it is always available in the application. Email delivery can happen asynchronously because email services may experience temporary failures.

Separating these operations improves reliability and allows failed emails to be retried without affecting the stored notification.

---

## Revised Pseudocode

```text
function notifyAll(studentList, message):

    queue.publish({
        students: studentList,
        message: message
    })


Worker Process

while(queue.hasJobs()):

    job = queue.getNext()

    for each student in job.students:

        saveNotification(student, job.message)

        pushNotification(student, job.message)

        try:
            sendEmail(student, job.message)
        catch:
            retryQueue.add(student, job.message)
```

---

## Benefits of the Improved Solution

- Faster execution using parallel workers.
- Reliable notification storage.
- Failed emails can be retried automatically.
- Better scalability for thousands of users.
- Prevents a single failure from stopping the complete process.

# Stage 6

## Approach

To implement the Priority Inbox, every unread notification is assigned a priority score.

The priority depends on two factors:

- Notification type
- Recency

Placement notifications are considered the most important, followed by Result notifications and then Event notifications.

Weights used:

- Placement = 3
- Result = 2
- Event = 1

The final priority is calculated by combining the notification weight with the notification timestamp. After calculating the score, notifications are sorted in descending order and the first 10 notifications are displayed.

## Maintaining Top 10 Efficiently

As new notifications arrive continuously, re-sorting the complete notification list every time is inefficient.

Instead, I would maintain a **Min Heap (Priority Queue)** of size 10.

- If the heap has fewer than 10 notifications, insert the new notification.
- If the heap already contains 10 notifications, compare the new notification with the lowest priority notification.
- Replace the lowest priority notification only if the new one has a higher priority.

This keeps the complexity close to **O(log 10)** per insertion, which is effectively constant time.

The approach is memory efficient and works well even when millions of notifications are generated.
