"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import NotifBadge from '../components/NotifBadge';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingActions from '../components/FloatingActions';

export default function ContactPage() {
  const { totalItems } = useCart();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', issue: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      setFormData({ name: parsedUser.username || '', phone: parsedUser.phone || '', issue: '' });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('camera_bn_cart'); 
    localStorage.removeItem('currentUser'); 
    window.location.href = '/'; 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.issue) return alert("Vui lòng điền đủ thông tin!");
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/supports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer: formData.name, phone: formData.phone, issue: formData.issue, status: 'Chưa trả lời' })
      });
      if (res.ok) {
        alert("Đã gửi yêu cầu liên hệ thành công! Quản trị viên sẽ phản hồi sớm nhất.");
        setFormData({ ...formData, issue: '' });
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ!");
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
      <Header user={user} activePage="contact" onLogout={handleLogout} />

      {/* MAIN CONTENT */}
      <main style={{ maxWidth: '1240px', width: '95%', margin: '40px auto 60px', flex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e0f2fe', color: '#0369a1', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', marginBottom: '12px' }}>
            <i className="fas fa-headset"></i> TRUNG TÂM HỖ TRỢ KHÁCH HÀNG
          </div>
          <h1 style={{ fontSize: '34px', color: '#0c4a6e', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '10px' }}>
            Liên Hệ Với Chúng Tôi
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '600px', margin: '0 auto' }}>
            Đội ngũ chuyên viên kỹ thuật của CIOs Camera luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc 24/7.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', alignItems: 'start' }}>
          {/* Box Thông tin liên hệ */}
          <div className="sidebar-box-clean" style={{ padding: '32px' }}>
            <div className="sidebar-title" style={{ fontSize: '18px', marginBottom: '25px' }}>
              <i className="fas fa-store"></i> Thông Tin Cửa Hàng
            </div>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '22px' }}>
              <div style={{ width: '44px', height: '44px', background: '#e0f2fe', color: '#0284c7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '15px', fontWeight: '700' }}>Địa chỉ showroom</h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>12 Trịnh Đình Thảo, P. Hòa Thạnh, Q. Tân Phú, TP. Hồ Chí Minh</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '22px' }}>
              <div style={{ width: '44px', height: '44px', background: '#e0f2fe', color: '#0284c7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                <i className="fas fa-phone-alt"></i>
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '15px', fontWeight: '700' }}>Hotline kỹ thuật & bảo hành</h4>
                <p style={{ margin: 0, color: '#0284c7', fontSize: '18px', fontWeight: '800' }}>0971.024.173</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '25px' }}>
              <div style={{ width: '44px', height: '44px', background: '#e0f2fe', color: '#0284c7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                <i className="fas fa-envelope"></i>
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '15px', fontWeight: '700' }}>Email hỗ trợ</h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>hotro@cios-camera.vn</p>
              </div>
            </div>

            {/* Bản đồ */}
            <div style={{ borderRadius: '12px', overflow: 'hidden', height: '220px', border: '1px solid #bae6fd' }}>
              <iframe src="https://maps.google.com/maps?q=12%20Tr%E1%BB%8Bnh%20%C4%90%C3%ACnh%20Th%E1%BA%A3o%2C%20Ho%C3%A0%20Th%E1%BA%A1nh%2C%20T%C3%A2n%20Ph%C3%BA%2C%20H%E1%BB%93%20Ch%C3%AD%20Minh&t=&z=16&ie=UTF8&iwloc=&output=embed" width="100%" height="100%" style={{ border: 0 }} allowFullScreen={false} loading="lazy"></iframe>
            </div>
          </div>

          {/* Form Gửi yêu cầu */}
          <div className="sidebar-box-clean" style={{ padding: '32px' }}>
            <div className="sidebar-title" style={{ fontSize: '18px', marginBottom: '25px' }}>
              <i className="fas fa-paper-plane"></i> Gửi Tin Nhắn / Yêu Cầu Báo Giá
            </div>
            <form onSubmit={handleSubmit}>
              <div className="contact-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#0c4a6e', fontWeight: '700', marginBottom: '8px' }}>Họ và tên *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nhập tên của bạn" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#0c4a6e', fontWeight: '700', marginBottom: '8px' }}>Số điện thoại *</label>
                  <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Số điện thoại liên hệ" />
                </div>
              </div>
              
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#0c4a6e', fontWeight: '700', marginBottom: '8px' }}>Nội dung cần hỗ trợ *</label>
                <textarea required value={formData.issue} onChange={e => setFormData({...formData, issue: e.target.value})} rows={6} placeholder="Mô tả nhu cầu của bạn (Ví dụ: Tư vấn lắp đặt trọn gói 4 camera ngoài trời cho nhà phố, cấu hình đầu ghi...)" style={{ width: '100%', resize: 'vertical' }}></textarea>
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-card-action" style={{ padding: '14px', fontSize: '15px' }}>
                <i className="fas fa-paper-plane"></i> {isSubmitting ? 'ĐANG GỬI...' : 'GỬI YÊU CẦU NGAY'}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* FLOATING SPEED DIAL */}
      <FloatingActions />

      {/* FOOTER */}
      <Footer />
    </div>
  );
}