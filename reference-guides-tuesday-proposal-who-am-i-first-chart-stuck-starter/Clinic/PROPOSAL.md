# Family Clinic Dashboard

**Deployed base**: https://nextjs-dashboard-nine-theta-d8vctthkcs.vercel.app
**Repo**: https://github.com/<you>/<repo>
**Student**: <your name>

## 1. Domain
A small family practice with one owner and two front-desk staff.
The owner uses the dashboard every Monday to decide whether the
practice needs more consulting days and how to cut missed appointments.

## 2. Entities (exactly three)
| Entity | Replaces | Fields (name: type) |
|---|---|---|
| patients | customers | id: uuid, user_id: uuid, full_name: text, phone: text, date_of_birth: date, created_at: timestamp |
| appointments | invoices | id: uuid, user_id: uuid, patient_id: uuid (fk to patients), starts_at: timestamp, status: enum(booked, done, no_show), created_at: timestamp |
| treatments | revenue | id: uuid, user_id: uuid, appointment_id: uuid (fk to appointments), procedure: text, fee_cents: integer, created_at: timestamp |

## 3. Charts (exactly two)
| # | Question it answers | Who acts on the answer | Chart type | Data it needs |
|---|---|---|---|---|
| 1 | Is the practice growing? How many new patients joined each month? | owner decides whether to open a second consulting day | bar, one bar per month | count of patients by month of created_at, last 6 months |
| 2 | What share of this month's appointments are no-shows? | owner decides whether to send reminder messages | donut | appointments this month joined to patients, counted by status |

## 4. Roles
| Role | Can see | Can change |
|---|---|---|
| owner | everything | everything |
| front desk | patients and appointments | create and edit patients and appointments; no deletes, no treatments |

## 5. Stretch
A "tomorrow" page listing booked appointments with each patient's phone number.

## 6. Out of scope
Online booking by patients, sending messages, medical aid claims,
more than one practice, a mobile app.
