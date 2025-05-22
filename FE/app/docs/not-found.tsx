import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
      <h2 className="text-3xl font-bold mb-4">문서를 찾을 수 없습니다</h2>
      <p className="text-gray-600 mb-8">
        요청하신 문서가 존재하지 않거나 삭제되었을 수 있습니다.
      </p>
      <Link 
        href="/docs" 
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        문서 목록으로
      </Link>
    </div>
  );
} 