# 1. Get the latest code
git pull

# 2. Install dependencies
pnpm install

# 3. Deploy to Convex (will open browser)
npx convex dev

# 4. Add sample data
npx convex run generators/createDummyData:createAll

# 5. Start the app
pnpm dev

openssl genpkey -algorithm RSA -out private-key.pem -pkcs8 -pass pass:mypassword
cat private-key.pem