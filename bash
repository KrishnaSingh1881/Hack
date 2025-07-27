# Initialize git repository
git init

# Create .gitignore file
echo "node_modules/
.env
.env.local
.env.production
.env.development
dist/
build/
.convex/
*.log
.DS_Store
Thumbs.db" > .gitignore

# Add all files
git add .

# First commit
git commit -m "Initial commit: TrustTrade marketplace platform

- Role-based dashboards (Vendor/Wholesaler/Investor)
- Mapbox integration for supplier locations
- Group buying system
- Community exchange
- AI-powered multilingual chat (Gemini)
- Loan request/funding system
- Dark mode toggle
- Full authentication system"

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main

# Add the README
git add README.md
git commit -m "Add comprehensive README with setup instructions"
git push