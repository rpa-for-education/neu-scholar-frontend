export default function SourceCard({ source }) {
  return (
    <div className="border rounded-lg p-3 bg-gray-50">
      <div className="flex justify-between text-sm text-gray-600">
        <span>{source.author || "Ẩn danh"}</span>
        <span>Score: {source.score?.toFixed(3)}</span>
      </div>
      <p className="mt-2">{source.noi_dung_bai_viet || source.text}</p>
      <div className="flex gap-4 text-xs text-gray-500 mt-2">
        <span>👍 {source.like}</span>
        <span>💬 {source.comment}</span>
        <span>↗️ {source.share}</span>
      </div>
      {source.url && (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 text-sm mt-2 inline-block"
        >
          Xem bài gốc
        </a>
      )}
    </div>
  );
}
