const { execSync } = require('child_process')
console.log('Running bundle analysis...')
try {
  const result = execSync('npx tsx src/tools/bundle-analyzer.ts', { encoding: 'utf-8', cwd: process.cwd() })
  console.log(result)
} catch (e) {
  console.error('Analysis failed:', e.message)
}
