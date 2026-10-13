# James Medical Patient tracker

Production: https://nextjs-dashboard-nine-theta-d8vctthkcs.vercel.app/

## What it is
This program is used for medical staff to keep track of appointments. This can also help keep patient information organized and help keep track of their status of if they are coming or not. useful when the user has many clinics to manage with different patients and schedule and the owner can see them all but the front desk gets to only see what is needed for them and their own patient and not another clinics patients.

## DEMO LOGINS (for reviewers)
Email: owner@nextmail.com
Password: 123456

Email:frontdesk@nextmail.com
Password:frontdesk123

Email:frontdesk2@nextmail.com
Password:frontdesk456

## How to run locally
1. Clone the repository and run pnpm install.
2. Create .env.local with these variable NAMES (values from your own Supabase project):
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
3. Run the SQL in the supabase/ folder in the SQL Editor.
4. Run pnpm dev and open http://localhost:3000.

## Smoke test (date, run on production as two users)
- [ ] 1. Signed out, /dashboard redirects to login
- [ ] 2. User one signs in and lands on /dashboard
- [ ] 3. Entity one: create, edit, delete; list updates
- [ ] 4. Entity two: create (select shows only my rows), edit, delete
- [ ] 5. Both charts render from real rows, question as title
- [ ] 6. User two (private window) sees none of user one's rows
- [ ] 7. User two opening user one's edit URL gets not-found
- [ ] 8. Empty create form shows messages, saves nothing
- [ ] 9. Unknown URL shows the not-found page
- [ ] 10. Sign out works; .env.local is not on GitHub
- [ ] R. (only if shipped) Realtime: an insert in window A updates window B within a second
- [ ] S. (only if shipped) Storage: upload and signed link work; user two cannot open user one's file; the bucket is private

## Freeze plan
- A Today section: shows the appointments on the current day, only can see which it is today on the appointment section

## Known gaps
- Two Appointments can be blocked at the same time on the same day
