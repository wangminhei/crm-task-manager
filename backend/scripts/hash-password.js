const bcrypt = require('bcryptjs')

async function main() {
  const passwords = ['Admin@123', 'Tech@123']
  for (const p of passwords) {
    const hash = await bcrypt.hash(p, 10)
    console.log(`${p} → ${hash}`)
  }
}
main()
