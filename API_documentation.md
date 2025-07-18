# API Documentation

This document provides details on all the available API endpoints in the application.

---

## SSLCommerz Integration Test

**Endpoint:** `/api/test-sslcommerz`

**Method:** `GET`

**Description:**
This endpoint tests if the SSLCommerz payment gateway package (`sslcommerz-lts` or `sslcommerz`) is installed and can be instantiated correctly. It's a health check for the payment gateway integration.

**Responses:**

*   **200 OK** - SSLCommerz package is loaded successfully.
    ```json
    {
      "success": true,
      "message": "SSLCommerz package loaded successfully",
      "packageDetails": {
        "type": "function",
        "hasInit": true
      }
    }
    ```

*   **500 Internal Server Error** - SSLCommerz package is not found or failed to load.
    ```json
    {
      "error": "SSLCommerz test failed",
      "details": "No SSLCommerz package found"
    }
    ```

**Example Usage:**

```bash
curl http://localhost:3000/api/test-sslcommerz
```

---

## Test SMS Configuration

**Endpoint:** `/api/admin/sms-test`

**Method:** `POST`

**Description:**
This endpoint sends a test SMS to a specified number to verify the SMS configuration with SMSBangladesh.

**Request Body:**

```json
{
  "testNumber": "017XXXXXXXX",
  "user": "your_sms_username",
  "password": "your_sms_password",
  "from": "YourSenderID"
}
```

**Responses:**

*   **200 OK** - Test SMS sent successfully. The body contains the response from the SMS provider.
*   **400 Bad Request** - Missing required fields.
*   **405 Method Not Allowed** - Only POST requests are accepted.
*   **500 Internal Server Error** - Failed to send the test SMS.

**Example Usage:**

```bash
curl -X POST http://localhost:3000/api/admin/sms-test \
-H "Content-Type: application/json" \
-d '{
  "testNumber": "01700000000",
  "user": "your_username",
  "password": "your_password",
  "from": "Anjums"
}'
```

---

## Test Admin Authentication

**Endpoint:** `/api/admin/test-auth`

**Method:** `GET`

**Description:**
This endpoint verifies the authentication token of an admin user. It checks for a JWT in the `Authorization` header or a `token` cookie. The token must contain a payload with `role: 'ADMIN'`.

**Headers:**

*   `Authorization`: `Bearer <your_jwt_token>` (optional, if not using cookies)

**Cookies:**

*   `token`: `<your_jwt_token>` (optional, if not using headers)

**Responses:**

*   **200 OK** - Authentication is successful.
    ```json
    {
      "message": "Authentication successful",
      "user": {
        "id": 1,
        "role": "ADMIN",
        "iat": 1626782233,
        "exp": 1626868633
      }
    }
    ```
*   **401 Unauthorized** - No token is provided or the token is invalid.
*   **403 Forbidden** - The user is not an admin.

**Example Usage:**

```bash
# Using Authorization Header
curl http://localhost:3000/api/admin/test-auth -H "Authorization: Bearer <your_admin_token>"

# Using Cookies
curl http://localhost:3000/api/admin/test-auth --cookie "token=<your_admin_token>"
```

---

## Get All Orders (Admin)

**Endpoint:** `/api/admin/orders`

**Method:** `GET`

**Description:**
Retrieves a paginated list of all orders for the admin panel. It supports filtering by status and searching by customer details.

**Query Parameters:**

*   `page` (optional): The page number for pagination (default: 1).
*   `limit` (optional): The number of orders per page (default: 50).
*   `status` (optional): Filter orders by status (e.g., `PENDING`, `PROCESSING`, `COMPLETED`, `CANCELLED`).
*   `search` (optional): Search for orders by customer name, phone, or email.

**Responses:**

*   **200 OK** - A list of orders.
    ```json
    [
      {
        "id": 1,
        "customerName": "John Doe",
        "customerPhone": "01700000000",
        "customerEmail": "john.doe@example.com",
        "total": 1500,
        "status": "PENDING",
        "createdAt": "2023-10-27T10:00:00.000Z",
        "user": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com"
        },
        "orderItems": [
          {
            "product": {
              "id": 101,
              "name": "Sample Product",
              "image": "/uploads/sample.jpg"
            },
            "quantity": 2,
            "price": 750
          }
        ]
      }
    ]
    ```
*   **405 Method Not Allowed** - Only GET requests are accepted.
*   **500 Internal Server Error** - An error occurred while fetching the orders.

**Example Usage:**

```bash
# Get all orders with default pagination
curl http://localhost:3000/api/admin/orders

# Get the second page of orders with a limit of 10
curl http://localhost:3000/api/admin/orders?page=2&limit=10

# Get all pending orders
curl http://localhost:3000/api/admin/orders?status=PENDING

# Search for orders by customer name
curl http://localhost:3000/api/admin/orders?search=John
```

---

## Get and Update a Specific Order (Admin)

**Endpoint:** `/api/admin/orders/{id}`

**Methods:** `GET`, `PUT`

**Description:**
*   **GET:** Retrieves the details of a specific order by its ID.
*   **PUT:** Updates the status or payment status of a specific order.

**URL Parameters:**

*   `id` (required): The ID of the order.

**PUT Request Body:**

```json
{
  "status": "PROCESSING",
  "paymentStatus": "PAID"
}
```

**Responses:**

*   **200 OK** - The order details or the updated order.
*   **400 Bad Request** - Invalid order ID or no fields to update.
*   **404 Not Found** - The order with the specified ID was not found.
*   **405 Method Not Allowed** - Only GET and PUT requests are accepted.
*   **500 Internal Server Error** - An error occurred.

**Example Usage:**

```bash
# Get order details
curl http://localhost:3000/api/admin/orders/1

# Update order status
curl -X PUT http://localhost:3000/api/admin/orders/1 \
-H "Content-Type: application/json" \
-d '{
  "status": "COMPLETED",
  "paymentStatus": "PAID"
}'
```

---

## SMS Campaigns

**Endpoint:** `/api/admin/sms-campaigns`

**Methods:** `GET`, `POST`

