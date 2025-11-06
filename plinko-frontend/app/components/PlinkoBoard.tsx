"use client";
export default function PlinkoBoard() {
  const rows = 12;
  return (
    <div className="relative w-[600px] h-[500px] mx-auto mt-10 bg-gray-900 rounded-2xl p-4">
      {Array.from({ length: rows }, (_, r) => (
        <div
          key={r}
          className="flex justify-center gap-4"
          style={{ marginTop: 20 }}
        >
          {Array.from({ length: r + 1 }, (_, c) => (
            <div key={c} className="w-2 h-2 bg-white rounded-full" />
          ))}
        </div>
      ))}
      <div className="flex justify-between absolute bottom-2 left-6 right-6">
        {Array.from({ length: 13 }, (_, i) => (
          <div
            key={i}
            className="w-8 h-8 bg-gray-700 text-white flex items-center justify-center rounded-md text-xs"
          >
            {i}
          </div>
        ))}
      </div>
    </div>
  );
}
