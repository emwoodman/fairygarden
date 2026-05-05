# Fairy Garden

An open source garden planning app. Map your property, track plants and seeds, identify what's growing, plan your seasons, and get AI-powered gardening advice — all in one place.

**fairygarden.app** · [github.com/emmawoodman/fairygarden](https://github.com/emmawoodman/fairygarden)

## Features

- **Property map** — draw and label your outdoor space and garden beds
- **Plant inventory** — record every plant with notes, photos, and location
- **Seed inventory** — track your seed packets and germination history
- **Plant identification** — upload a photo and Claude identifies the plant
- **Garden planner** — plan what to grow and schedule sowing/planting dates
- **Zone finder** — look up your USDA hardiness zone and frost dates
- **Ask Claude** — AI-powered gardening advice in a conversational interface
- **Community gardens** — browse public gardens shared by other growers

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database & auth | Supabase (Postgres + Auth) |
| AI | Anthropic Claude API |

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/emmawoodman/fairygarden.git
cd fairygarden
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in the values:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |

### 3. Configure Supabase Auth

In your Supabase project:

1. Go to **Authentication → Providers** and enable **Google** (add your OAuth client ID and secret from Google Cloud Console)
2. Go to **Authentication → URL Configuration** and add `http://localhost:3000/auth/callback` to the redirect URLs

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/
  page.tsx              # Landing page (public)
  signin/               # Sign in / sign up
  dashboard/            # Home screen (auth required)
  map/                  # Property map (auth required)
  plants/               # Plant inventory (auth required)
    [id]/               # Plant detail
  identify/             # Plant identification (auth required)
  seeds/                # Seed inventory (auth required)
  plan/                 # Garden planner (auth required)
  zone/                 # Zone finder (auth required)
  ask/                  # Ask Claude (auth required)
  community/            # Browse public gardens (public)
  settings/             # Account settings (auth required)
lib/
  supabase/
    client.ts           # Browser Supabase client
    server.ts           # Server Supabase client
    middleware.ts       # Session refresh helper
middleware.ts           # Route protection
```

## Contributing

Contributions are welcome! Please open an issue before submitting a large PR.

## License

MIT — see [LICENSE](./LICENSE).
