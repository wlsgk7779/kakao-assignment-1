export default function Loading() {
  return (
    <div className="w-[560px] max-w-full mx-auto">
      <div className="bg-card-bg rounded-dung p-10 shadow-dung flex flex-col items-center gap-4">
        <div className="text-[2rem] animate-bounce">🦍</div>
        <p className="text-text-muted font-bold">둥둥이가 할 일을 불러오고 있어요...</p>
      </div>
    </div>
  );
}