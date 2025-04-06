import { Strategy as LocalStrategy } from 'passport-local';
import passport from 'passport';
import { db } from './db';
import { users, User as DbUser } from './schema';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

// Frontend-expected User type (omit password)
interface FrontendUser {
  id: number;
  username: string;
  fullName: string;
  role: string;
  initials: string;
}

passport.use(new LocalStrategy(async (username: string, password: string, done) => {
  try {
    const user = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (!user.length || !(await bcrypt.compare(password, user[0].password_hash))) {
      return done(null, false, { message: 'Invalid credentials' });
    }
    const frontendUser: FrontendUser = {
      id: user[0].id,
      username: user[0].username,
      fullName: user[0].name,
      role: user[0].role_id === 2 ? 'miner' : 'manager', // Adjust based on your roles
      initials: user[0].name.split(' ').map(n => n[0]).join('').toUpperCase(),
    };
    return done(null, frontendUser);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user: FrontendUser, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!user.length) {
      return done(null, null);
    }
    const frontendUser: FrontendUser = {
      id: user[0].id,
      username: user[0].username,
      fullName: user[0].name,
      role: user[0].role_id === 2 ? 'miner' : 'manager',
      initials: user[0].name.split(' ').map(n => n[0]).join('').toUpperCase(),
    };
    return done(null, frontendUser);
  } catch (err) {
    return done(err);
  }
});

// Override Express User type
declare global {
  namespace Express {
    interface User extends FrontendUser {}
  }
}