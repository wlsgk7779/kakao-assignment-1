import { Suspense } from "react";
import TodoApp from "./components/TodoApp";

export default function TodosPage() {
  return (
    <Suspense>
      <TodoApp />
    </Suspense>
  );
}
