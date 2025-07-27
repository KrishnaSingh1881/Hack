# 1. Pull the latest fix
git pull origin main

# 2. Deploy to Convex
npx convex dev

# 3. Add sample data
npx convex run generators/createDummyData:createAll

# 4. Start the app
pnpm dev

openssl genpkey -algorithm RSA -out private-key.pem -pkcs8 -pass pass:mypassword
cat private-key.pem