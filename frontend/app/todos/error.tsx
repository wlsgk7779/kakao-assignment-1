"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="w-[560px] max-w-full mx-auto">
      <div className="bg-card-bg rounded-dung p-10 shadow-dung flex flex-col items-center gap-4">
        <p className="text-[1.5rem]">😢</p>
        <p className="text-danger font-bold text-[1rem]">오류가 발생했어요!</p>
        <p className="text-text-muted text-[0.9rem]">{error.message}</p>
        <button
          onClick={reset}
          className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}