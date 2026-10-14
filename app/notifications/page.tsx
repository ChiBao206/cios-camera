"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import NotifBadge from '../components/NotifBadge';
import Footer from '../components/Footer';
import FloatingActions from '../components/FloatingActions';

export default function NotificationsPage() {
  const { totalItems } = useCart(); // Thêm cái này để lấy số lượng giỏ hàng
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      fetchNotifications(parsedUser.phone, parsedUser.username);
      
      // Cập nhật lại mốc thời gian xem thông báo
      localStorage.setItem('lastReadNotifs', Date.now().toString());
    } else {
      setIsLoading(false);
    }
  }, []);

  // Thêm hàm Đăng xuất
const handleLogout = () => {
    localStorage.removeItem('camera_bn_cart'); 
    localStorage.removeItem('currentUser'); 
    window.location.href = '/'; 
  };

  const fetchNotifications = async (phone: string, username: string) => {
    setIsLoading(true);
    try {
      const [orderRes, supportRes] = await Promise.all([
        fetch('/api/orders').catch(() => ({ ok: false, json: () => [] })),
        fetch('/api/supports').catch(() => ({ ok: false, json: () => [] }))
      ]);

      const orders = orderRes.ok ? await orderRes.json() : [];
      const supports = supportRes.ok ? await supportRes.json() : [];

      const myOrders = orders.filter((o: any) => o.customer_phone === phone);
      const mySupports = supports.filter((s: any) => s.customer === username || s.phone === phone);

      let notifs: any[] = [];

      myOrders.forEach((o: any) => {
        notifs.push({
          id: `order_success_${o._id}`,
          type: 'success',
          icon: 'fas fa-check-circle',
          color: '#10b981',
          title: 'Đặt hàng thành công',
          message: `Đơn hàng #${String(o._id || o.id).slice(-6).toUpperCase()} trị giá ${Number(o.total_money).toLocaleString('vi-VN')}đ đã được ghi nhận.`,
          date: o.createdAt || new Date().toISOString(),
          link: '/profile'
        });

        if (o.status === 'Đang giao hàng' || o.status === 'Đã vận chuyển') {
          notifs.push({
            id: `order_shipping_${o._id}`,
            type: 'shipping',
            icon: 'fas fa-truck',
            color: '#f59e0b',
            title: 'Đơn hàng đang trung chuyển',
            message: `Kiện hàng #${String(o._id || o.id).slice(-6).toUpperCase()} đang trên đường giao đến bạn. Vui lòng chú ý điện thoại nhé!`,
            date: o.updatedAt || o.createdAt,
            link: '/profile'
          });
        }
      });

      mySupports.forEach((s: any) => {
        if (s.status === 'Đã trả lời' && s.admin_reply) {
          notifs.push({
            id: `support_reply_${s._id}`,
            type: 'message',
            icon: 'fas fa-comment-dots',
            color: '#3b82f6',
            title: 'Admin đã phản hồi tin nhắn',
            message: `"${s.admin_reply}"`,
            date: s.updatedAt || s.createdAt,
            link: '/profile' 
          });
        }
      });

      notifs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setNotifications(notifs);

    } catch (error) {
      console.error("Lỗi lấy thông báo:", error);
    }
    setIsLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', sans-serif" }}>
      
      {/* 0. TOP UTILITY BAR */}
      <div className="top-utility-bar">
        <div className="top-bar-container">
          <div className="top-bar-left">
            <span><i className="fas fa-phone-alt"></i> Hotline tư vấn: <strong style={{ color: '#ffffff' }}>0971.024.173</strong></span>
            <span><i className="fas fa-map-marker-alt"></i> 12 Trịnh Đình Thảo, Tân Phú, TP. HCM</span>
          </div>
          <div className="top-bar-right">
            <span><i className="fas fa-truck"></i> Miễn phí lắp đặt nội thành</span>
            <span><i className="fas fa-shield-alt"></i> Bảo hành chính hãng 24 tháng</span>
          </div>
        </div>
      </div>

      {/* 1. HEADER */}
      <header className="site-header">
        <div className="header-container">
          <Link href="/" className="brand-logo">
            <div className="brand-icon">
              <i className="fas fa-video"></i>
            </div>
            <div className="brand-info">
              <div className="brand-name">CIOs <span>Camera</span></div>
              <div className="brand-tagline">Security & Smart Solutions</div>
            </div>
          </Link>

          <nav className="nav-menu">
            <Link href="/" className="nav-item-link">
              <i className="fas fa-home"></i> Trang chủ
            </Link>
            <Link href="/projects" className="nav-item-link">
              <i className="fas fa-tools"></i> Dự án
            </Link>
            <Link href="/contact" className="nav-item-link">
              <i className="fas fa-headset"></i> Liên hệ
            </Link>
            <Link href="/notifications" className="nav-item-link active" style={{ position: 'relative' }}>
              <i className="fas fa-bell"></i>
              <NotifBadge />
            </Link>
            <Link href="/cart" className="nav-item-link" style={{ position: 'relative' }}>
              <i className="fas fa-shopping-cart"></i> Giỏ hàng
              {totalItems > 0 && <span className="nav-badge-pill">{totalItems}</span>}
            </Link>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '6px' }}>
                <Link href={String(user.role) === "1" ? "/admin" : "/profile"} className="header-user-btn">
                  <div className="header-user-avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="header-user-text">
                    <span className="header-user-name">{user.username}</span>
                    <span className="header-user-role">{String(user.role) === "1" ? "Quản trị viên" : "Khách hàng"}</span>
                  </div>
                </Link>
                <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px' }} title="Đăng xuất">
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '6px' }}>
                <Link href="/login" className="nav-item-link">Đăng nhập</Link>
                <Link href="/register" className="nav-item-link highlight">Đăng ký</Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ maxWidth: '800px', width: '95%', margin: '40px auto', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '24px', color: '#0c4a6e', fontWeight: '900', margin: 0 }}><i className="fas fa-bell" style={{ color: '#0284c7' }}></i> THÔNG BÁO CỦA BẠN</h1>
        </div>

        {/* NẾU CHƯA ĐĂNG NHẬP */}
        {!user && !isLoading && (
          <div style={{ background: 'rgba(240, 249, 255, 0.8)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', padding: '60px 20px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 8px 30px rgba(2, 132, 199, 0.1)', border: '1px solid rgba(186, 230, 253, 0.75)' }}>
            <i className="fas fa-user-lock" style={{ fontSize: '60px', color: '#7dd3fc', marginBottom: '20px' }}></i>
            <h2 style={{ fontSize: '20px', color: '#0c4a6e', marginBottom: '10px' }}>Vui lòng đăng nhập để xem thông báo</h2>
            <p style={{ color: '#64748b', marginBottom: '25px' }}>Đăng nhập để theo dõi tình trạng đơn hàng và tin nhắn từ quản trị viên.</p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <Link href="/login" style={{ padding: '12px 30px', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: 'white', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', boxShadow: '0 4px 15px rgba(2, 132, 199, 0.35)' }}>Đăng nhập</Link>
              <Link href="/register" style={{ padding: '12px 30px', background: 'rgba(255, 255, 255, 0.8)', color: '#0284c7', border: '1px solid #0284c7', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none' }}>Đăng ký</Link>
            </div>
          </div>
        )}

        {/* ĐANG TẢI DỮ LIỆU */}
        {user && isLoading && (
           <div style={{ textAlign: 'center', padding: '50px', color: '#0369a1', fontWeight: 'bold' }}>Đang tải thông báo...</div>
        )}

        {/* NẾU ĐÃ ĐĂNG NHẬP & CÓ DỮ LIỆU */}
        {user && !isLoading && notifications.length > 0 && (
          <div style={{ background: 'rgba(240, 249, 255, 0.8)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderRadius: '16px', boxShadow: '0 8px 30px rgba(2, 132, 199, 0.1)', border: '1px solid rgba(186, 230, 253, 0.75)', overflow: 'hidden' }}>
            {notifications.map((notif, index) => (
              <Link key={notif.id} href={notif.link} style={{ display: 'flex', padding: '20px', borderBottom: index !== notifications.length - 1 ? '1px solid rgba(186, 230, 253, 0.5)' : 'none', textDecoration: 'none', transition: '0.2s', background: 'rgba(255, 255, 255, 0.4)' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(224, 242, 254, 0.8)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)'}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: `${notif.color}15`, color: notif.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0, marginRight: '20px' }}>
                  <i className={notif.icon}></i>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <h4 style={{ margin: 0, fontSize: '15px', color: '#0c4a6e', fontWeight: 'bold' }}>{notif.title}</h4>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {new Date(notif.date).toLocaleDateString('vi-VN')} {new Date(notif.date).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: '1.5' }}>{notif.message}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* NẾU KHÔNG CÓ THÔNG BÁO NÀO */}
        {user && !isLoading && notifications.length === 0 && (
          <div style={{ background: 'rgba(240, 249, 255, 0.8)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', padding: '60px 20px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 8px 30px rgba(2, 132, 199, 0.1)', border: '1px solid rgba(186, 230, 253, 0.75)' }}>
            <i className="far fa-bell-slash" style={{ fontSize: '60px', color: '#7dd3fc', marginBottom: '20px' }}></i>
            <h2 style={{ fontSize: '18px', color: '#0369a1' }}>Bạn chưa có thông báo nào</h2>
          </div>
        )}
      </main>

      {/* FLOATING SPEED DIAL */}
      <FloatingActions />

      {/* FOOTER */}
      <Footer />
    </div>
  );
}