**Description:**
*   **GET:** Retrieves a list of all SMS campaigns.
*   **POST:** Creates a new SMS campaign.

**POST Request Body:**

```json
{
  "name": "New Year Promo",
  "message": "Happy New Year! Get 20% off on all products.",
  "recipients": ["+8801700000000", "+8801800000000"],
  "scheduledAt": "2024-12-31T18:00:00.000Z"
}
```

**Responses (GET):**

*   **200 OK** - A list of SMS campaigns.
    ```json
    {
      "campaigns": [
        {
          "id": 1,
          "name": "New Year Promo",
          "message": "Happy New Year! Get 20% off on all products.",
          "status": "SCHEDULED",
          "scheduledAt": "2024-12-31T18:00:00.000Z",
          "totalCount": 2,
          "deliveredCount": 0,
          "failedCount": 0,
          "createdAt": "2023-10-27T10:00:00.000Z"
        }
      ]
    }
    ```

**Responses (POST):**

*   **201 Created** - The campaign was created successfully.
*   **400 Bad Request** - Missing required fields, invalid phone numbers, or message too long.
*   **500 Internal Server Error** - Failed to create the campaign.

**Example Usage:**

```bash
# Get all SMS campaigns
curl http://localhost:3000/api/admin/sms-campaigns

# Create a new SMS campaign
curl -X POST http://localhost:3000/api/admin/sms-campaigns \
-H "Content-Type: application/json" \
-d '{
  "name": "Eid Offer",
  "message": "Special discount for Eid!",
  "recipients": ["+8801711111111"]
}'
```

---

## Get, Update, and Delete a Specific SMS Campaign

**Endpoint:** `/api/admin/sms-campaigns/{campaignId}`

**Methods:** `GET`, `PUT`, `DELETE`

**Description:**
*   **GET:** Retrieves the details of a specific SMS campaign, including recent logs.
*   **PUT:** Updates the details of a `DRAFT` or `SCHEDULED` campaign.
*   **DELETE:** Deletes a campaign and its associated logs.

**URL Parameters:**

*   `campaignId` (required): The ID of the SMS campaign.

**PUT Request Body:**

```json
{
  "name": "Updated Campaign Name",
  "message": "Updated message content.",
  "recipients": ["+8801900000000"],
  "scheduledAt": "2025-01-01T10:00:00.000Z"
}
```

**Responses:**

*   **200 OK** - The campaign details, a success message for update, or a success message for deletion.
*   **400 Bad Request** - Invalid campaign ID or trying to edit a campaign that is not a draft or scheduled.
*   **404 Not Found** - The campaign with the specified ID was not found.
*   **405 Method Not Allowed** - Only GET, PUT, and DELETE requests are accepted.
*   **500 Internal Server Error** - An error occurred.

**Example Usage:**

```bash
# Get campaign details
curl http://localhost:3000/api/admin/sms-campaigns/1

# Update a campaign
curl -X PUT http://localhost:3000/api/admin/sms-campaigns/1 \
-H "Content-Type: application/json" \
-d '{
  "name": "Special Offer",
  "message": "New special offer just for you!"
}'

# Delete a campaign
curl -X DELETE http://localhost:3000/api/admin/sms-campaigns/1
```

---

## Send an SMS Campaign

**Endpoint:** `/api/admin/sms-campaigns/{campaignId}/send`

**Method:** `POST`

**Description:**
Sends a `DRAFT` or `SCHEDULED` SMS campaign immediately. It updates the campaign status and logs the sending activity.

**URL Parameters:**

*   `campaignId` (required): The ID of the SMS campaign to send.

**Request Body:**

```json
{
  "apiConfig": {
    "user": "your_sms_username",
    "password": "your_sms_password",
    "from": "YourSenderID"
  }
}
```

**Responses:**

*   **200 OK** - The campaign was sent successfully.
    ```json
    {
      "message": "Campaign sent successfully",
      "campaign": { ... },
      "stats": {
        "totalCount": 100,
        "deliveredCount": 98,
        "failedCount": 2,
        "successRate": "98.00"
      }
    }
    ```
*   **400 Bad Request** - Invalid campaign ID, missing API configuration, or the campaign has already been sent.
*   **404 Not Found** - The campaign with the specified ID was not found.
*   **405 Method Not Allowed** - Only POST requests are accepted.
*   **500 Internal Server Error** - An error occurred while sending the campaign.

**Example Usage:**

```bash
curl -X POST http://localhost:3000/api/admin/sms-campaigns/1/send \
-H "Content-Type: application/json" \
-d '{
  "apiConfig": {
    "user": "your_username",
    "password": "your_password",
    "from": "Anjums"
  }
}'
```

---

## WhatsApp Campaigns

**Endpoint:** `/api/admin/whatsapp/campaigns`

**Methods:** `GET`, `POST`

**Description:**
*   **GET:** Retrieves a list of all WhatsApp campaigns.
*   **POST:** Creates a new WhatsApp campaign. Can also send the campaign immediately if `sendImmediately` is true.

**POST Request Body:**

```json
{
  "name": "WhatsApp Promotion",
  "messageType": "TEXT", // or TEMPLATE, MEDIA
  "textMessage": "Check out our new products!",
  "templateName": null,
  "templateParams": null,
  "mediaUrl": null,
  "mediaType": null,
  "recipients": ["+15551234567", "15557654321"],
  "scheduledAt": null,
  "sendImmediately": true
}
```

**Responses (GET):**

*   **200 OK** - A list of WhatsApp campaigns.

**Responses (POST):**

*   **201 Created** - The campaign was created successfully.
*   **400 Bad Request** - Missing required fields or invalid data.
*   **500 Internal Server Error** - Failed to create or send the campaign.

**Example Usage:**

```bash
# Get all WhatsApp campaigns
curl http://localhost:3000/api/admin/whatsapp/campaigns

# Create and send a new WhatsApp campaign immediately
curl -X POST http://localhost:3000/api/admin/whatsapp/campaigns \
-H "Content-Type: application/json" \
-d '{
  "name": "Instant WhatsApp Blast",
  "messageType": "TEXT",
  "textMessage": "This is an instant message.",
  "recipients": ["+15550001111"],
  "sendImmediately": true
}'
```

