"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animatingId, setAnimatingId] = useState<number | null>(null);

  const fetchTodos = useCallback(async () => {
    try {
      const res = await fetch("/api/todos");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTodos(data);
      setError(null);
    } catch {
      setError("Could not load your tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  async function addTodo(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });

    if (res.ok) {
      const newTodo = await res.json();
      setTodos((prev) => [newTodo, ...prev]);
      setTitle("");
    }
  }

  async function toggleTodo(todo: Todo) {
    const res = await fetch(`/api/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    });

    if (res.ok) {
      const updated = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

      if (updated.completed) {
        setAnimatingId(updated.id);
        setTimeout(() => setAnimatingId(null), 600);
      }
    }
  }

  async function deleteTodo(id: number) {
    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });

    if (res.ok) {
      setTodos((prev) => prev.filter((t) => t.id !== id));
    }
  }

  const completed = todos.filter((t) => t.completed).length;

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-lg px-6 py-20">
        <header className="mb-14">
          <h1
            className="text-4xl font-display font-medium tracking-tight text-ink"
            style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
          >
            todos
          </h1>
          <div className="mt-3 h-px w-10 bg-accent/60" />
        </header>

        <form onSubmit={addTodo}>
          <div className="relative">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs doing?"
              className="w-full border-0 border-b bg-transparent px-0 py-3 text-[15px] text-ink placeholder:text-ink-muted/50 transition-colors focus:border-accent focus:outline-none focus:ring-0"
            />
          </div>
        </form>

        {loading && (
          <p className="mt-12 text-center text-sm text-ink-muted">
            Loading...
          </p>
        )}

        {error && (
          <div className="mt-12 border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {!loading && !error && todos.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-sm text-ink-muted">
              Nothing here yet. Your next task is waiting above.
            </p>
          </div>
        )}

        {!loading && todos.length > 0 && (
          <>
            <ul className="mt-8">
              {todos.map((todo) => (
                <li key={todo.id} className="group border-b border-line/70">
                  <button
                    onClick={() => toggleTodo(todo)}
                    className="flex w-full items-center gap-3 py-3.5 text-left"
                  >
                    <span
                      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                        todo.completed
                          ? "border-accent bg-accent scale-100"
                          : "border-ink/20 group-hover:border-accent/40"
                      } ${
                        animatingId === todo.id ? "scale-110" : ""
                      }`}
                    >
                      {todo.completed && (
                        <svg
                          className={`h-2.5 w-2.5 text-white transition-transform duration-300 ${
                            animatingId === todo.id
                              ? "scale-125"
                              : ""
                          }`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <span
                      className={`flex-1 text-[15px] leading-snug transition-colors duration-200 ${
                        todo.completed
                          ? "text-strike line-through decoration-1 decoration-strike/60"
                          : "text-ink"
                      }`}
                    >
                      {todo.title}
                    </span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTodo(todo.id);
                      }}
                      className="shrink-0 cursor-pointer px-2 py-1 text-ink-muted/0 transition-all duration-150 hover:text-danger group-hover:text-ink-muted/50"
                      aria-label="Delete task"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <footer className="mt-6 flex items-center justify-between text-xs text-ink-muted">
              <span>
                {completed} of {todos.length} complete
              </span>
              {completed > 0 && (
                <span>
                  {Math.round((completed / todos.length) * 100)}%
                </span>
              )}
            </footer>
          </>
        )}
      </div>
    </main>
  );
}
