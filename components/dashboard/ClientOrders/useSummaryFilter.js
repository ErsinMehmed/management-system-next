import { useState } from "react";
import { getLocalTimeZone } from "@internationalized/date";
import { clientOrderStore } from "@/stores/useStore";

function computeRange(preset, customFrom, customTo) {
  const now = new Date();
  switch (preset) {
    case "24h":
      return { from: new Date(now - 24 * 60 * 60 * 1000).toISOString(), to: now.toISOString() };
    case "today": {
      const s = new Date(now);
      s.setHours(8, 0, 0, 0);
      return { from: s.toISOString(), to: now.toISOString() };
    }
    case "yesterday": {
      const s = new Date(now);
      s.setDate(s.getDate() - 1);
      s.setHours(0, 0, 0, 0);
      const e = new Date(now);
      e.setDate(e.getDate() - 1);
      e.setHours(23, 59, 59, 999);
      return { from: s.toISOString(), to: e.toISOString() };
    }
    case "week": {
      const s = new Date(now);
      const day = s.getDay();
      s.setDate(s.getDate() - (day === 0 ? 6 : day - 1));
      s.setHours(0, 0, 0, 0);
      return { from: s.toISOString(), to: now.toISOString() };
    }
    case "month": {
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: s.toISOString(), to: now.toISOString() };
    }
    case "all":
      return { from: null, to: null };
    case "custom":
      return {
        from: customFrom ? customFrom.toDate(getLocalTimeZone()).toISOString() : null,
        to: customTo ? customTo.toDate(getLocalTimeZone()).toISOString() : null,
      };
    default:
      return { from: null, to: null };
  }
}

export function useSummaryFilter() {
  const [summaryPreset, setSummaryPreset] = useState("24h");
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const applyFilter = (preset = summaryPreset, cfrom = customFrom, cto = customTo) => {
    const { from, to } = computeRange(preset, cfrom, cto);
    clientOrderStore.loadSummary(from, to);
  };

  return { summaryPreset, setSummaryPreset, customFrom, setCustomFrom, customTo, setCustomTo, applyFilter };
}