---

## WhatsApp Configuration Status

**Endpoint:** `/api/admin/whatsapp/config-status`

**Method:** `GET`

**Description:**
Checks the status of the WhatsApp Business API configuration by reading environment variables. It also performs basic API tests to validate the credentials if they are present.

**Responses:**

*   **200 OK** - The status of the WhatsApp configuration.
    ```json
    {
      "message": "WhatsApp configuration status",
      "configStatus": {
        "accessToken": { "present": true, "length": 150, "preview": "EAA..." },
        "phoneNumberId": { "present": true, "value": "123456789012345" },
        "businessAccountId": { "present": true, "value": "987654321098765" },
        "webhookVerifyToken": { "present": true, "value": "configured" },
        "apiVersion": "v18.0"
      },
      "tests": {
        "apiTest": { "success": true, "data": { "name": "Your App Name", "id": "..." } },
        "businessAccountTest": { "success": true, "data": { "name": "Your Business", "id": "..." } },
        "phoneNumberTest": { "success": true, "data": { "verified_name": "Your Brand", "display_phone_number": "1 555-123-4567", "id": "..." } }
      },
      "nextSteps": ["All configuration looks good! Try sending a test message."]
    }
    ```
*   **405 Method Not Allowed** - Only GET requests are accepted.
*   **500 Internal Server Error** - An error occurred while checking the configuration.

**Example Usage:**

```bash
curl http://localhost:3000/api/admin/whatsapp/config-status
```

---

## WhatsApp Message Templates

**Endpoint:** `/api/admin/whatsapp/templates`

**Methods:** `GET`, `POST`

**Description:**
*   **GET:** Retrieves a list of WhatsApp message templates. It first tries to fetch the latest templates from the Meta API and syncs them with the local database.
*   **POST:** Creates a new message template in both the Meta API and the local database.

**POST Request Body:**

```json
{
  "name": "order_confirmation",
  "displayName": "Order Confirmation",
  "category": "TRANSACTIONAL",
  "language": "en_US",
  "components": [
    { "type": "HEADER", "format": "TEXT", "text": "Your order is confirmed!" },
    { "type": "BODY", "text": "Hi {{1}}, thanks for your order. Your order number is {{2}}." },
    { "type": "FOOTER", "text": "Thank you for shopping with us." }
  ]
}
```

**Responses (GET):**

*   **200 OK** - A list of WhatsApp message templates from the database.

**Responses (POST):**

*   **201 Created** - The template was created successfully.
*   **400 Bad Request** - Missing required fields or invalid component structure.
*   **500 Internal Server Error** - Failed to create the template in the Meta API or database.

**Example Usage:**

```bash
# Get all message templates
curl http://localhost:3000/api/admin/whatsapp/templates

# Create a new message template
curl -X POST http://localhost:3000/api/admin/whatsapp/templates \
-H "Content-Type: application/json" \
-d '{
  "name": "shipping_update",
  "displayName": "Shipping Update",
  "category": "TRANSACTIONAL",
  "language": "en_US",
  "components": [
    { "type": "BODY", "text": "Your order {{1}} has shipped!" }
  ]
}'
```

---

## Test WhatsApp Webhook

**Endpoint:** `/api/admin/whatsapp/test-webhook`

**Method:** `POST`

**Description:**
Tests the WhatsApp webhook verification process by sending a simulated verification request to the provided URL. This is used to confirm that the webhook is correctly configured to handle GET requests from Meta for verification.

**Request Body:**

```json
{
  "webhookUrl": "https://your-app.com/api/webhooks/whatsapp"
}
```

**Responses:**

*   **200 OK** - The webhook verification was successful.
*   **400 Bad Request** - The webhook URL is missing or the verification failed.
*   **500 Internal Server Error** - An error occurred while testing the webhook.

**Example Usage:**

```bash
curl -X POST http://localhost:3000/api/admin/whatsapp/test-webhook \
-H "Content-Type: application/json" \
-d '{
  "webhookUrl": "https://your-live-url.com/api/webhooks/whatsapp"
}'
```

---

## Send Test WhatsApp Message

**Endpoint:** `/api/admin/whatsapp/test`

**Method:** `POST`

**Description:**
Sends a single test message to a specified phone number using the configured WhatsApp Business API. Currently, it only supports sending text messages.

**Request Body:**

```json
{
  "phoneNumber": "+15551234567",
  "message": "This is a test message from the API.",
  "messageType": "text"
}
```

**Responses:**

*   **200 OK** - The test message was sent successfully.
*   **400 Bad Request** - Missing phone number or message, or the message content is invalid.
*   **405 Method Not Allowed** - Only POST requests are accepted.
*   **500 Internal Server Error** - Failed to send the message, often due to missing or incorrect API configuration.

**Example Usage:**

```bash
curl -X POST http://localhost:3000/api/admin/whatsapp/test \
-H "Content-Type: application/json" \
-d '{
  "phoneNumber": "+15557654321",
  "message": "Hello from the test endpoint!"
}'
```

---

## Get, Update, and Delete a Specific WhatsApp Campaign

**Endpoint:** `/api/admin/whatsapp/campaigns/{id}`

**Methods:** `GET`, `PUT`, `DELETE`

**Description:**
*   **GET:** Retrieves the details of a specific WhatsApp campaign, including its logs.
*   **PUT:** Updates the details of a campaign that has not been sent yet.
*   **DELETE:** Deletes a WhatsApp campaign and its associated logs.

**URL Parameters:**

*   `id` (required): The ID of the WhatsApp campaign.

**PUT Request Body:**

```json
{
  "name": "Updated WhatsApp Promo",
  "textMessage": "An updated message for our customers.",
  "recipients": "+15551112222, +15553334444"
}
```

**Responses:**

*   **200 OK** - The campaign details, a success message for update, or a success message for deletion.
*   **400 Bad Request** - Invalid campaign ID or trying to edit a sent campaign.
*   **404 Not Found** - The campaign with the specified ID was not found.
*   **405 Method Not Allowed** - Only GET, PUT, and DELETE requests are accepted.
*   **500 Internal Server Error** - An error occurred.

