# 1. Get the code
git clone https://github.com/KrishnaSingh1881/Hack.git
cd Hack

# 2. Install dependencies
pnpm install

# 3. Deploy to Convex (will open browser)
npx convex dev

# 4. Add sample data
npx convex run generators/createDummyData:createAll

# 5. Start the app
pnpm dev

# 6. Deploy to Convex
npx convex deploy
pnpm dev