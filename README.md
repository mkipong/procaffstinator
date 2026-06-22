# Trello-Inspired Kanban Board App

A full-featured kanban board application built with Next.js, React, and Supabase. Perfect for task management, project tracking, and team collaboration.

## Features

✅ **Kanban Board** - Visual card-based workflow management  
✅ **Drag & Drop** - Seamlessly move cards between lists  
✅ **Multiple Boards** - Create and manage multiple projects  
✅ **Full CRUD** - Create, read, update, delete boards, lists, and cards  
✅ **Comments** - Add detailed comments to individual cards  
✅ **Due Dates & Labels** - Organize tasks with metadata  
✅ **Search & Filter** - Find cards quickly  
✅ **Responsive Design** - Works on desktop and tablet  
✅ **Database Persistence** - All data saved to Supabase PostgreSQL  
✅ **Railway Ready** - One-click deployment to Railway  

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **State Management**: Zustand
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React
- **Deployment**: Railway, Vercel

## Local Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account (free tier available)
- Git

### Step 1: Clone & Install

```bash
npm install
```

### Step 2: Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a free project
2. In your Supabase dashboard, create these tables:

#### Table: `boards`
```sql
CREATE TABLE boards (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#667eea',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Table: `lists`
```sql
CREATE TABLE lists (
  id TEXT PRIMARY KEY,
  board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Table: `cards`
```sql
CREATE TABLE cards (
  id TEXT PRIMARY KEY,
  list_id TEXT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL,
  due_date DATE,
  label TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Table: `comments`
```sql
CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

3. Get your Supabase credentials:
   - Go to **Settings** → **API**
   - Copy `Project URL` and `Anon Key`

### Step 3: Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Step 4: Run Locally

```bash


```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Create a Board** - Click "Create Board" on the welcome screen
2. **Add Lists** - Click "Add List" to create workflow stages
3. **Add Cards** - Click "Add a card" within each list
4. **Edit Cards** - Click any card to add description, due date, labels, and comments
5. **Move Cards** - Drag cards between lists
6. **Search** - Use the search bar to find cards by title or description
7. **Delete** - Hover over items to reveal delete button

## Deployment to Railway

### Option 1: Railway Dashboard (Easiest)

1. Push code to GitHub
2. Go to [Railway.app](https://railway.app)
3. Create new project → Import from GitHub
4. Select this repository
5. Add these environment variables in Railway dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```
6. Deploy!

### Option 2: Railway CLI

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page with board management
├── components/
│   ├── Board.tsx           # Board component
│   ├── BoardHeader.tsx     # Header with title and actions
│   ├── BoardList.tsx       # Sidebar for board selection
│   ├── BoardPage.tsx       # Main board view
│   ├── Card.tsx            # Individual card
│   ├── CardModal.tsx       # Card detail modal
│   ├── List.tsx            # List/column component
│   └── SearchBar.tsx       # Search functionality
├── lib/
│   ├── store.ts            # Zustand state management
│   └── supabase.ts         # Supabase client
├── styles/
│   └── globals.css         # Global styles with Tailwind
└── public/                 # Static assets
```

## Customization

### Change Colors
Edit `tailwind.config.js`:
```js
colors: {
  'trello-blue': '#your-color',
}
```

### Modify Layout
All components use Tailwind CSS. Update `className` attributes in component files.

### Add Features
- **Attachments**: Add file upload to `CardModal.tsx`
- **User Auth**: Integrate Supabase Auth
- **Notifications**: Add toast notifications with `react-hot-toast`
- **Real-time Sync**: Use Supabase real-time subscriptions

## Troubleshooting

**"Cannot find module '@supabase/supabase-js'"**
```bash
npm install @supabase/supabase-js
```

**"Supabase connection failed"**

- Check `.env.local` has correct URLs
- Verify Supabase project is active
- Check API keys haven't been regenerated

**"Cards not persisting"**
- Ensure Supabase tables are created
- Check database connection in Supabase dashboard
- Verify RLS policies allow public access (for demo)

## Performance Tips

- Use IndexedDB for offline support (add `idb` package)
- Implement pagination for large boards
- Cache frequently accessed data with SWR
- Optimize images with Next.js Image component

## Security Notes

For production:
- Implement Supabase Auth
- Enable Row Level Security (RLS) policies
- Use environment variables for sensitive data
- Validate input on backend
- Rate limit API endpoints

## License

MIT - Feel free to use and modify!

## Support

For issues or questions:
1. Check Supabase docs: https://supabase.com/docs
2. Next.js docs: https://nextjs.org/docs
3. Create an issue in your repo

---

**Built with ❤️ by Claude**

Happy building! 🚀
