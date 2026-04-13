"use client";

import { useState, useMemo } from "react";
// @ts-ignore
import { Lunar } from "lunar-javascript";

// ── 六曜 ────────────────────────────────────────────────
const ROKUYOU = ["先勝", "友引", "先負", "仏滅", "大安", "赤口"] as const;
const ROKUYOU_COLORS: Record<string, string> = {
  先勝: "text-sky-500",
  友引: "text-emerald-500",
  先負: "text-slate-400",
  仏滅: "text-slate-400",
  大安: "text-red-500",
  赤口: "text-rose-400",
};

function getRokuyou(date: Date): { name: string; color: string } {
  const lunar = Lunar.fromDate(date);
  const lm = Math.abs(lunar.getMonth() as number); // 閏月は負数
  const ld = lunar.getDay() as number;
  const idx = ((lm - 1) + (ld - 1)) % 6;
  const name = ROKUYOU[idx];
  return { name, color: ROKUYOU_COLORS[name] };
}

// ── 日本の祝日 ──────────────────────────────────────────
function getNthWeekday(year: number, month: number, nth: number, weekday: number): number {
  const first = new Date(year, month - 1, 1);
  const diff = (weekday - first.getDay() + 7) % 7;
  return 1 + diff + (nth - 1) * 7;
}

function getHolidays(year: number): Record<string, string> {
  const h: Record<string, string> = {};
  const k = (m: number, d: number) =>
    `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  // 固定祝日
  h[k(1, 1)]  = "元日";
  h[k(2, 11)] = "建国記念の日";
  h[k(2, 23)] = "天皇誕生日";
  h[k(4, 29)] = "昭和の日";
  h[k(5, 3)]  = "憲法記念日";
  h[k(5, 4)]  = "みどりの日";
  h[k(5, 5)]  = "こどもの日";
  h[k(8, 11)] = "山の日";
  h[k(11, 3)] = "文化の日";
  h[k(11, 23)]= "勤労感謝の日";

  // ハッピーマンデー
  h[k(1,  getNthWeekday(year, 1,  2, 1))] = "成人の日";
  h[k(7,  getNthWeekday(year, 7,  3, 1))] = "海の日";
  h[k(9,  getNthWeekday(year, 9,  3, 1))] = "敬老の日";
  h[k(10, getNthWeekday(year, 10, 2, 1))] = "スポーツの日";

  // 春分・秋分（略算式）
  const y = year - 1980;
  const vernal   = Math.floor(20.8431 + 0.242194 * y - Math.floor(y / 4));
  const autumnal = Math.floor(23.2488 + 0.242194 * y - Math.floor(y / 4));
  h[k(3, vernal)]   = "春分の日";
  h[k(9, autumnal)] = "秋分の日";

  return h;
}

// ── ユーティリティ ──────────────────────────────────────
function toKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

// ── コンポーネント ──────────────────────────────────────
type TodosByDate = Record<string, { id: number; text: string; completed: boolean }[]>;

type Props = {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  todosByDate?: TodosByDate;
};

export default function Calendar({ selectedDate, onSelectDate, todosByDate = {} }: Props) {
  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);

  const holidays = useMemo(() => getHolidays(viewYear), [viewYear]);

  // カレンダーのセル（nullは空白）
  const cells = useMemo(() => {
    const firstDow    = new Date(viewYear, viewMonth - 1, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const arr: (Date | null)[] = Array(firstDow).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push(new Date(viewYear, viewMonth - 1, d));
    }
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 1) { setViewYear((y) => y - 1); setViewMonth(12); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 12) { setViewYear((y) => y + 1); setViewMonth(1); }
    else setViewMonth((m) => m + 1);
  };

  const todayKey     = toKey(today);
  const selectedKey  = selectedDate ? toKey(selectedDate) : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-slate-700">
          {viewYear}年 {viewMonth}月
        </span>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`text-center text-xs font-medium py-1 ${
              i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-slate-400"
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* 日付セル */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;

          const key        = toKey(date);
          const dow        = date.getDay();
          const isToday    = key === todayKey;
          const isSelected = key === selectedKey;
          const isHoliday  = !!holidays[key];
          const rokuyo     = getRokuyou(date);
          const hasTodos   = (todosByDate[key]?.length ?? 0) > 0;

          const dayTextColor = isSelected
            ? "text-white"
            : isHoliday || dow === 0
            ? "text-red-500"
            : dow === 6
            ? "text-blue-500"
            : "text-slate-700";

          const rokuyoTextColor = isSelected ? "text-indigo-200" : rokuyo.color;

          return (
            <button
              key={key}
              onClick={() => onSelectDate(date)}
              className={`flex flex-col items-center py-1.5 rounded-xl transition-all ${
                isSelected
                  ? "bg-indigo-500 shadow-sm"
                  : isToday
                  ? "bg-indigo-50 ring-1 ring-indigo-200"
                  : "hover:bg-slate-50"
              }`}
            >
              <span className={`text-xs font-semibold leading-none ${dayTextColor}`}>
                {date.getDate()}
              </span>
              <span className={`text-[9px] leading-none mt-0.5 font-medium ${rokuyoTextColor}`}>
                {rokuyo.name}
              </span>
              {/* タスクありドット */}
              <span className={`w-1 h-1 rounded-full mt-0.5 ${
                hasTodos
                  ? isSelected ? "bg-indigo-200" : "bg-indigo-400"
                  : "bg-transparent"
              }`} />
            </button>
          );
        })}
      </div>

      {/* 選択日の詳細 */}
      {selectedDate && (() => {
        const r = getRokuyou(selectedDate);
        const key = toKey(selectedDate);
        const holidayName = holidays[key];
        const dow = selectedDate.getDay();
        const dowLabel = WEEKDAYS[dow];
        return (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">
                {selectedDate.getFullYear()}年
                {selectedDate.getMonth() + 1}月
                {selectedDate.getDate()}日
                <span className={`ml-1 text-xs ${dow === 0 ? "text-red-500" : dow === 6 ? "text-blue-500" : "text-slate-400"}`}>
                  （{dowLabel}）
                </span>
              </span>
              {holidayName && (
                <span className="text-xs bg-red-50 text-red-500 px-1.5 py-0.5 rounded-md font-medium">
                  {holidayName}
                </span>
              )}
            </div>
            <span className={`text-base font-bold ${r.color}`}>{r.name}</span>
          </div>
        );
      })()}
    </div>
  );
}
