import { notFound } from "next/navigation";
import EditTodoForm from "./components/EditTodoForm";
import { getTodo } from "@/app/actions";

export default async function TodoDetailPage({ params }: { params: Promise<{ todoId: string }> }) {
  const { todoId } = await params;

  let todo;
  try {
    todo = await getTodo(todoId);
  } catch {
    notFound();
  }

  if (!todo) notFound();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-bg-main px-4 py-12">
      <EditTodoForm todo={todo} />
    </main>
  );
}



