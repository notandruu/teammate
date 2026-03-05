export function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`
}

export function formatCents(price: number): string {
  return `${Math.round(price * 100)}c`
}

export function formatPayout(amount: number, price: number): string {
  const shares = amount / price
  const payout = shares * 1.0
  const profit = payout - amount
  return `~${formatUsd(payout)} (+${formatUsd(profit)} profit)`
}

export function formatPercent(weight: number): string {
  return `${Math.round(weight * 100)}%`
}
