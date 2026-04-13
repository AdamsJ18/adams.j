"use client";

import { useState, useEffect } from "react";
import Calendar from "./Calendar";

// ── 型定義 ──────────────────────────────────────────────
type Category = "仕事" | "プライベート" | "買い物";

type Todo = {
  id: number;
  text: string;
  completed: boolean;
  category: Category;
};

type TodosByDate = Record<string, Todo[]>;

// ── カテゴリー設定（付箋カラー） ─────────────────────────
const CAT = {
  仕事: {
    bg:          "bg-blue-50",
    border:      "border-blue-200",
    accent:      "border-l-blue-400",
    badge:       "bg-blue-100 text-blue-600",
    check:       "bg-blue-400 border-blue-400",
    checkHover:  "hover:border-blue-300",
    editRing:    "focus:ring-blue-300 border-blue-300",
    saveBtn:     "text-blue-500 hover:bg-blue-100",
    pencilHover: "hover:text-blue-400 hover:bg-blue-100",
    btnBase:     "border-blue-200 text-blue-500 hover:bg-blue-50",
    btnActive:   "bg-blue-400 border-blue-400 text-white shadow-sm",
  },
  プライベート: {
    bg:          "bg-pink-50",
    border:      "border-pink-200",
    accent:      "border-l-pink-400",
    badge:       "bg-pink-100 text-pink-600",
    check:       "bg-pink-400 border-pink-400",
    checkHover:  "hover:border-pink-300",
    editRing:    "focus:ring-pink-300 border-pink-300",
    saveBtn:     "text-pink-500 hover:bg-pink-100",
    pencilHover: "hover:text-pink-400 hover:bg-pink-100",
    btnBase:     "border-pink-200 text-pink-500 hover:bg-pink-50",
    btnActive:   "bg-pink-400 border-pink-400 text-white shadow-sm",
  },
  買い物: {
    bg:          "bg-yellow-50",
    border:      "border-yellow-200",
    accent:      "border-l-yellow-400",
    badge:       "bg-yellow-100 text-yellow-600",
    check:       "bg-yellow-400 border-yellow-400",
    checkHover:  "hover:border-yellow-300",
    editRing:    "focus:ring-yellow-300 border-yellow-300",
    saveBtn:     "text-yellow-600 hover:bg-yellow-100",
    pencilHover: "hover:text-yellow-500 hover:bg-yellow-100",
    btnBase:     "border-yellow-200 text-yellow-600 hover:bg-yellow-50",
    btnActive:   "bg-yellow-400 border-yellow-400 text-white shadow-sm",
  },
} as const;

const CATEGORIES: Category[] = ["仕事", "プライベート", "買い物"];

