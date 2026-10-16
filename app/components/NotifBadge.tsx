"use client";
import { useState, useEffect } from 'react';

export default function NotifBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const checkUnread = async () => {
      const loggedInUser = localStorage.getItem('currentUser');
      if (!loggedInUser) return;
      const user = JSON.parse(loggedInUser);

      try {
        const [orderRes, supportRes] = await Promise.all([
          fetch('/api/orders').catch(() => null),
          fetch('/api/supports').catch(() => null)
        ]);

        const orders = orderRes ? await orderRes.json() : [];
        const supports = supportRes ? await supportRes.json() : [];

        const myOrders = orders.filter((o: any) => o.customer_phone === user.phone);
        const mySupports = supports.filter((s: any) => s.customer === user.username || s.phone === user.phone);

        let notifs: any[] = [];

        myOrders.forEach((o: any) => {
          notifs.push({ date: o.createdAt });
          if (o.status === 'Đang giao hàng' || o.status === 'Đã vận chuyển') {
            notifs.push({ date: o.updatedAt || o.createdAt });
          }
        });

        mySupports.forEach((s: any) => {
          if (s.status === 'Đã trả lời' && s.admin_reply) {
            notifs.push({ date: s.updatedAt || s.createdAt });
          }
        });

        // So sánh thời gian thông báo với thời gian lần cuối xem
        const lastRead = Number(localStorage.getItem('lastReadNotifs') || 0);
        const unread = notifs.filter(n => new Date(n.date).getTime() > lastRead).length;
        
        setUnreadCount(unread);
      } catch (error) {}
    };

    checkUnread();
    
    // Tự động quét tìm thông báo mới mỗi 5 giây (như web thật)
    const interval = setInterval(checkUnread, 5000);
    return () => clearInterval(interval);
  }, []);

  // Nếu không có thông báo mới thì ẩn luôn cục màu đỏ
  if (unreadCount === 0) return null;

  return (
    <span 
      style={{ 
        position: 'absolute', 
        top: '-7px', 
        right: '-10px', 
        background: '#ef4444', 
        color: '#ffffff', 
        fontSize: '10px', 
        fontWeight: '800',
        minWidth: '18px', 
        height: '18px', 
        padding: '0 4px', 
        borderRadius: '9999px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1.5px solid #ffffff',
        boxShadow: '0 2px 6px rgba(239, 68, 68, 0.45)',
        lineHeight: 1,
        zIndex: 10
      }}
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
}