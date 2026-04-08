import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load from .env.local
config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const EMAIL = process.argv[2]
if (!EMAIL) { console.error('Usage: node scripts/make_admin.mjs <email>'); process.exit(1) }

// 1. Find user in public.users
const { data: users, error: fetchErr } = await supabase
  .from('users')
  .select('id, email, role')
  .eq('email', EMAIL)

if (fetchErr) { console.error('Fetch error:', fetchErr.message); process.exit(1) }
if (!users?.length) { console.error(`User ${EMAIL} not found — have they signed in yet?`); process.exit(1) }

const user = users[0]
console.log('Found user:', user.id, user.email, '— current role:', user.role)

// 2. Update role to admin
const { error: updateErr } = await supabase
  .from('users')
  .update({ role: 'admin' })
  .eq('id', user.id)

if (updateErr) { console.error('Role update error:', updateErr.message); process.exit(1) }
console.log('✅ Role updated to admin')

// 3. Upsert into admin_users
const { error: adminErr } = await supabase
  .from('admin_users')
  .upsert({ id: user.id, permissions: ['studios','bookings','payments','users'] })

if (adminErr) { console.error('admin_users upsert error:', adminErr.message); process.exit(1) }
console.log('✅ Added to admin_users table')
console.log(`\n🎉 ${EMAIL} is now an admin!`)