**Example Usage:**

```bash
# Get campaign details
curl http://localhost:3000/api/admin/whatsapp/campaigns/1

# Update a campaign
curl -X PUT http://localhost:3000/api/admin/whatsapp/campaigns/1 \
-H "Content-Type: application/json" \
-d '{
  "name": "New and Improved Promo"
}'

# Delete a campaign
curl -X DELETE http://localhost:3000/api/admin/whatsapp/campaigns/1
```

---

## Send a Specific WhatsApp Campaign

**Endpoint:** `/api/admin/whatsapp/campaigns/{id}/send`

**Method:** `POST`

**Description:**
Sends a specific WhatsApp campaign that is in `DRAFT` or `SCHEDULED` status.

**URL Parameters:**

*   `id` (required): The ID of the WhatsApp campaign to send.

**Responses:**

*   **200 OK** - The campaign was sent successfully.
*   **400 Bad Request** - The campaign has already been sent.
*   **404 Not Found** - The campaign with the specified ID was not found.
*   **405 Method Not Allowed** - Only POST requests are accepted.
*   **500 Internal Server Error** - An error occurred while sending the campaign, often due to missing API configuration.

**Example Usage:**

```bash
curl -X POST http://localhost:3000/api/admin/whatsapp/campaigns/1/send
```

---

## Shopping Cart

**Endpoint:** `/api/cart`

**Methods:** `GET`, `POST`, `DELETE`

**Description:**
*   **GET:** Retrieves the items in the authenticated user's shopping cart.
*   **POST:** Adds a product to the cart. If the product is already in the cart, it updates the quantity.
*   **DELETE:** Clears all items from the user's cart.

**Authentication:**

*   Requires a `Bearer` token in the `Authorization` header.

**POST Request Body:**

```json
{
  "productId": "clx2b43tq000108l9g4f3h2j1",
  "quantity": 1
}
```

**Responses:**

*   **200 OK (GET)** - A list of cart items.
*   **201 Created (POST)** - The newly created or updated cart item.
*   **200 OK (DELETE)** - A confirmation message.
*   **400 Bad Request** - Missing product ID, insufficient stock, or invalid quantity.
*   **401 Unauthorized** - Invalid or missing authentication token.
*   **404 Not Found** - Product not found.
*   **500 Internal Server Error** - An error occurred.

**Example Usage:**

```bash
# Get cart items
curl http://localhost:3000/api/cart -H "Authorization: Bearer <your_token>"

# Add an item to the cart
curl -X POST http://localhost:3000/api/cart \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <your_token>" \
-d '{
  "productId": "clx2b43tq000108l9g4f3h2j1",
  "quantity": 2
}'

# Clear the cart
curl -X DELETE http://localhost:3000/api/cart -H "Authorization: Bearer <your_token>"
```

---

## Update or Remove a Cart Item

**Endpoint:** `/api/cart/{id}`

**Methods:** `PUT`, `DELETE`

**Description:**
*   **PUT:** Updates the quantity of a specific item in the cart.
*   **DELETE:** Removes a specific item from the cart.

**Authentication:**

*   Requires a `Bearer` token in the `Authorization` header.

**URL Parameters:**

*   `id` (required): The ID of the cart item.

**PUT Request Body:**

```json
{
  "quantity": 3
}
```

**Responses:**

*   **200 OK (PUT)** - The updated cart item.
*   **200 OK (DELETE)** - A confirmation message.
*   **400 Bad Request** - Invalid quantity or insufficient stock.
*   **401 Unauthorized** - Invalid or missing authentication token.
*   **404 Not Found** - Cart item not found.
*   **500 Internal Server Error** - An error occurred.

**Example Usage:**

```bash
# Update cart item quantity
curl -X PUT http://localhost:3000/api/cart/clx2b43tq000108l9g4f3h2j1 \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <your_token>" \
-d '{
  "quantity": 5
}'

# Remove an item from the cart
curl -X DELETE http://localhost:3000/api/cart/clx2b43tq000108l9g4f3h2j1 -H "Authorization: Bearer <your_token>"
```

---

## Categories

**Endpoint:** `/api/categories`

**Methods:** `GET`, `POST`

**Description:**
*   **GET:** Retrieves a paginated list of all categories, with support for searching.
*   **POST:** Creates a new category, including an optional image upload.

**GET Query Parameters:**

*   `page` (optional): The page number for pagination (default: 1).
*   `limit` (optional): The number of categories per page (default: 10).
*   `search` (optional): Search for categories by name or description.

**POST Form Data:**

*   `name` (required): The name of the category.
*   `description` (optional): A description for the category.
*   `image` (optional): An image file for the category (multipart/form-data).

**Responses (GET):**

*   **200 OK** - A list of categories with pagination details.

**Responses (POST):**

*   **201 Created** - The newly created category.
*   **400 Bad Request** - Missing name or invalid file type.
*   **500 Internal Server Error** - An error occurred.

**Example Usage:**

```bash
# Get all categories
curl http://localhost:3000/api/categories

# Create a new category with an image
curl -X POST http://localhost:3000/api/categories \
-F "name=Electronics" \
-F "description=Gadgets and devices" \
-F "image=@/path/to/your/image.jpg"
```

---

## Get, Update, and Delete a Specific Category

**Endpoint:** `/api/categories/{id}`

**Methods:** `GET`, `PUT`, `DELETE`

**Description:**
*   **GET:** Retrieves the details of a specific category, including its products.
*   **PUT:** Updates a category's details, including its name, description, and image.
*   **DELETE:** Deletes a category if it has no associated products.

**URL Parameters:**

*   `id` (required): The ID of the category.

**PUT Form Data:**

*   `name` (optional): The new name of the category.
*   `description` (optional): The new description for the category.
*   `image` (optional): A new image file for the category (multipart/form-data).

**Responses:**

*   **200 OK** - The category details, the updated category, or a success message for deletion.
*   **400 Bad Request** - Invalid category ID or trying to delete a category with products.
*   **404 Not Found** - The category with the specified ID was not found.
*   **500 Internal Server Error** - An error occurred.

**Example Usage:**

