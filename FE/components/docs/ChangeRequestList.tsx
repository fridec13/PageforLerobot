"use client";

import React from 'react';
import { DocumentChangeRequest } from '@/lib/models/docs';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface ChangeRequestListProps {
  changeRequests: DocumentChangeRequest[];
  onReviewRequest: (requestId: string) => void;
  onFilterChange: (status: string) => void;
  selectedStatus: string;
}

export const ChangeRequestList: React.FC<ChangeRequestListProps> = ({
  changeRequests,
  onReviewRequest,
  onFilterChange,
  selectedStatus = 'all',
}) => {
  // 상태에 따른 배지 스타일 및 텍스트
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">검토 대기</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">승인됨</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">거부됨</Badge>;
      default:
        return <Badge variant="outline">알 수 없음</Badge>;
    }
  };

  // 행 배경색 스타일
  const getRowStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return '';
      case 'approved':
        return 'bg-green-50';
      case 'rejected':
        return 'bg-red-50';
      default:
        return '';
    }
  };

  // 목록이 비어있는 경우
  if (changeRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-md bg-gray-50">
        <p className="text-gray-500">변경 요청이 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">변경 요청 목록</h3>
        <div className="w-40">
          <Select
            value={selectedStatus}
            onValueChange={onFilterChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="상태 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 상태</SelectItem>
              <SelectItem value="pending">검토 대기</SelectItem>
              <SelectItem value="approved">승인됨</SelectItem>
              <SelectItem value="rejected">거부됨</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableCaption>변경 요청 목록</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>요청자</TableHead>
            <TableHead>문서 ID</TableHead>
            <TableHead>요청일</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>검토자</TableHead>
            <TableHead>검토일</TableHead>
            <TableHead className="text-right">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {changeRequests.map((request) => (
            <TableRow 
              key={request.id} 
              className={getRowStyle(request.status)}
            >
              <TableCell className="font-medium">{request.proposedBy}</TableCell>
              <TableCell>{request.documentId}</TableCell>
              <TableCell>{formatDate(request.createdAt)}</TableCell>
              <TableCell>{getStatusBadge(request.status)}</TableCell>
              <TableCell>{request.reviewedBy || '-'}</TableCell>
              <TableCell>
                {request.reviewedAt ? formatDate(request.reviewedAt) : '-'}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReviewRequest(request.id)}
                  disabled={request.status !== 'pending'}
                >
                  {request.status === 'pending' ? '검토' : '상세보기'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ChangeRequestList; 