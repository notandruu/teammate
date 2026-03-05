# sideline

group chat sports betting syndicate over imessage. pool money with friends, browse polymarket sports markets, propose bets, vote, and auto-execute.

## setup

```bash
cp .env.example .env
# fill in ANTHROPIC_API_KEY, POLYGON_RPC_URL, MASTER_PRIVATE_KEY
bun install
bun dev
```

requires macOS with Full Disk Access granted to the terminal running sideline (for imessage db access).

## commands (in any group chat)

| message | action |
|---|---|
| `deposit $50` | add $50 to your pool share |
| `withdraw $20` | take $20 out (only available balance) |
| `what games are on` | browse live polymarket sports markets |
| `bet $50 on lakers winning` | propose a bet |
| `yes` / `no` | vote on the active proposal |
| `status` | check pool balance and active bets |
| `help` | see all commands |

## how bets work

1. someone proposes a bet (search → find polymarket market → create proposal)
2. everyone votes yes/no — weight = your share of the pool
3. 2/3 majority passes the bet → sideline auto-executes on polymarket
4. position tracked until market resolves

## stack

- runtime: bun
- imessage: @photon-ai/imessage-kit
- ai parsing: claude haiku via @anthropic-ai/sdk (tool_use)
- database: sqlite (bun:sqlite)
- markets: polymarket gamma api (read) + clob api (trade)
- chain: polygon (USDC)
