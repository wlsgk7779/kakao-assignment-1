"use server";

const BACKEND_URL = process.env.BACKEND_URL;

export async function getTodos() {
  const res = await fetch(`${BACKEND_URL}/todos`, { cache: "no-store" });
  if (!res.ok) throw new Error("할 일 목록을 불러오지 못했습니다.");
  return res.json();
}

export async function getTodo(id: string) {
  const res = await fetch(`${BACKEND_URL}/todos/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("할 일을 불러오지 못했습니다.");
  return res.json();
}

export async function getCategories() {
  const res = await fetch(`${BACKEND_URL}/categories`, { cache: "no-store" });
  if (!res.ok) throw new Error("카테고리를 불러오지 못했습니다.");
  return res.json();
}