// ── 日付キー ────────────────────────────────────────────
function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// ── コンポーネント ──────────────────────────────────────
export default function TodoApp() {
  const [todosByDate, setTodosByDate] = useState<TodosByDate>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("todosByDate");
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const [input,        setInput]        = useState("");
  const [category,     setCategory]     = useState<Category>("仕事");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingId,    setEditingId]    = useState<number | null>(null);
  const [editingText,  setEditingText]  = useState("");

  useEffect(() => {
    localStorage.setItem("todosByDate", JSON.stringify(todosByDate));
  }, [todosByDate]);

  const dateKey      = selectedDate ? toDateKey(selectedDate) : null;
  const currentTodos = dateKey ? (todosByDate[dateKey] ?? []) : [];
  const remaining    = currentTodos.filter((t) => !t.completed).length;

  // ── CRUD ─────────────────────────────────────────────
  const addTodo = () => {
    if (!dateKey) return;
    const trimmed = input.trim();
    if (!trimmed) return;
    setTodosByDate((prev) => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] ?? []), { id: Date.now(), text: trimmed, completed: false, category }],
    }));
    setInput("");
  };

  const toggleTodo = (id: number) => {
    if (!dateKey) return;
    setTodosByDate((prev) => ({
      ...prev,
      [dateKey]: (prev[dateKey] ?? []).map((t) => t.id === id ? { ...t, completed: !t.completed } : t),
    }));
  };

  const deleteTodo = (id: number) => {
    if (!dateKey) return;
    setTodosByDate((prev) => ({
      ...prev,
      [dateKey]: (prev[dateKey] ?? []).filter((t) => t.id !== id),
    }));
  };

  const startEdit  = (todo: Todo) => { setEditingId(todo.id); setEditingText(todo.text); };
  const cancelEdit = () => { setEditingId(null); setEditingText(""); };

  const saveEdit = (id: number) => {
    const trimmed = editingText.trim();
    if (!trimmed || !dateKey) { cancelEdit(); return; }
    setTodosByDate((prev) => ({
      ...prev,
      [dateKey]: (prev[dateKey] ?? []).map((t) => t.id === id ? { ...t, text: trimmed } : t),
    }));
    cancelEdit();
  };

  const clearCompleted = () => {
    if (!dateKey) return;
    setTodosByDate((prev) => ({
      ...prev,
      [dateKey]: (prev[dateKey] ?? []).filter((t) => !t.completed),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-start justify-center pt-10 px-4 pb-10">
      <div className="w-full max-w-md">

        {/* ヒーローエリア */}
        <div className="flex flex-col items-center mb-8">
          <p className="text-xs font-medium tracking-widest text-slate-400 uppercase mb-3">
            Did you forget anything?
          </p>
          <img src="/rooster.png" alt="rooster" className="w-24 h-24 object-contain mb-4" />
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">ToDoリスト</h1>
          {selectedDate && currentTodos.length > 0 && (
            <p className="mt-1 text-sm text-slate-400">
              残り <span className="font-semibold text-slate-600">{remaining}</span> 件
            </p>
          )}
        </div>

        {/* カレンダー */}
        <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} todosByDate={todosByDate} />

        {/* 日付未選択 */}
        {!selectedDate && (
          <div className="text-center py-10 text-slate-300 select-none">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-sm">上のカレンダーから日付を選んでください</p>
          </div>
        )}

        {/* 日付選択後 */}
        {selectedDate && (
          <>
            {/* カテゴリー選択ボタン */}
            <div className="flex gap-2 mb-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    category === cat ? CAT[cat].btnActive : CAT[cat].btnBase
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 入力欄 */}
            <div className="flex gap-2 mb-5">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="新しいタスクを入力..."
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent shadow-sm transition"
              />
              <button
                onClick={addTodo}
                className="px-5 py-3 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 active:scale-95 transition-all shadow-sm"
              >
                追加
              </button>
            </div>

            {/* タスク一覧 */}
            <div className="space-y-2">
              {currentTodos.length === 0 && (
                <div className="text-center py-10 text-slate-300 select-none">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="text-sm">この日のタスクはありません</p>
                </div>
              )}

              {currentTodos.map((todo) => {
                const isEditing = editingId === todo.id;
                const c = CAT[todo.category ?? "仕事"];
                return (
                  <div
                    key={todo.id}
                    className={`flex items-center gap-2 pl-3 pr-3 py-3 rounded-xl border-l-4 shadow-sm transition-all
                      ${c.bg} ${c.border} ${c.accent}
                      ${todo.completed && !isEditing ? "opacity-50" : ""}
                    `}
                  >
                    {/* チェック */}
                    {!isEditing && (
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          todo.completed ? c.check : `border-slate-300 ${c.checkHover}`
                        }`}
                      >
                        {todo.completed && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    )}

                    {/* テキスト / 編集入力 */}
                    {isEditing ? (
                      <input
                        autoFocus
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter")  saveEdit(todo.id);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className={`flex-1 text-sm px-2 py-1 rounded-lg border bg-white focus:outline-none focus:ring-2 text-slate-700 ${c.editRing}`}
                      />
                    ) : (
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm text-slate-700 ${todo.completed ? "line-through text-slate-400" : ""}`}>
                          {todo.text}
                        </span>
                        {/* カテゴリーバッジ */}
                        <span className={`ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${c.badge}`}>
                          {todo.category}
                        </span>
                      </div>
                    )}

                    {/* 編集中: 保存 & キャンセル */}
                    {isEditing && (
                      <>
                        <button onClick={() => saveEdit(todo.id)} title="保存"
                          className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${c.saveBtn}`}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button onClick={cancelEdit} title="キャンセル"
                          className="flex-shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-white/60 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    )}

                    {/* 通常: 編集 & 削除 */}
                    {!isEditing && (
                      <>
                        <button onClick={() => startEdit(todo)} title="編集"
                          className={`flex-shrink-0 p-1.5 rounded-lg text-slate-300 transition-colors ${c.pencilHover}`}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
                          </svg>
                        </button>
                        <button onClick={() => deleteTodo(todo.id)} title="削除"
                          className="flex-shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 完了済みを一括削除 */}
            {currentTodos.some((t) => t.completed) && (
              <div className="mt-4 flex justify-end">
                <button onClick={clearCompleted}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                  完了済みを削除
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
