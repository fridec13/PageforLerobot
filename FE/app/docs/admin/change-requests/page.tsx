import React from 'react';
import Link from 'next/link';

// 변경 요청 관리 페이지 (관리자용)
export default async function ChangeRequestsPage() {
  // 실제로는 여기서 API를 호출하여 변경 요청 목록을 가져옴
  // 지금은 Mock 데이터라고 가정
  const changeRequests = [
    {
      id: 'req_1',
      documentId: 'doc_1',
      documentTitle: 'RoboDK 소개',
      proposedBy: 'user_contributor1',
      status: 'pending',
      createdAt: new Date('2023-05-20')
    },
    {
      id: 'req_2',
      documentId: 'doc_3',
      documentTitle: 'Onshape 기초',
      proposedBy: 'user_contributor2',
          status: 'approved',
      createdAt: new Date('2023-05-15')
    },
    {
      id: 'req_3',
      documentId: 'doc_4',
      documentTitle: 'ROS2 설치 가이드',
      proposedBy: 'user_contributor3',
          status: 'rejected',
      createdAt: new Date('2023-05-18')
  }
  ];

  return (
    <div className="change-requests-page">
      <h1 className="text-3xl font-bold mb-8">변경 요청 관리</h1>
      
      <div className="mb-6">
        <div className="flex space-x-4">
          <Link 
            href="/docs/admin/change-requests?status=pending" 
            className="px-4 py-2 bg-yellow-100 rounded"
          >
            대기 중
          </Link>
          <Link 
            href="/docs/admin/change-requests?status=approved" 
            className="px-4 py-2 bg-green-100 rounded"
          >
            승인됨
          </Link>
          <Link 
            href="/docs/admin/change-requests?status=rejected" 
            className="px-4 py-2 bg-red-100 rounded"
          >
            거부됨
          </Link>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">문서</th>
              <th className="py-3 px-4 text-left">제안자</th>
              <th className="py-3 px-4 text-left">상태</th>
              <th className="py-3 px-4 text-left">제안일</th>
              <th className="py-3 px-4 text-left">작업</th>
            </tr>
          </thead>
          <tbody>
            {changeRequests.map((request) => (
              <tr key={request.id} className="border-t">
                <td className="py-3 px-4">{request.id}</td>
                <td className="py-3 px-4">
                  <Link href={`/docs/${request.documentId}`} className="text-blue-500 hover:underline">
                    {request.documentTitle}
                  </Link>
                </td>
                <td className="py-3 px-4">{request.proposedBy}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    request.status === 'pending' ? 'bg-yellow-100' :
                    request.status === 'approved' ? 'bg-green-100' :
                    'bg-red-100'
                  }`}>
                    {request.status === 'pending' ? '대기 중' :
                     request.status === 'approved' ? '승인됨' :
                     '거부됨'}
                  </span>
                </td>
                <td className="py-3 px-4">{request.createdAt.toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <Link 
                    href={`/docs/admin/change-requests/${request.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    검토
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-8">
        <Link href="/docs" className="text-blue-500 hover:underline">
          ← 문서 목록으로
        </Link>
      </div>
    </div>
  );
}