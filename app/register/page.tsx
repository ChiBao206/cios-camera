"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullname: '', username: '', phone: '', email: '', password: '', confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu nhập lại không khớp!");
      return;
    }

    // Tự động xóa khoảng trắng dư thừa
    const inputUser = formData.username.trim();
    const inputEmail = formData.email.trim();

    setIsSubmitting(true);

    try {
      // 1. KÉO DỮ LIỆU TỪ MONGODB ĐỂ KIỂM TRA TRÙNG LẶP (Thay cho db.json)
      const resUsers = await fetch('/api/users');
      if (!resUsers.ok) {
        alert("Lỗi kết nối máy chủ. Vui lòng thử lại sau!");
        setIsSubmitting(false);
        return;
      }
      const dbUsers = await resUsers.json();

      const existInDB = dbUsers.find(
        (u: any) => u.username === inputUser || u.email === inputEmail
      );

      // Báo lỗi nếu trùng username hoặc email
      if (existInDB) {
        alert("Tên đăng nhập hoặc Email đã được sử dụng trên hệ thống!");
        setIsSubmitting(false);
        return;
      }

      // 2. TẠO USER MỚI NẾU KHÔNG BỊ TRÙNG
      const newUser = {
        username: inputUser,
        email: inputEmail,
        phone: formData.phone,
        password: formData.password,
        role: "0" // 0 là khách hàng bình thường
      };

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (res.ok) {
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        router.push('/login');
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Đăng ký thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error);
      alert("Đã xảy ra lỗi mạng, vui lòng thử lại sau.");
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px'
    }}>
      <div style={{ 
        background: 'rgba(240, 249, 255, 0.82)', 
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: '40px', 
        borderRadius: '16px', 
        boxShadow: '0 20px 50px rgba(2, 132, 199, 0.25)', 
        border: '1px solid rgba(186, 230, 253, 0.85)', 
        width: '100%', 
        maxWidth: '600px' 
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0c4a6e', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            <span>🚀</span> TẠO TÀI KHOẢN MỚI
          </h2>
          <p style={{ color: '#0369a1', fontSize: '14px', fontWeight: '600' }}>Trở thành thành viên của CIOs - impossible is nothing ngay hôm nay</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#0c4a6e', fontWeight: '700' }}>Họ và tên</label>
            <input type="text" placeholder="Nhập họ tên..." required onChange={e => setFormData({...formData, fullname: e.target.value})} style={{ width: '100%', padding: '12px 15px', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'rgba(255, 255, 255, 0.85)' }} />
          </div>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#0c4a6e', fontWeight: '700' }}>Tên đăng nhập</label>
              <input type="text" placeholder="VD: user123" required onChange={e => setFormData({...formData, username: e.target.value})} style={{ width: '100%', padding: '12px 15px', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'rgba(255, 255, 255, 0.85)' }} />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#0c4a6e', fontWeight: '700' }}>Số điện thoại</label>
              <input type="tel" placeholder="09xxxx..." required onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '12px 15px', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'rgba(255, 255, 255, 0.85)' }} />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#0c4a6e', fontWeight: '700' }}>Email</label>
            <input type="email" placeholder="email@gmail.com" required onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '12px 15px', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'rgba(255, 255, 255, 0.85)' }} />
          </div>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#0c4a6e', fontWeight: '700' }}>Mật khẩu</label>
              <input type="password" placeholder="***" required onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '12px 15px', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'rgba(255, 255, 255, 0.85)' }} />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#0c4a6e', fontWeight: '700' }}>Nhập lại mật khẩu</label>
              <input type="password" required onChange={e => setFormData({...formData, confirmPassword: e.target.value})} style={{ width: '100%', padding: '12px 15px', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'rgba(255, 255, 255, 0.85)' }} />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '14px', background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #0284c7, #0369a1)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '800', cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: '0.2s', boxShadow: '0 4px 15px rgba(2, 132, 199, 0.35)' }}>
            {isSubmitting ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ NGAY'}
          </button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#0369a1', marginBottom: '12px' }}>
            Đã có tài khoản? <Link href="/login" style={{ color: '#0284c7', fontWeight: '700', textDecoration: 'none' }}>Đăng nhập ngay</Link>
          </p>
          <Link href="/" style={{ color: '#64748b', fontSize: '12px', textDecoration: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <i className="fas fa-arrow-left"></i> Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}