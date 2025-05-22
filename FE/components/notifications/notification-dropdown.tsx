"use client";

import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotificationStore } from '@/lib/store/notificationStore';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    removeNotification,
    clearAllNotifications
  } = useNotificationStore();

  // 알림 클릭 시 처리
  const handleNotificationClick = (id: string, link?: string) => {
    markAsRead(id);
    
    if (link) {
      router.push(link);
      setIsOpen(false);
    }
  };

  // 알림 시간 포맷팅
  const formatNotificationTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true,
      locale: ko 
    });
  };

  // 알림 유형별 스타일
  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-l-4 border-green-500';
      case 'warning':
        return 'bg-amber-50 border-l-4 border-amber-500';
      case 'error':
        return 'bg-red-50 border-l-4 border-red-500';
      default:
        return 'bg-blue-50 border-l-4 border-blue-500';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-destructive text-white text-xs h-5 w-5 flex items-center justify-center p-0">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <div className="font-medium">알림</div>
          <div className="flex gap-1">
            {notifications.length > 0 && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={markAllAsRead}
                  title="모두 읽음으로 표시"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive" 
                  onClick={clearAllNotifications}
                  title="모두 삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
        
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <Bell className="h-10 w-10 stroke-[1.25px] mb-2 opacity-40" />
            <p>알림이 없습니다</p>
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            <div className="divide-y">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 ${notification.isRead ? 'bg-background' : getNotificationStyles(notification.type)} relative group`}
                >
                  <div 
                    className={`cursor-pointer ${notification.link ? 'hover:underline' : ''}`}
                    onClick={() => handleNotificationClick(notification.id, notification.link)}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <span className="text-xs text-muted-foreground">
                        {formatNotificationTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{notification.message}</p>
                  </div>
                  
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {!notification.isRead && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={() => markAsRead(notification.id)}
                        title="읽음으로 표시"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-destructive" 
                      onClick={() => removeNotification(notification.id)}
                      title="삭제"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2 text-center">
              <Link href="/profile/notifications" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" size="sm" className="text-xs w-full">
                  모든 알림 보기
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
} 