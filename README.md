# sideline

**add sideline to your group chat, pool money with friends, and bet on sports together through polymarket, all over iMessage.**

no app. no UI. just text.

---

## how it works

1. add sideline to any iMessage group chat
2. friends deposit USDC into the shared pool
3. someone proposes a bet in plain english ("bet $50 on the lakers winning tonight")
4. the group votes yes/no — weighted by each person's share
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
| `MASTER_PRIVATE_KEY` | EVM private key — this wallet holds group USDC |

**macOS requirement:** grant Full Disk Access to your terminal app in System Settings → Privacy & Security. this lets the photon imessage-kit read `~/Library/Messages/chat.db`.

---

## stack

- **runtime:** bun
- **language:** typescript
- **imessage:** `@photon-ai/imessage-kit`
- **ai parsing:** claude haiku via `@anthropic-ai/sdk` (tool_use)
- **database:** sqlite via `bun:sqlite` (local, zero infra)
- **prediction markets:** polymarket gamma api (read) + clob api (trade)
- **chain:** polygon — all positions in USDC

---

## built for

[photon build challenge](https://photon.so) — personal utility category.
