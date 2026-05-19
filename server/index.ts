import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import { eq, and } from 'drizzle-orm';
import { db } from './db';
import { usersTable, inventoryTable } from './db/schema';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET ?? 'pokemon-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 },
}));

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.session.userId) {
    res.status(401).json({ error: 'Non connecté' });
    return;
  }
  next();
}

// ─── Auth ────────────────────────────────────────────────────────────────────

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body as { username: string; password: string };
  if (!username?.trim() || !password) {
    res.status(400).json({ error: 'Champs manquants' });
    return;
  }
  const hash = await bcrypt.hash(password, 10);
  try {
    const [user] = await db
      .insert(usersTable)
      .values({ username: username.trim(), password: hash })
      .returning({ id: usersTable.id, username: usersTable.username });
    req.session.userId = user.id;
    res.json(user);
  } catch {
    res.status(409).json({ error: "Nom d'utilisateur déjà pris" });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body as { username: string; password: string };
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username ?? ''));
  if (!user || !(await bcrypt.compare(password ?? '', user.password))) {
    res.status(401).json({ error: 'Identifiants incorrects' });
    return;
  }
  req.session.userId = user.id;
  res.json({ id: user.id, username: user.username });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/me', async (req, res) => {
  if (!req.session.userId) { res.json(null); return; }
  const [user] = await db
    .select({ id: usersTable.id, username: usersTable.username })
    .from(usersTable)
    .where(eq(usersTable.id, req.session.userId));
  res.json(user ?? null);
});

// ─── Inventaire ───────────────────────────────────────────────────────────────

app.get('/api/inventory', requireAuth, async (req, res) => {
  const items = await db
    .select({ cardId: inventoryTable.cardId, quantity: inventoryTable.quantity })
    .from(inventoryTable)
    .where(eq(inventoryTable.userId, req.session.userId!));
  res.json(items);
});

// Appelé quand un booster est ouvert — body: { cardIds: number[] }
app.post('/api/inventory', requireAuth, async (req, res) => {
  const { cardIds } = req.body as { cardIds: number[] };
  const userId = req.session.userId!;

  for (const cardId of cardIds) {
    const [existing] = await db
      .select()
      .from(inventoryTable)
      .where(and(eq(inventoryTable.userId, userId), eq(inventoryTable.cardId, cardId)));

    if (existing) {
      await db
        .update(inventoryTable)
        .set({ quantity: existing.quantity + 1 })
        .where(and(eq(inventoryTable.userId, userId), eq(inventoryTable.cardId, cardId)));
    } else {
      await db.insert(inventoryTable).values({ userId, cardId, quantity: 1 });
    }
  }

  const inventory = await db
    .select({ cardId: inventoryTable.cardId, quantity: inventoryTable.quantity })
    .from(inventoryTable)
    .where(eq(inventoryTable.userId, userId));
  res.json(inventory);
});

app.listen(3001, () => console.log('API → http://localhost:3001'));
