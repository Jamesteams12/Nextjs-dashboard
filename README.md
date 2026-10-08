## Smoke test (8 Oct, run on production as two users)

- [ ] 1. Signed out, visiting /dashboard redirects to the login page
- [ ] 2. User one can sign in and lands on /dashboard
- [ ] 3. Patients: create one, edit it, delete it; the list updates each time
- [ ] 4. Appointments: create one (the patient select shows only my patients), edit it, delete it
- [ ] 5. Chart one and chart two render from real rows, with the question as the title and labelled axes / a legend
- [ ] 6. User two (private window) sees none of user one's patients or appointments, and their charts are empty or show only their own data
- [ ] 7. User two opening user one's edit URL directly (/dashboard/patients/<id>/edit) gets the not-found page
- [ ] 8. Submitting an empty create form shows messages under the fields, nothing is saved
- [ ] 9. An unknown URL (/dashboard/nothing-here) shows the not-found page
- [ ] 10. Sign out returns to login; the browser Back button does not reveal the dashboard; .env.local is not in the repository on GitHub
