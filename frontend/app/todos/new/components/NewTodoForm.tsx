"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Category = {
  id: string;
  name: string;
};

export default function NewTodoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);

  const [text, setText] = useState("");
  const [date, setDate] = useState(dateParam);
  const [categoryId, setCategoryId] = useState("general");
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
      const res = await fetch(`/api/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), date, categoryId }),
      });
      if (!res.ok) throw new Error("Todo 생성에 실패했습니다.");
      router.push("/todos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-[560px] max-w-full mx-auto">
      <div className="bg-card-bg rounded-dung p-6 shadow-dung">
        <h2 className="text-[1.4rem] font-extrabold text-primary mb-6">새 할 일 추가</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.9rem] font-bold text-text-main">할 일</label>
            <input
              type="text"
              value={text}
              onChange={(e) => { setText(e.target.value); setError(""); }}
              placeholder="둥둥아 이거 먼저 해야 해..."
              className="px-4 py-3 border-2 border-border-main rounded-xl text-[1rem] outline-none bg-card-bg text-text-main focus:border-primary"
            />
            {error && <p className="text-danger text-[0.85rem] font-semibold">⚠️ {error}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.9rem] font-bold text-text-main">날짜</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-4 py-3 border-2 border-border-main rounded-xl text-[1rem] outline-none bg-card-bg text-text-main focus:border-primary"
            />
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

          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-primary text-white rounded-xl text-[1rem] font-bold hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "저장 중..." : "추가"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 border-2 border-border-main rounded-xl text-[1rem] font-bold text-text-muted hover:bg-primary-light transition-colors"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
