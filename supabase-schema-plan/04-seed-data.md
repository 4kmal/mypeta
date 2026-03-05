# Seed Data

## States (Required)

The `states` table must be populated with all 16 Malaysian states/territories before the app can function. These are referenced by `users.selected_state` and `votes.user_state`.

| id | name | display_order |
|----|------|---------------|
| `perlis` | Perlis | 1 |
| `kedah` | Kedah | 2 |
| `penang` | Pulau Pinang | 3 |
| `perak` | Perak | 4 |
| `kelantan` | Kelantan | 5 |
| `terengganu` | Terengganu | 6 |
| `pahang` | Pahang | 7 |
| `selangor` | Selangor | 8 |
| `kualalumpur` | Kuala Lumpur | 9 |
| `putrajaya` | Putrajaya | 10 |
| `negerisembilan` | Negeri Sembilan | 11 |
| `malacca` | Melaka | 12 |
| `johor` | Johor | 13 |
| `sabah` | Sabah | 14 |
| `sarawak` | Sarawak | 15 |
| `labuan` | Labuan | 16 |

**Source:** `data/states.tsx` in the codebase

---

## Sample System Polls (Optional)

The codebase has 20 hardcoded polls in `data/polls.ts`. These are the original polls that should be seeded into the database. Below are the first 3 as examples — the full list can be found in the SQL seed script.

### Poll 1: Nasi Lemak

- **legacy_id:** `nasi-lemak-best`
- **question:** "Is Nasi Lemak the best breakfast in the world?"
- **description:** "The eternal debate about Malaysia's national dish"
- **category:** `food`
- **Options:**
  - 0: 🇲🇾 "Yes, absolutely!"
  - 1: 🌍 "No, there are better options"

### Poll 2: Toll Abolishment

- **legacy_id:** `toll-abolishment`
- **question:** "Should all highway tolls in Malaysia be abolished?"
- **description:** "A hot topic affecting daily commuters"
- **category:** `economy`
- **Options:**
  - 0: 🚫 "Yes, abolish all tolls"
  - 1: 💰 "No, keep tolls for maintenance"

### Poll 3: Roti Canai vs Prata

- **legacy_id:** `roti-canai-vs-prata`
- **question:** "Roti Canai or Roti Prata - which name is correct?"
- **description:** "The naming controversy that divides a nation"
- **category:** `food`
- **Options:**
  - 0: 🇲🇾 "Roti Canai"
  - 1: 🇸🇬 "Roti Prata"

---

## Full Seed Script

See `supabase-schema-sql/04-seed-data.sql` for the complete SQL seed script with all 20 polls from `data/polls.ts`.
