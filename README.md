## Key Features Implemented:
### Express Server Setup:

- Basic server configuration with proper middleware

- Environment variables support using dotenv

### RESTful API Routes:

- Complete CRUD operations for products

- Proper status codes and response formats

### Custom Middleware:

- Request logging: Using morgan and custom logging

- Authentication: JWT token verification

### Validation: Product data validation

- Error handling: Comprehensive error handling middleware

### Advanced Features:

- Filtering: By name, price range, category, and stock status

- Pagination: Page and limit parameters

- Search: Across name and description fields

### Security:

- Protected routes (POST, PUT, DELETE)

- Input validation

- Secure token handling

### Error Handling:

- Custom error responses

- 404 handler for unknown routes

- 500 error handler


## To use this API:

- Install required dependencies:

```npm install express body-parser uuid morgan jsonwebtoken dotenv```

- Create a .env file with:


`JWT_SECRET=your-secret-key`
`PORT=3000`


- Get a token by POSTing to /api/login with:


`{`
  `"username": "admin",`
  `"password": "password"`
`}`




## Resources

- [Express.js Documentation](https://expressjs.com/)
- [RESTful API Design Best Practices](https://restfulapi.net/)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) 
