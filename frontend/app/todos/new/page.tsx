import { Suspense } from "react";
import NewTodoForm from "./components/NewTodoForm";

export default function NewTodoPage() {
  return (
    <Suspense>
      <NewTodoForm />
    </Suspense>
  );
}