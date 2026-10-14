# James Medical Patient tracker

Production: https://nextjs-dashboard-nine-theta-d8vctthkcs.vercel.app/

## What it is
This program is used for medical staff to keep track of appointments. This can also help keep patient information organized and help keep track of their status of if they are coming or not. useful when the user has many clinics to manage with different patients and schedule and the owner can see them all but the front desk gets to only see what is needed for them and their own patient and not another clinics patients.

## DEMO LOGINS (for reviewers only)
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
- [x] 1. Signed out, /dashboard redirects to login
- [x] 2. User one signs in and lands on /dashboard
- [x] 3. Entity one: create, edit, delete; list updates
- [x] 4. Entity two: create (select shows only my rows), edit, delete
- [x] 5. Both charts render from real rows, question as title
- [x] 6. User two (private window) sees none of user one's rows
- [x] 7. User two opening user one's edit URL gets not-found
- [x] 8. Empty create form shows messages, saves nothing
- [x] 9. Unknown URL shows the not-found page
- [x] 10. Sign out works; .env.local is not on GitHub

## Freeze plan
 
### Must ship today
1. Fix: patients create, edit and delete work in production behind RLS.
2. Fix: appointments create, edit and delete work in production; the patient select lists only my patients.
3. Verify: both charts render from real rows with the question as title and labelled axes or legend.
4. Verify: user two sees none of user one's rows, and user one's edit URL gives the not-found page.
5. Ship: a "Today" section on the appointments page listing only today's appointments.
### Cut
- Treatments entity: cut because patients and appointments needed to be fully working behind RLS first, and a half-built third entity is worse than none.
- Stretch (Realtime/Storage): cut so that nothing new starts on freeze day.
- Preventing double-booked slots: cut because it needs a database constraint and a clear user message, which was out of scope for this week.
### Monday polish
1. Complete and date the smoke test in this README.
2. Tidy the wording of empty states on both lists.
3. Add a "so what" line under each chart if any is missing.

## Known gaps
- Two Appointments can be blocked at the same time on the same day.
- Treatments entity and the Realtime/Storage stretch were not built.
