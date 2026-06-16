"use client";

import { useEffect, useState } from "react";
import { Ticker } from "../utils/types";
import { getTickers } from "../utils/httpClient";
import { useRouter } from "next/navigation";

export const Markets = () => {
  const [tickers, setTickers] = useState<Ticker[]>();

  useEffect(() => {
    getTickers().then((m) => setTickers(m));
  }, []);

  return (
    <div className="flex flex-col flex-1 max-w-[1280px] w-full">
      <div className="flex flex-col min-w-[700px] flex-1 w-full">
        <div className="flex flex-col w-full rounded-lg bg-baseBackgroundL1 px-5 py-3">
          <table className="w-full table-auto">
            <MarketHeader />
            {tickers?.map((m) => <MarketRow key={m.symbol} market={m} />)}
          </table>
        </div>
      </div>
    </div>
  );
};

function MarketRow({ market }: { market: Ticker }) {
  const router = useRouter();
  return (
    <tr className="cursor-pointer border-t border-baseBorderLight hover:bg-white/7 w-full" onClick={() => router.push(`/trade/${market.symbol}`)}>
      <td className="px-1 py-3">
        <div className="flex shrink">
          <div className="flex items-center">
            <div
              className="relative flex-none overflow-hidden rounded-full border border-baseBorderMed"
              style={{ width: "40px", height: "40px" }}
            >
              <img
                alt={market.symbol}
                src={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVvBqZC_Q1TSYObZaMvK0DRFeHZDUtVMh08Q&s"}
                loading="lazy"
                width="40"
                height="40"
                decoding="async"
              />
            </div>
            <div className="ml-4 flex flex-col">
              <p className="whitespace-nowrap text-base font-medium text-white">
                {market.symbol}
              </p>
              <p className="text-left text-xs leading-5 text-slate-400">
                {market.symbol}
              </p>
            </div>
          </div>
        </div>
      </td>
      <td className="px-1 py-3">
        <p className="text-base font-medium tabular-nums text-white">{market.lastPrice}</p>
      </td>
      <td className="px-1 py-3">
        <p className="text-base font-medium tabular-nums text-white">{market.high}</p>
      </td>
      <td className="px-1 py-3">
        <p className="text-base font-medium tabular-nums text-white">{market.volume}</p>
      </td>
      <td className="px-1 py-3">
        <p className={`text-base font-medium tabular-nums ${Number(market.priceChangePercent) >= 0 ? "text-green-400" : "text-red-400"}`}>
          {Number(market.priceChangePercent) > 0 ? "+" : ""}{Number(market.priceChangePercent)?.toFixed(3)} %
        </p>
      </td>
    </tr>
  );
}

function MarketHeader() {
  return (
    <thead>
      <tr>
        <th className="px-2 py-3 text-left text-sm font-normal text-white">Name</th>
        <th className="px-2 py-3 text-left text-sm font-normal text-white">Price</th>
        <th className="px-2 py-3 text-left text-sm font-normal text-white">Market Cap</th>
        <th className="px-2 py-3 text-left text-sm font-normal text-white">24h Volume</th>
        <th className="px-2 py-3 text-left text-sm font-normal text-white">24h Change</th>
      </tr>
    </thead>
  );
}