```bash
# Get category details
curl http://localhost:3000/api/categories/1

# Update a category's name and image
curl -X PUT http://localhost:3000/api/categories/1 \
-F "name=Updated Electronics" \
-F "image=@/path/to/new/image.png"

# Delete a category
curl -X DELETE http://localhost:3000/api/categories/1
```

---

## Dashboard Statistics

**Endpoint:** `/api/dashboard/stats`

**Method:** `GET`

**Description:**
Retrieves key statistics for the admin dashboard, including total counts for products, orders, and users, as well as total revenue, recent orders, and top-selling products.

**Responses:**

*   **200 OK** - An object containing dashboard statistics.
    ```json
    {
      "totalProducts": 50,
      "totalOrders": 120,
      "totalUsers": 35,
      "totalRevenue": 75000,
      "recentOrders": [
        { "id": "...", "customer": "John Doe", "total": 150, "status": "COMPLETED", "createdAt": "..." }
      ],
      "topProducts": [
        { "id": "...", "name": "Product A", "sales": 100, "revenue": 10000 }
      ]
    }
    ```
*   **405 Method Not Allowed** - Only GET requests are accepted.
*   **500 Internal Server Error** - An error occurred while fetching the statistics.

**Example Usage:**

```bash
curl http://localhost:3000/api/dashboard/stats
```

---

## Get and Create Orders

**Endpoint:** `/api/orders`

**Methods:** `GET`, `POST`

**Description:**
*   **GET:** Retrieves a paginated list of orders for the authenticated user.
*   **POST:** Creates a new order. It can be a direct order (for guests) or an order from the user's cart.

**Authentication (GET):**

*   Requires a `Bearer` token in the `Authorization` header.

**POST Request Body (Cart Order):**

```json
{
  "shippingAddress": "123 Main St, Anytown, USA",
  "paymentMethod": "Cash on Delivery"
}
```

**POST Request Body (Direct Order):**

```json
{
  "isDirectOrder": true,
  "shippingAddress": "456 Oak Ave, Anytown, USA",
  "paymentMethod": "Credit Card",
  "customerInfo": {
    "name": "Jane Doe",
    "phone": "555-123-4567",
    "email": "jane.doe@example.com"
  },
  "items": [
    { "productId": "clx2b43tq000108l9g4f3h2j1", "quantity": 1, "price": 1500 }
  ]
}
```

**Responses:**

*   **200 OK (GET)** - A list of the user's orders.
*   **201 Created (POST)** - The newly created order.
*   **400 Bad Request** - Missing required fields, empty cart, or insufficient stock.
*   **401 Unauthorized** - Invalid or missing authentication token (for GET and cart-based POST).
*   **500 Internal Server Error** - An error occurred.

**Example Usage:**

```bash
# Get user's orders
curl http://localhost:3000/api/orders -H "Authorization: Bearer <your_token>"

# Create an order from the cart
curl -X POST http://localhost:3000/api/orders \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <your_token>" \
-d '{
  "shippingAddress": "123 Main St",
  "paymentMethod": "Cash on Delivery"
}'
```

---

## Get a Specific Order

**Endpoint:** `/api/orders/{id}`

**Method:** `GET`

**Description:**
Retrieves the details of a specific order by its ID.

**URL Parameters:**

*   `id` (required): The ID of the order.

**Responses:**

*   **200 OK** - The order details.
*   **400 Bad Request** - Invalid order ID.
*   **404 Not Found** - The order with the specified ID was not found.
*   **500 Internal Server Error** - An error occurred.

**Example Usage:**

```bash
curl http://localhost:3000/api/orders/1
```

---

## SSLCommerz Payment Cancellation

**Endpoint:** `/api/payment/sslcommerz/cancel`

**Method:** `POST`

**Description:**
This is a callback endpoint for SSLCommerz. It handles the cancellation of a payment, updates the order status to `CANCELLED`, and redirects the user to a cancellation page.

**Request Body (from SSLCommerz):**

*   `tran_id`: The transaction ID.
*   `value_a`: The order ID.

**Responses:**

*   **302 Found** - Redirects to the payment cancellation page.

**Example Usage:**

This endpoint is intended to be called by the SSLCommerz gateway, not directly by a user.
```

---

## SSLCommerz Payment Failure

**Endpoint:** `/api/payment/sslcommerz/fail`

**Method:** `POST`

**Description:**
This is a callback endpoint for SSLCommerz. It handles a failed payment, updates the order status to `CANCELLED` and payment status to `FAILED`, and redirects the user to a failure page.

**Request Body (from SSLCommerz):**

*   `tran_id`: The transaction ID.
*   `value_a`: The order ID.

**Responses:**

*   **302 Found** - Redirects to the payment failure page.

**Example Usage:**

This endpoint is intended to be called by the SSLCommerz gateway, not directly by a user.
```

---

## SSLCommerz Payment Initialization

**Endpoint:** `/api/payment/sslcommerz/init`

**Method:** `POST`

**Description:**
Initializes a new payment session with SSLCommerz. It takes order details and returns a payment URL to redirect the user to.

**Request Body:**

```json
{
  "orderId": "clx2b43tq000108l9g4f3h2j1",
  "amount": 1500,
  "customerInfo": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "01700000000"
  },
  "shippingAddress": {
    "fullName": "John Doe",
    "address": "123 Main St",
    "city": "Dhaka",
    "state": "Dhaka",
    "zipCode": "1207",
    "country": "Bangladesh",
    "phone": "01700000000"
  }
}
```

**Responses:**

*   **200 OK** - The payment session was created successfully.
    ```json
    {
      "success": true,
      "paymentUrl": "https://sandbox.sslcommerz.com/gwprocess/v4/...",
      "transactionId": "TXN_..."
    }
    ```
*   **400 Bad Request** - Missing required fields or failed to initialize payment.
*   **404 Not Found** - The specified order was not found.
*   **500 Internal Server Error** - An error occurred, often due to missing SSLCommerz credentials.

**Example Usage:**

