# If you already have the folder, run this
git pull

# If you don't have the folder yet, run this
git clone https://github.com/KrishnaSingh1881/Hack.git
cd Hack

pnpm install

npx convex run generators/createDummyData:createAll

pnpm dev