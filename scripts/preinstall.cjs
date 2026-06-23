const fs = require('fs');
const path = require('path');

// 1. Remove package-lock.json and yarn.lock if they exist
const filesToRemove = ['package-lock.json', 'yarn.lock'];
filesToRemove.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      // Ignore errors if file cannot be deleted
    }
  }
});

// 2. Verify pnpm is being used
const userAgent = process.env.npm_config_user_agent || '';
if (!userAgent.startsWith('pnpm/')) {
  console.error('\x1b[31mError: Use pnpm instead of npm or yarn.\x1b[0m');
  process.exit(1);
}
