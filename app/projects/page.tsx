"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NotifBadge from '@/app/components/NotifBadge';
import { useCart } from '@/app/context/CartContext';
import { useRouter } from 'next/navigation';
import Footer from '@/app/components/Footer';
import FloatingActions from '@/app/components/FloatingActions';

// COMPONENT SLIDER ẢNH CHO TỪNG DỰ ÁN
const ProjectSlider = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const displayImages = images && images.length > 0 ? images : ["https://placehold.co/800x400?text=Chua+Co+Anh+Du+An"];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % displayImages.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? displayImages.length - 1 : prevIndex - 1));
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '400px', borderRadius: '12px', overflow: 'hidden', background: '#e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <img 
        src={displayImages[currentIndex]} 
        alt="Hình ảnh dự án" 
        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.3s' }} 
        onError={(e) => { e.currentTarget.src = "https://placehold.co/800x400?text=Loi+Anh" }}
      />
      
      {displayImages.length > 1 && (
        <>
          <button onClick={prevSlide} style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', background: 'rgba(15, 23, 42, 0.7)', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <button onClick={nextSlide} style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', background: 'rgba(15, 23, 42, 0.7)', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}>
            <i className="fas fa-chevron-right"></i>
          </button>
          <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
            {displayImages.map((_, idx) => (
              <div key={idx} style={{ width: '10px', height: '10px', borderRadius: '50%', background: currentIndex === idx ? '#3b82f6' : 'rgba(15, 23, 42, 0.4)', transition: '0.3s' }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function ProjectsPage() {
  const router = useRouter();
  const { totalItems } = useCart();
  const [user, setUser] = useState<any>(null);
  const [projectsData, setProjectsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("currentUser");
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }

    fetch(`/api/projects?t=${new Date().getTime()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setProjectsData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Lỗi lấy dữ liệu dự án:", err);
        setIsLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('camera_bn_cart'); 
    localStorage.removeItem('currentUser'); 
    window.location.href = '/'; 
  };

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", display: 'flex', flexDirection: 'column' }}>
      
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
            <Link href="/projects" className="nav-item-link active">
              <i className="fas fa-tools"></i> Dự án
            </Link>
            <Link href="/contact" className="nav-item-link">
              <i className="fas fa-headset"></i> Liên hệ
            </Link>
            <Link href="/notifications" className="nav-item-link" style={{ position: 'relative' }}>
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

      {/* 2. BANNER */}
      <div style={{ background: 'linear-gradient(135deg, rgba(12, 74, 110, 0.9), rgba(3, 105, 161, 0.92)), url("https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2000")', backgroundSize: 'cover', backgroundPosition: 'center', padding: '70px 20px', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '34px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '12px' }}>Dự Án Đã Thi Công</h1>
        <p style={{ fontSize: '15px', color: '#bae6fd', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>Tự hào là đối tác triển khai hệ thống an ninh giám sát và mạng hạ tầng cho hàng trăm doanh nghiệp, cơ quan và gia đình.</p>
      </div>

      {/* 2.5 VIDEO */}
      <div style={{ maxWidth: '1000px', margin: '50px auto 0', padding: '0 20px' }}>
        <div style={{ background: 'rgba(240, 249, 255, 0.78)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', padding: '25px', borderRadius: '16px', boxShadow: '0 8px 30px rgba(2, 132, 199, 0.1)', border: '1px solid rgba(186, 230, 253, 0.75)', textAlign: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0c4a6e', marginBottom: '20px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <i className="fas fa-play-circle" style={{ color: '#0284c7', fontSize: '24px' }}></i>
            Video Giới Thiệu Công Ty
          </h2>
          <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
            <video 
              src="/uploads/video-cong-ty.mp4" 
              controls autoPlay muted loop playsInline
              style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', display: 'block' }}
            >
              Trình duyệt của bạn không hỗ trợ xem video.
            </video>
          </div>
        </div>
      </div>

      {/* 3. DANH SÁCH DỰ ÁN */}
      <div style={{ maxWidth: '1000px', margin: '40px auto 50px', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '60px', flex: 1 }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#0369a1', fontWeight: 'bold' }}>Đang tải dữ liệu dự án...</div>
        ) : projectsData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>Chưa có dự án nào được đăng tải.</div>
        ) : (
          projectsData.map((project, index) => (
            <div key={project._id} style={{ background: 'rgba(240, 249, 255, 0.78)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(2, 132, 199, 0.1)', border: '1px solid rgba(186, 230, 253, 0.75)', display: 'flex', flexDirection: index % 2 === 0 ? 'row' : 'row-reverse', flexWrap: 'wrap' }}>
              
              <div style={{ flex: 1, minWidth: '350px', padding: '20px' }}>
                <ProjectSlider images={project.images} />
              </div>

              <div style={{ flex: 1, minWidth: '350px', padding: '40px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ color: '#0284c7', fontWeight: 'bold', fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Dự án nổi bật</span>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0c4a6e', marginBottom: '15px', lineHeight: '1.3' }}>{project.title}</h2>
                <p style={{ color: '#334155', fontSize: '15px', marginBottom: '20px', lineHeight: '1.6' }}>{project.description}</p>
                
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {project.details?.map((detail: string, idx: number) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: '#1e293b', lineHeight: '1.5' }}>
                      <i className="fas fa-check-circle" style={{ color: '#0284c7', marginTop: '3px' }}></i>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. FLOATING BUTTONS */}
      <FloatingActions />

      {/* 5. FOOTER */}
      <Footer />
    </div>
  );
}