```bash
curl -X POST http://localhost:3000/api/payment/sslcommerz/init \
-H "Content-Type: application/json" \
-d '{
  "orderId": "your_order_id",
  "amount": 100,
  "customerInfo": { "name": "Test User", "email": "test@example.com", "phone": "0123456789" },
  "shippingAddress": { "address": "123 Test St", "city": "Testville" }
}'
```

---

## SSLCommerz IPN (Instant Payment Notification)

**Endpoint:** `/api/payment/sslcommerz/ipn`

**Method:** `POST`

**Description:**
This is a callback endpoint for SSLCommerz to send Instant Payment Notifications. It validates the transaction and updates the order status accordingly.

**Request Body (from SSLCommerz):**

*   `tran_id`: The transaction ID.
*   `val_id`: The validation ID.
*   `value_a`: The order ID.
*   `status`: The status of the transaction (e.g., `VALID`, `FAILED`).

**Responses:**

*   **200 OK** - IPN processed successfully.
*   **400 Bad Request** - Missing transaction data or invalid transaction.
*   **500 Internal Server Error** - An error occurred.

**Example Usage:**

This endpoint is intended to be called by the SSLCommerz gateway, not directly by a user.
```

---

## SSLCommerz Payment Success

**Endpoint:** `/api/payment/sslcommerz/success`

**Method:** `POST`

**Description:**
This is a callback endpoint for SSLCommerz. It handles a successful payment, validates the transaction, updates the order status to `CONFIRMED` and payment status to `PAID`, and redirects the user to a thank you page.

**Request Body (from SSLCommerz):**

*   `tran_id`: The transaction ID.
*   `val_id`: The validation ID.
*   `value_a`: The order ID.
*   `value_b`: The customer's name.

**Responses:**

*   **302 Found** - Redirects to the thank you page on success, or the failure page on validation failure.

**Example Usage:**

This endpoint is intended to be called by the SSLCommerz gateway, not directly by a user.
```

---

## Validate SSLCommerz Payment

**Endpoint:** `/api/payment/sslcommerz/validate`

**Method:** `POST`

**Description:**
Validates an SSLCommerz transaction using the validation ID. This can be used by the client-side to confirm the payment status after the user returns from the payment gateway.

**Request Body:**

```json
{
  "transactionId": "TXN_...",
  "validationId": "..."
}
```

**Responses:**

*   **200 OK** - The validation result.
    ```json
    {
      "isValid": true,
      "transactionStatus": "VALID",
      "order": {
        "id": "...",
        "status": "CONFIRMED",
        "paymentStatus": "PAID",
        "total": 1500
      }
    }
    ```
*   **400 Bad Request** - Missing transaction or validation ID.
*   **404 Not Found** - The order associated with the transaction was not found.
*   **500 Internal Server Error** - An error occurred.

**Example Usage:**

```bash
curl -X POST http://localhost:3000/api/payment/sslcommerz/validate \
-H "Content-Type: application/json" \
-d '{
  "transactionId": "TXN_...",
  "validationId": "..."
}'
```

---

## Get and Create Products

**Endpoint:** `/api/products`

**Methods:** `GET`, `POST`

**Description:**
*   **GET:** Retrieves a paginated list of products with filtering, searching, and sorting.
*   **POST:** Creates a new product.

**GET Query Parameters:**

*   `page` (optional): Page number (default: 1).
*   `limit` (optional): Items per page (default: 10).
*   `search` (optional): Search term for product name or description.
*   `categoryId` (optional): Filter by category ID.
*   `sortBy` (optional): Sort order (`price-low`, `price-high`, `name`, `featured`, `newest`, `rating`).

**POST Request Body:**

```json
{
  "name": "New Product",
  "description": "A great new product.",
  "price": 99.99,
  "categoryId": "clx2b43tq000108l9g4f3h2j1",
  "stock": 100,
  "featured": false,
  "tempImages": [
    { "url": "/uploads/temp/image1.jpg", "isMain": true }
  ]
}
```

**Responses:**

*   **200 OK (GET)** - A list of products with pagination.
*   **201 Created (POST)** - The newly created product.
*   **400 Bad Request** - Missing required fields.
*   **500 Internal Server Error** - An error occurred.

**Example Usage:**

```bash
# Get products sorted by price
curl http://localhost:3000/api/products?sortBy=price-high

# Create a new product
curl -X POST http://localhost:3000/api/products \
-H "Content-Type: application/json" \
-d '{
  "name": "Wireless Headphones",
  "price": 199.99,
  "categoryId": "clx2b43tq000108l9g4f3h2j1"
}'
```

---

## Get, Update, and Delete a Specific Product

**Endpoint:** `/api/products/{id}`

**Methods:** `GET`, `PUT`, `DELETE`

**Description:**
*   **GET:** Retrieves the details of a specific product, including its category, reviews, and images.
*   **PUT:** Updates a product's details.
*   **DELETE:** Deletes a product.

**URL Parameters:**

*   `id` (required): The ID of the product.

**PUT Request Body:**

```json
{
  "name": "Updated Product Name",
  "price": 129.99,
  "stock": 50,
  "featured": true,
  "tempImages": [
    { "url": "/uploads/temp/new-image.jpg", "isMain": false }
  ]
}
```

**Responses:**

*   **200 OK** - The product details, the updated product, or a success message for deletion.
*   **400 Bad Request** - Invalid product ID.
*   **404 Not Found** - The product with the specified ID was not found.
*   **500 Internal Server Error** - An error occurred.

**Example Usage:**

```bash
# Get product details
curl http://localhost:3000/api/products/1

# Update a product's price and stock
curl -X PUT http://localhost:3000/api/products/1 \
-H "Content-Type: application/json" \
-d '{
  "price": 149.99,
  "stock": 75
}'

# Delete a product
curl -X DELETE http://localhost:3000/api/products/1
```

---

## Get Products with Static Token

**Endpoint:** `/api/static/products`

**Method:** `GET`

**Description:**
Retrieves a list of products using a static bearer token for authentication. This endpoint is useful for services that need to access product data without user authentication.

**Authentication:**

*   Requires a `Bearer` token in the `Authorization` header. The token is set in the `STATIC_TOKEN` environment variable.

**Query Parameters:**

*   Same as `/api/products` GET endpoint.

**Responses:**

