"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Todo = {
  id: number;
  text: string;
  completed: boolean;
  date: string;
  categoryId: string;
};

type Category = {
  id: string;
  name: string;
};

export default function EditTodoForm({ todo }: { todo: Todo }) {
  const router = useRouter();
  const [text, setText] = useState(todo.text);
  const [categoryId, setCategoryId] = useState(todo.categoryId || "general");
  const [completed, setCompleted] = useState(todo.completed);
  const [categories, setCategories] = useState<Category[]>([{ id: "general", name: "📂 일반" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/categories`)
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setCategories(data); })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) {
      setError("할 일을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), categoryId, completed }),
      });
      if (!res.ok) throw new Error("수정에 실패했습니다.");
      router.push("/todos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("정말로 삭제하시겠습니까?")) return;
    await fetch(`/api/todos/${todo.id}`, { method: "DELETE" });
    router.push("/todos");
    router.refresh();
  }

  return (
    <div className="w-[560px] max-w-full mx-auto">
      <div className="bg-card-bg rounded-dung p-6 shadow-dung">
        <h2 className="text-[1.4rem] font-extrabold text-primary mb-6">할 일 수정</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.9rem] font-bold text-text-main">할 일</label>
            <input
              type="text"
              value={text}
              onChange={(e) => { setText(e.target.value); setError(""); }}
              className="px-4 py-3 border-2 border-border-main rounded-xl text-[1rem] outline-none bg-card-bg text-text-main focus:border-primary"
            />
            {error && <p className="text-danger text-[0.85rem] font-semibold">⚠️ {error}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.9rem] font-bold text-text-main">카테고리</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="px-4 py-3 border-2 border-border-main rounded-xl text-[1rem] outline-none bg-card-bg text-text-main focus:border-primary"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="completed"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              className="w-5 h-5 accent-primary cursor-pointer"
            />
            <label htmlFor="completed" className="text-[0.95rem] font-semibold text-text-main cursor-pointer">
              완료됨
            </label>
          </div>

          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-primary text-white rounded-xl text-[1rem] font-bold hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "저장 중..." : "저장"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 border-2 border-border-main rounded-xl text-[1rem] font-bold text-text-muted hover:bg-primary-light transition-colors"
            >
              취소
            </button>
          </div>

          <button
            type="button"
            onClick={handleDelete}
            className="w-full py-3 bg-danger text-white rounded-xl text-[1rem] font-bold hover:bg-danger-hover transition-colors"
          >
            삭제
          </button>
        </form>
      </div>
    </div>
  );
}
