# sideline

> add sideline to your group chat, pool money with friends, and bet on sports together through polymarket, all over iMessage.

**personal utility** — your friends are already texting about the game. now the bet happens in the same thread.

**conversation-native** — no app, no link, no UI. sideline lives inside the group chat. every interaction is a text message.

**one sentence** — pool money with your group chat and bet on sports through polymarket, without ever leaving iMessage.

---

## how it works

1. run sideline on your Mac — it watches all your iMessage group chats
2. friends declare how much they're putting in (`deposit $50`)
3. someone proposes a bet in plain english (`bet $50 on the lakers winning tonight`)
4. the group votes yes/no — weighted by each person's share of the pool
5. 2/3 majority → sideline auto-executes the trade on polymarket
6. winnings split proportionally when the market resolves

---

## commands

| message | what happens |
|---|---|
| `deposit $50` | add $50 to your pool share |
| `withdraw $20` | pull $20 out (only available balance) |
| `what games are on` | browse live polymarket sports markets |
| `bet $50 on lakers winning` | propose a bet to the group |
| `yes` / `no` | vote on the active proposal |
| `status` | pool balance + open bets |
| `help` | show all commands |

votes also understand casual replies — `lfg`, `im in`, `bet`, `nah`, `pass`, etc.

---

## setup

```bash
cp .env.example .env
# fill in your keys (see below)
bun install
bun dev
```

**env vars:**

| var | description |
|---|---|
| `ANTHROPIC_API_KEY` | for natural language command parsing |
| `POLYGON_RPC_URL` | polygon mainnet rpc (e.g. `https://polygon-rpc.com`) |
| `MASTER_PRIVATE_KEY` | EVM private key — this wallet executes trades on polymarket |

**macOS requirement:** grant Full Disk Access to your terminal app in System Settings → Privacy & Security. this lets sideline read `~/Library/Messages/chat.db`.

---

## stack

- **runtime:** bun
- **language:** typescript
- **imessage:** `@photon-ai/imessage-kit`
- **ai parsing:** claude haiku via `@anthropic-ai/sdk` (tool_use)
- **database:** sqlite via `bun:sqlite` (local, zero infra)
- **prediction markets:** polymarket gamma api (read) + clob api (trade)
- **chain:** polygon — all positions in USDC