*   **200 OK** - A list of products.
*   **401 Unauthorized** - If the token is missing or incorrect.
*   **500 Internal Server Error** - An error occurred.

**Example Usage:**

```bash
curl http://localhost:3000/api/static/products \
-H "Authorization: Bearer your_static_token_here"
```

---

## Product Images

**Endpoint:** `/api/products/images`

**Methods:** `GET`, `PUT`, `DELETE`

**Description:**
*   **GET:** Retrieves all images for a specific product.
*   **PUT:** Sets a specific image as the main image for a product.
*   **DELETE:** Deletes a specific product image.

**Query Parameters (GET & DELETE):**

*   `productId` (required): The ID of the product.
*   `imageId` (required for DELETE): The ID of the image to delete.

**PUT Request Body:**

```json
{
  "imageId": "clx2b43tq000108l9g4f3h2j1"
}
```

**Responses:**

*   **200 OK** - A list of images, or a success message.
*   **400 Bad Request** - Missing required IDs.
*   **404 Not Found** - Image not found.
*   **500 Internal Server Error** - An error occurred.

**Example Usage:**

```bash
# Get all images for a product
curl http://localhost:3000/api/products/images?productId=1

# Set an image as the main image
curl -X PUT http://localhost:3000/api/products/images?productId=1 \
-H "Content-Type: application/json" \
-d '{
  "imageId": "clx2b43tq000108l9g4f3h2j1"
}'

# Delete an image
curl -X DELETE http://localhost:3000/api/products/images?productId=1&imageId=clx2b43tq000108l9g4f3h2j1
```

---

## Get Trending Products

**Endpoint:** `/api/products/trending`

**Method:** `GET`

**Description:**
Retrieves a list of trending products based on a scoring system that considers recent orders, total orders, and average ratings.

**Query Parameters:**

*   `limit` (optional): The number of trending products to return (default: 6, max: 20).

**Responses:**

*   **200 OK** - A list of trending products.
*   **405 Method Not Allowed** - Only GET requests are accepted.
*   **500 Internal Server Error** - An error occurred while fetching the products.

**Example Usage:**

```bash
# Get the top 8 trending products
curl http://localhost:3000/api/products/trending?limit=8
```

---

## Upload Product Images

**Endpoint:** `/api/products/upload-images`

**Method:** `POST`

**Description:**
Uploads one or more images for a product. If the product is new (`isNew=true`), it returns temporary image data. If it's for an existing product, it saves the images to the database.

**Form Data:**

*   `files` (required): The image file(s) to upload.
*   `productId` (optional): The ID of the existing product.
*   `isMain` (optional): Whether the first uploaded image should be the main image.
*   `isNew` (optional): Set to `true` if the product is new and not yet saved.

**Responses:**

*   **200 OK** - An array of uploaded image data.
*   **400 Bad Request** - No files were uploaded.
*   **500 Internal Server Error** - An error occurred during the upload.

**Example Usage:**

```bash
# Upload an image for an existing product
curl -X POST http://localhost:3000/api/products/upload-images \
-F "files=@/path/to/your/image.jpg" \
-F "productId=1"

# Upload an image for a new product
curl -X POST http://localhost:3000/api/products/upload-images \
-F "files=@/path/to/your/image.jpg" \
-F "isNew=true"
```

---

## Get and Create Users

**Endpoint:** `/api/users`

**Methods:** `GET`, `POST`

**Description:**
*   **GET:** Retrieves a paginated list of users with filtering and searching.
*   **POST:** Creates a new user.

**GET Query Parameters:**

*   `page` (optional): Page number (default: 1).
*   `limit` (optional): Items per page (default: 10).
*   `search` (optional): Search term for user's name or email.
*   `role` (optional): Filter by user role (`USER` or `ADMIN`).

**POST Request Body:**

```json
{
  "email": "test@example.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User",
  "role": "USER"
}
```

**Responses:**

*   **200 OK (GET)** - A list of users with pagination.
*   **201 Created (POST)** - The newly created user.
*   **400 Bad Request** - Missing required fields or user already exists.
*   **500 Internal Server Error** - An error occurred.

**Example Usage:**

```bash
# Get all admin users
curl http://localhost:3000/api/users?role=ADMIN

# Create a new user
curl -X POST http://localhost:3000/api/users \
-H "Content-Type: application/json" \
-d '{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "New",
  "lastName": "User"
}'
```

---

## Get, Update, and Delete a Specific User

**Endpoint:** `/api/users/{id}`

**Methods:** `GET`, `PUT`, `DELETE`

**Description:**
*   **GET:** Retrieves the details of a specific user, including their orders and stats.
*   **PUT:** Updates a user's details.
*   **DELETE:** Deletes a user if they have no associated orders.

**URL Parameters:**

*   `id` (required): The ID of the user.

**PUT Request Body:**

```json
{
  "firstName": "Updated",
  "lastName": "User",
  "role": "ADMIN"
}
```

**Responses:**

*   **200 OK** - The user details, the updated user, or a success message for deletion.
*   **400 Bad Request** - Invalid user ID or trying to delete a user with orders.
*   **404 Not Found** - The user with the specified ID was not found.
*   **500 Internal Server Error** - An error occurred.

**Example Usage:**

```bash
# Get user details
curl http://localhost:3000/api/users/1

# Update a user's role
curl -X PUT http://localhost:3000/api/users/1 \
-H "Content-Type: application/json" \
-d '{
  "role": "ADMIN"
}'

# Delete a user
curl -X DELETE http://localhost:3000/api/users/1
```

---

## User Addresses

**Endpoint:** `/api/users/addresses`

**Methods:** `GET`, `POST`, `PUT`, `DELETE`

**Description:**
Manages the shipping addresses for the authenticated user.

**Authentication:**

*   Requires a `Bearer` token in the `Authorization` header.

**GET Response:**

*   **200 OK** - A list of the user's addresses.

**POST Request Body:**

```json
{
  "street": "123 New Address",
  "city": "Newville",
  "state": "New State",
  "zipCode": "12345",
  "country": "USA",
  "isDefault": true
}
```

**PUT Request Body:**

