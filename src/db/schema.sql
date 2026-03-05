CREATE TABLE IF NOT EXISTS groups (
  chat_id TEXT PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  wallet_index INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_id TEXT NOT NULL,
  sender TEXT NOT NULL,
  display_name TEXT,
  balance_usdc REAL DEFAULT 0,
  joined_at INTEGER NOT NULL,
  FOREIGN KEY (chat_id) REFERENCES groups(chat_id),
  UNIQUE(chat_id, sender)
);

CREATE TABLE IF NOT EXISTS proposals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_id TEXT NOT NULL,
  proposer TEXT NOT NULL,
  market_question TEXT NOT NULL,
  market_slug TEXT NOT NULL,
  condition_id TEXT NOT NULL,
  token_id TEXT NOT NULL,
  side TEXT NOT NULL,
  price REAL NOT NULL,
  amount_usdc REAL NOT NULL,
  num_shares REAL,
  status TEXT DEFAULT 'active',
  total_weight_yes REAL DEFAULT 0,
  total_weight_no REAL DEFAULT 0,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  executed_at INTEGER,
  order_id TEXT,
  FOREIGN KEY (chat_id) REFERENCES groups(chat_id)
);

CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  proposal_id INTEGER NOT NULL,
  voter TEXT NOT NULL,
  vote TEXT NOT NULL,
  weight REAL NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (proposal_id) REFERENCES proposals(id),
  UNIQUE(proposal_id, voter)
);

CREATE TABLE IF NOT EXISTS positions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_id TEXT NOT NULL,
  proposal_id INTEGER NOT NULL,
  condition_id TEXT NOT NULL,
  token_id TEXT NOT NULL,
  market_question TEXT NOT NULL,
  side TEXT NOT NULL,
  entry_price REAL NOT NULL,
  num_shares REAL NOT NULL,
  amount_usdc REAL NOT NULL,
  status TEXT DEFAULT 'open',
  payout REAL,
  created_at INTEGER NOT NULL,
  resolved_at INTEGER,
  FOREIGN KEY (chat_id) REFERENCES groups(chat_id),
  FOREIGN KEY (proposal_id) REFERENCES proposals(id)
);
