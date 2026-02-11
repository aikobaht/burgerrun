# 🍔 BurgerRun

A mobile-optimized web app for collecting group In-N-Out orders with real-time updates.

## Features

- 🎯 **Create Group Orders** - Organizer creates a shareable link
- 🔗 **Easy Joining** - Share link for participants to join
- 🍔 **Full Menu** - Complete In-N-Out menu with customization
- 🤫 **Secret Menu** - Animal Style, 3x3, 4x4, Flying Dutchman, and more
- ⚡ **Real-time Sync** - See orders update live with Supabase Realtime
- 👥 **Role Management** - Organizer can edit all orders, participants their own
- 📋 **Review View** - Organizer sees all orders grouped by person
- 🖨️ **Print View** - Orders grouped by category for cashier handoff
- 📱 **Mobile-First** - Optimized for phones, works on desktop too

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** TailwindCSS, shadcn/ui components
- **Backend:** Supabase (PostgreSQL + Realtime)
- **State:** Zustand
- **Routing:** React Router

## Local Setup

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works great)

### 1. Clone & Install

```bash
cd burgerrun
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration:
   ```bash
   # Copy contents of supabase-migration.sql and run in Supabase SQL Editor
   ```
3. Get your credentials from Settings > API

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## Deployment

### Deploy to Vercel

1. **Connect to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Deploy!

### Alternative: Deploy to Netlify

1. Push to GitHub (same as above)
2. Go to [netlify.com](https://netlify.com)
3. New site from Git
4. Add environment variables
5. Build command: `npm run build`
6. Publish directory: `dist`

## Usage

### As Organizer

1. Create a new group order
2. Share the generated link with your group
3. Add your own items (optional)
4. Click "Review Orders" to see everyone's orders
5. Click "Print View" to get a cashier-friendly format
6. Print or screenshot for ordering

### As Participant

1. Click the shared link
2. Enter your name
3. Browse menu and add items
4. Customize each item
5. Your order syncs in real-time

### Secret Menu Items

- **Animal Style** - Mustard-cooked patty, pickles, grilled onions, extra spread
- **Protein Style** - Lettuce wrap instead of bun
- **3x3 / 4x4** - Three or four patties and cheese slices
- **Flying Dutchman** - Two patties, two cheese, no bun
- **Grilled Cheese** - All the fixings, no meat
- **Animal Fries** - Fries with cheese, spread, and grilled onions
- **Neapolitan Shake** - All three shake flavors mixed

## Project Structure

```
burgerrun/
├── src/
│   ├── components/
│   │   ├── ui/              # UI components (Button, Card, etc.)
│   │   ├── HomePage.tsx     # Create group order
│   │   ├── JoinPage.tsx     # Join existing order
│   │   ├── OrderPage.tsx    # Main ordering page
│   │   ├── MenuItemCard.tsx # Individual menu item
│   │   ├── OrderSummary.tsx # User's current order
│   │   ├── ReviewPage.tsx   # Organizer review view
│   │   └── PrintPage.tsx    # Print-friendly view
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client
│   │   ├── store.ts         # Zustand state management
│   │   ├── menu.ts          # In-N-Out menu data
│   │   ├── types.ts         # TypeScript types
│   │   ├── utils.ts         # Helper functions
│   │   └── database.types.ts # Supabase types
│   ├── App.tsx              # Router setup
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── supabase-migration.sql   # Database schema
├── .env.example             # Environment template
└── README.md
```

## Database Schema

- **groups** - Group order sessions
- **orders** - Individual person's order within a group
- **order_items** - Specific menu items in an order

All tables have Row Level Security (RLS) policies for basic access control.

## Design

- In-N-Out brand colors: Red (#C41230), Yellow (#FFD200)
- Cream background for California diner vibes
- Mobile-first responsive design
- Print-optimized views for 8.5×11" paper

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npx tsc --noEmit
```

## Contributing

This is a sample project. Feel free to fork and customize for your own group ordering needs!

## License

MIT

---

Made with ❤️ for In-N-Out fans