```json
{
  "addressId": "clx2b43tq000108l9g4f3h2j1",
  "street": "123 Updated Address",
  "isDefault": false
}
```

**DELETE Request Body:**

```json
{
  "addressId": "clx2b43tq000108l9g4f3h2j1"
}
```

**Responses:**

*   **200 OK** - A list of addresses (GET), or a success message (PUT, DELETE).
*   **201 Created (POST)** - The newly created address.
*   **400 Bad Request** - Missing required fields.
*   **401 Unauthorized** - Invalid or missing authentication token.
*   **404 Not Found** - Address not found.
*   **500 Internal Server Error** - An error occurred.

**Example Usage:**

```bash
# Get all addresses for a user
curl http://localhost:3000/api/users/addresses -H "Authorization: Bearer <your_token>"

# Add a new address
curl -X POST http://localhost:3000/api/users/addresses \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <your_token>" \
-d '{
  "street": "456 Main St",
  "city": "Anytown",
  "state": "CA",
  "zipCode": "12345",
  "country": "USA"
}'
```

---

## User Profile

**Endpoint:** `/api/users/profile`

**Methods:** `GET`, `PUT`, `DELETE`

**Description:**
Manages the profile of the authenticated user.

**Authentication:**

*   Requires a `Bearer` token in the `Authorization` header.

**GET Response:**

*   **200 OK** - The user's profile information.

**PUT Request Body (multipart/form-data):**

*   `firstName` (optional): The user's first name.
*   `lastName` (optional): The user's last name.
*   `email` (optional): The user's email address.
*   `phone` (optional): The user's phone number.
*   `dateOfBirth` (optional): The user's date of birth.
*   `currentPassword` (optional): The user's current password (required for password change).
*   `newPassword` (optional): The user's new password.
*   `avatar` (optional): An image file for the user's avatar.

**DELETE Request Body:**

```json
{
  "password": "current_password"
}
```

**Responses:**

*   **200 OK** - The user's profile (GET), or a success message (PUT, DELETE).
*   **400 Bad Request** - Invalid input, incorrect password, or email already exists.
*   **401 Unauthorized** - Invalid or missing authentication token.
*   **404 Not Found** - User not found.
*   **500 Internal Server Error** - An error occurred.

**Example Usage:**

```bash
# Get user profile
curl http://localhost:3000/api/users/profile -H "Authorization: Bearer <your_token>"

# Update user profile
curl -X PUT http://localhost:3000/api/users/profile \
-H "Authorization: Bearer <your_token>" \
-F "firstName=John" \
-F "avatar=@/path/to/avatar.jpg"
```

---

## WhatsApp Webhook

**Endpoint:** `/api/webhooks/whatsapp`

**Methods:** `GET`, `POST`

**Description:**
This endpoint is the callback URL for the WhatsApp Business API.
*   **GET:** Handles webhook verification requests from Meta.
*   **POST:** Receives webhook notifications for events like incoming messages and message status updates.

**GET Query Parameters:**

*   `hub.mode`: Should be `subscribe`.
*   `hub.verify_token`: The verification token set in the Facebook Developers Console.
*   `hub.challenge`: A random string to be echoed back.

**POST Request Body (from Meta):**

*   A JSON object containing webhook event data.

**Responses:**

*   **200 OK (GET)** - The `hub.challenge` value.
*   **200 OK (POST)** - Acknowledges receipt of the webhook event.
*   **403 Forbidden (GET)** - If the verification token is incorrect.

**Example Usage:**

This endpoint is intended to be called by the Meta/WhatsApp platform, not directly by a user.
```

---

## WhatsApp Bulk Message Debugger

**Endpoint:** `/api/whatsapp/bulk-debug`

**Method:** `POST`

**Description:**
Sends a message to a list of recipients one by one to debug bulk sending issues.

**Request Body:**

```json
{
  "recipients": "+15551234567,+15557654321",
  "message": "This is a debug message."
}
```

**Responses:**

*   **200 OK** - A summary of the results, including successful and failed sends.
*   **400 Bad Request** - Missing recipients or message.
*   **500 Internal Server Error** - An error occurred.

**Example Usage:**

```bash
curl -X POST http://localhost:3000/api/whatsapp/bulk-debug \
-H "Content-Type: application/json" \
-d '{
  "recipients": "+15550001111, +15552223333",
  "message": "Bulk debug test"
}'
```

---

## WhatsApp Debug Test

**Endpoint:** `/api/whatsapp/debug-test`

**Method:** `POST`

**Description:**
Sends a single test message to a specified phone number to debug the WhatsApp API connection.

**Request Body:**

```json
{
  "phoneNumber": "+15551234567"
}
```

**Responses:**

*   **200 OK** - The message was sent successfully.
*   **400 Bad Request** - Missing phone number or failed to send the message.
*   **500 Internal Server Error** - An error occurred, often due to missing API configuration.

**Example Usage:**

```bash
curl -X POST http://localhost:3000/api/whatsapp/debug-test \
-H "Content-Type: application/json" \
-d '{
  "phoneNumber": "+15557654321"
}'
```

---

## WhatsApp Webhook Info

**Endpoint:** `/api/whatsapp/webhook-info`

**Method:** `GET`

**Description:**
Provides information about the WhatsApp webhook configuration, including the webhook URL, verify token status, and setup instructions.

**Responses:**

*   **200 OK** - An object containing webhook configuration details.
*   **500 Internal Server Error** - An error occurred.

**Example Usage:**

```bash
curl http://localhost:3000/api/whatsapp/webhook-info

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.

<environment_details>
# VSCode Visible Files
../../../../../../response_db0196fe-cec9-4da5-aeda-b831a8937f43/0
../../../../../../response_db0196fe-cec9-4da5-aeda-b831a8937f43/1
API_documentation.md

# VSCode Open Tabs
pages/index.tsx
pages/_app.tsx
contexts/AuthContext.tsx
.env
server.js
API_documentation.md

# Current Time
7/18/2025, 7:32:15 AM (Asia/Dhaka, UTC+6:00)

# Context Window Usage
769,655 / 1,048.576K tokens used (73%)

# Current Mode
ACT MODE
</environment_details>
