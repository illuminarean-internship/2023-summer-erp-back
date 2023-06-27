# 2023-summer-erp-back
2023 summer internship program project.

# Install dependencies
```
npm install
```

# Start a dev server
```
npm start
``` 
# Set environment variables
Add .env file inside project. Write down the below content

.env 

```
NODE_ENV=development
PORT=4040
JWT_SECRET=1234
MONGO_HOST={Your mongo host or cloud url}
TEST_MONGO_HOST=mongodb://localhost/test
MONGO_PORT=27017
MONGOOSE_DEBUG=true
```

cloud url: FYI: https://illuminarean.atlassian.net/wiki/spaces/ITP2023/pages/772178208/Internship+Project+Requirements+From+Dev+team?atlOrigin=eyJpIjoiN2NmMjRlMTNkMTcyNGVmYjgyNDU5YTkzYWM1MzRhYTkiLCJwIjoiYyJ9


local url: mongodb://localhost/test

# Test 
```
npm test
``` 
