"""SMA golden/death cross backtest on a 6-ticker watchlist with VectorBT.

Run:  python backtest.py
"""
import pandas as pd
import yfinance as yf
import vectorbt as vbt

# ---- Settings -------------------------------------------------------------
TICKERS = ["3988.HK", "1398.HK", "0939.HK", "N2IU.SI", "A17U.SI", "9CI.SI"]
PERIOD = "5y"
FAST, SLOW = 50, 200
INIT_CASH = 10_000      # per ticker, in each stock's own currency
FEES = 0.001            # 0.1% per trade
PLOT_TICKER = TICKERS[0]
# ---------------------------------------------------------------------------

# Step 1 - data
price = yf.download(TICKERS, period=PERIOD, auto_adjust=True, progress=False)["Close"]
price = price.dropna(how="all")

# HK and SG have different holidays, so fill gaps with the last known price
price = price.ffill()

# Catch wrong or case-sensitive symbols early
empty = [t for t in TICKERS if t not in price.columns or price[t].dropna().empty]
if empty:
    raise SystemExit(f"No data returned for: {empty}. Check the exact symbol on finance.yahoo.com")

# Step 2 - indicators
fast = vbt.MA.run(price, FAST)
slow = vbt.MA.run(price, SLOW)

# Step 3 - signals (golden cross in, death cross out)
entries = fast.ma_crossed_above(slow)
exits = fast.ma_crossed_below(slow)

# Act on the NEXT bar so we don't trade on a close we only knew after it printed
entries = entries.shift(1, fill_value=False)
exits = exits.shift(1, fill_value=False)

# Step 4 - portfolio
pf = vbt.Portfolio.from_signals(
    price, entries, exits,
    init_cash=INIT_CASH, fees=FEES, freq="D",
)

# Step 5 - results, one row per ticker (agg_func=None avoids averaging them)
stats = pf.stats(agg_func=None)
key = ["Total Return [%]", "Benchmark Return [%]", "Max Drawdown [%]",
       "Sharpe Ratio", "Profit Factor", "Total Trades"]
key = [c for c in key if c in stats.columns]

pd.set_option("display.width", 200)
print(f"\nSMA {FAST}/{SLOW} crossover, last {PERIOD}\n")
stats.index = stats.index.get_level_values(-1)
print(stats[key].round(2))

stats.to_csv("backtest_stats.csv")
print("\nFull stats saved to backtest_stats.csv")

# Step 6 - one chart per ticker, with the SMA lines drawn on the price panel
for t in TICKERS:               # or use [PLOT_TICKER] to open just one
    fig = pf.plot(column=(FAST, SLOW, t))
    f = fast.ma.xs(t, axis=1, level=-1).iloc[:, 0]
    s = slow.ma.xs(t, axis=1, level=-1).iloc[:, 0]
    fig.add_scatter(x=f.index, y=f, name=f"SMA {FAST}", row=1, col=1)
    fig.add_scatter(x=s.index, y=s, name=f"SMA {SLOW}", row=1, col=1)
    fig.update_layout(width=1100, height=900, title=f"{t} SMA {FAST}/{SLOW}")
    fig.show()
