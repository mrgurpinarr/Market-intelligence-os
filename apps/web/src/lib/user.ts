import { dbPool } from '@market-intel/tools';

export interface UserProfile {
  id: number;
  email: string;
  name: string | null;
  image: string | null;
  telegram_chat_id: number | null;
  link_token: string | null;
  link_token_expires_at: Date | null;
}

export const syncUserProfile = async (email: string, name?: string | null, image?: string | null): Promise<UserProfile> => {
  const result = await dbPool.query<UserProfile>(
    `INSERT INTO user_profiles (email, name, image, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (email)
     DO UPDATE SET name = EXCLUDED.name, image = EXCLUDED.image, updated_at = NOW()
     RETURNING *`,
    [email, name || null, image || null]
  );
  return result.rows[0];
};

export const getUserWatchlist = async (email: string): Promise<string[]> => {
  const result = await dbPool.query<{ symbol: string }>(
    `SELECT symbol FROM user_watchlists WHERE user_email = $1 ORDER BY created_at DESC`,
    [email]
  );
  return result.rows.map(r => r.symbol);
};

export const addToWatchlist = async (email: string, symbol: string): Promise<void> => {
  await dbPool.query(
    `INSERT INTO user_watchlists (user_email, symbol) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [email, symbol.toUpperCase()]
  );
};

export const removeFromWatchlist = async (email: string, symbol: string): Promise<void> => {
  await dbPool.query(
    `DELETE FROM user_watchlists WHERE user_email = $1 AND symbol = $2`,
    [email, symbol.toUpperCase()]
  );
};

export const generateTelegramLinkToken = async (email: string): Promise<string> => {
  const token = Math.random().toString(36).substring(2, 10).toUpperCase();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

  await dbPool.query(
    `UPDATE user_profiles 
     SET link_token = $1, link_token_expires_at = $2, updated_at = NOW()
     WHERE email = $3`,
    [token, expiresAt, email]
  );

  return token;
};

export const linkTelegramAccount = async (chatId: number, token: string): Promise<{ success: boolean; email?: string; message: string }> => {
  const check = await dbPool.query<UserProfile>(
    `SELECT * FROM user_profiles 
     WHERE link_token = $1 AND link_token_expires_at > NOW()`,
    [token.toUpperCase()]
  );

  if (check.rowCount === 0) {
    return { success: false, message: 'Invalid or expired connection token. Please generate a new code from the Web Terminal.' };
  }

  const user = check.rows[0];

  await dbPool.query(
    `UPDATE user_profiles 
     SET telegram_chat_id = $1, link_token = NULL, link_token_expires_at = NULL, updated_at = NOW()
     WHERE id = $2`,
    [chatId, user.id]
  );

  return { success: true, email: user.email, message: `Successfully linked account (${user.email}) to Telegram!` };
};

export const getUserTelegramStatus = async (email: string) => {
  const res = await dbPool.query<UserProfile>(
    `SELECT telegram_chat_id, link_token, link_token_expires_at FROM user_profiles WHERE email = $1`,
    [email]
  );
  if (res.rowCount === 0) return { linked: false, chatId: null };
  const user = res.rows[0];
  return {
    linked: !!user.telegram_chat_id,
    chatId: user.telegram_chat_id,
    linkToken: user.link_token,
    expiresAt: user.link_token_expires_at,
  };
};
