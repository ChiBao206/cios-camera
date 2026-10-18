"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./context/CartContext";
import NotifBadge from "@/app/components/NotifBadge";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import FloatingActions from "@/app/components/FloatingActions";
import db from "../db.json";

export default function Home() {
  const router = useRouter(); 
  const { addToCart, totalItems } = useCart();
  
  // 1. STATE LƯU DỮ LIỆU
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>(db.products || []);
  const [categories, setCategories] = useState<any[]>(db.categories || []);
  const [isLoading, setIsLoading] = useState(false);
  
  // POPUP & SALE ĐỘNG TỪ ADMIN
  const [showSalePopup, setShowSalePopup] = useState(false);
  const [isSaleDay, setIsSaleDay] = useState(false);
  const [saleDayText, setSaleDayText] = useState("");
  const [saleDiscount, setSaleDiscount] = useState(0); 

  // VOUCHERS
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [savedVouchers, setSavedVouchers] = useState<string[]>([]);
  const [usedVouchers, setUsedVouchers] = useState<string[]>([]);

  // FAVORITES
  const [favIds, setFavIds] = useState<string[]>([]);

  // BỘ LỌC & PHÂN TRANG
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8; 
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minPrice, setMinPrice] = useState(0); 
  const [maxPrice, setMaxPrice] = useState(5000000); 
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 2. TỰ ĐỘNG GỌI API ĐỒNG BỘ DỮ LIỆU
  useEffect(() => {
    const loggedInUser = localStorage.getItem("currentUser");
    
    let currentUsername = "";
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      currentUsername = parsedUser.username;
      
      const localSavedVouchers = localStorage.getItem(`camera_bn_my_vouchers_${currentUsername}`);
      if(localSavedVouchers) setSavedVouchers(JSON.parse(localSavedVouchers));

      const localUsedVouchers = localStorage.getItem(`camera_bn_used_vouchers_${currentUsername}`);
      if(localUsedVouchers) setUsedVouchers(JSON.parse(localUsedVouchers));
    }

    const localFavs = localStorage.getItem('camera_bn_favs');
    if (localFavs) {
      const parsedFavs = JSON.parse(localFavs);
      setFavIds(parsedFavs.map((f: any) => String(f._id || f.id)));
    }

    const fetchRealData = async () => {
      try {
        const [prodRes, catRes, setRes, vouRes] = await Promise.all([
          fetch(`/api/products`).catch(() => null),
          fetch(`/api/categories`).catch(() => null),
          fetch(`/api/settings`).catch(() => null),
          fetch(`/api/vouchers`).catch(() => null)
        ]);
        
        if (prodRes && prodRes.ok) {
          const pData = await prodRes.json();
          if (Array.isArray(pData) && pData.length > 0) {
            setProducts(pData);
          }
        }

        if (catRes && catRes.ok) {
          const cData = await catRes.json();
          if (Array.isArray(cData) && cData.length > 0) {
            setCategories(cData);
          }
        }
        
        if (vouRes && vouRes.ok) {
          const vData = await vouRes.json();
          if (Array.isArray(vData)) {
            const validVouchers = vData.filter((v: any) => 
              v.isActive && 
              v.usedCount < v.maxUsage && 
              new Date(v.expireDate) >= new Date()
            );
            setVouchers(validVouchers);
          }
        }
        
        if (setRes && setRes.ok) {
          const sData = await setRes.json();
          if (sData) {
            setSaleDiscount(Number(sData.saleDiscount) || 0);
            
            const currentDay = new Date().getDate();
            const daysArray = (sData.saleDays || "").split(',').map((d: string) => parseInt(d.trim()));
            
            if (daysArray.includes(currentDay)) {
              setIsSaleDay(true);
              setShowSalePopup(true);
              setSaleDayText(currentDay.toString());
            }
          }
        }

      } catch (error) {
        console.error("Lỗi tải dữ liệu", error);
      }
    };

    fetchRealData();
  }, []);

  const handleSaveVoucher = (code: string) => {
    if (!user) {
      alert("Vui lòng đăng nhập để lưu mã giảm giá nhé!");
      router.push('/login');
      return;
    }

    if (!savedVouchers.includes(code)) {
      const newSavedList = [...savedVouchers, code];
      setSavedVouchers(newSavedList);
      localStorage.setItem(`camera_bn_my_vouchers_${user.username}`, JSON.stringify(newSavedList));
      alert(`🎉 Đã lưu mã ${code} vào ví Voucher của bạn! Hãy vào Giỏ hàng để sử dụng nhé.`);
    }
  };

  const handleClosePopup = () => {
    setShowSalePopup(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser'); 
    window.location.href = '/'; 
  };

  const toggleFavorite = (productData: any) => {
    if (!user) {
      alert("Vui lòng đăng nhập để lưu sản phẩm yêu thích nhé!");
      router.push('/login');
      return;
    }
    
    const productId = String(productData._id || productData.id);
    const saved = localStorage.getItem('camera_bn_favs');
    let favList = saved ? JSON.parse(saved) : [];
    
    const existsIndex = favList.findIndex((item: any) => String(item._id || item.id) === productId);
    
    if (existsIndex === -1) {
      favList.push(productData);
      setFavIds([...favIds, productId]);
      localStorage.setItem('camera_bn_favs', JSON.stringify(favList));
    } else { 
      favList.splice(existsIndex, 1);
      setFavIds(favIds.filter(id => id !== productId));
      localStorage.setItem('camera_bn_favs', JSON.stringify(favList));
    }
  };

  // CHIA SẢN PHẨM: Lấy top bán chạy theo đúng số lượng đã bán thực tế từ MongoDB
  const hotProducts = [...products]
    .sort((a, b) => (Number(b.sold) || 0) - (Number(a.sold) || 0))
    .slice(0, 4);
  const baseProducts = products;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, minPrice, maxPrice, searchTerm]);

  const filteredProducts = baseProducts.filter(product => {
    const matchCat = selectedCategory === "all" || String(product.category_id) === String(selectedCategory);
    const matchPrice = Number(product.price) >= minPrice && Number(product.price) <= maxPrice;
    const matchSearch = (product.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchPrice && matchSearch;
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage) || 1;

  const handlePrev = () => {
    setCurrentPage(currentPage === 1 ? totalPages : currentPage - 1);
  };
  
  const handleNext = () => {
    setCurrentPage(currentPage === totalPages ? 1 : currentPage + 1);
  };

  const scrollToProducts = () => {
    const elem = document.getElementById('products-section');
    if (elem) {
      const yOffset = -90;
      const y = elem.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    scrollToProducts();
  };

  return (
    <>
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

      {/* POPUP SALE ĐỘNG */}
      {showSalePopup && saleDiscount > 0 && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(12, 74, 110, 0.75)', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: '#ffffff', width: '480px', maxWidth: '92%', borderRadius: '20px', overflow: 'hidden', position: 'relative', boxShadow: '0 25px 60px -15px rgba(2, 132, 199, 0.4)', border: '1px solid #bae6fd', animation: 'popIn 0.4s ease-out' }}>
            <button onClick={handleClosePopup} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.25)', color: 'white', border: 'none', width: '36px', height: '36px', borderRadius: '50%', fontSize: '16px', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-times"></i>
            </button>

            <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', padding: '35px 20px', textAlign: 'center', color: 'white' }}>
              <div style={{ display: 'inline-block', background: '#facc15', color: '#854d0e', padding: '4px 14px', borderRadius: '20px', fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', marginBottom: '10px' }}>
                Duy nhất ngày {saleDayText} hàng tháng
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>Ngày Vàng Săn Deal</h2>
            </div>

            <div style={{ padding: '30px 25px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '20px', color: '#0369a1', margin: '0 0 10px 0', fontWeight: '800' }}>
                Giảm Ngay <span style={{ color: '#0284c7', fontSize: '36px', fontWeight: '900' }}>{saleDiscount}%</span>
              </h3>
              <p style={{ color: '#475569', fontSize: '14.5px', lineHeight: '1.6', marginBottom: '25px' }}>
                Cơ hội sở hữu camera an ninh thông minh AI với mức giá cực sốc! Giảm trực tiếp {saleDiscount}% cho toàn bộ đơn hàng thanh toán hôm nay.
              </p>
              <button 
                onClick={handleClosePopup}
                className="btn-card-action"
                style={{ width: '100%', padding: '14px', fontSize: '15px' }}
              >
                MUA SẮM NGAY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. STICKY MODERN HEADER */}
      <Header user={user} activePage="home" onLogout={handleLogout} />

      {/* MOBILE SEARCH BAR - chỉ hiện trên mobile thay thế header search */}
      <div className="mobile-search-bar">
        <i className="fas fa-search" style={{ color: '#0284c7', marginRight: '8px' }}></i>
        <input 
          type="text" 
          placeholder="Tìm camera, thiết bị an ninh..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              scrollToProducts();
            }
          }}
        />
        <button type="button" onClick={scrollToProducts}>
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>

      {/* 2. MODERN HERO BANNER */}
      <section className="modern-hero">
        <div className="hero-grid">
          <div>
            <div className="hero-badge-pill">
              <i className="fas fa-shield-virus"></i> CÔNG NGHỆ CAMERA AI 4.0 TIÊN TIẾN
            </div>
            <h1 className="hero-title">
              Giải Pháp An Ninh & Giám Sát Toàn Diện Cho Ngôi Nhà
            </h1>
            <p className="hero-desc">
              CIOs Security mang đến hệ sinh thái camera thông minh độ nét 4K Ultra HD, phát hiện chuyển động bằng AI và đàm thoại 2 chiều theo thời gian thực.
            </p>
            <div className="hero-actions">
              <button 
                className="btn-hero-primary"
                onClick={() => router.push('/contact')}
              >
                <i className="fas fa-phone-alt"></i> Nhận Tư Vấn Miễn Phí
              </button>
              <button 
                className="btn-hero-secondary"
                onClick={() => {
                  const elem = document.getElementById('products-section');
                  if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <i className="fas fa-shopping-bag"></i> Khám Phá Sản Phẩm
              </button>
            </div>
          </div>

          <div className="hero-visual-card">
            <div className="hero-feature-pill">
              <div className="hero-feature-icon">
                <i className="fas fa-eye"></i>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '15px' }}>Độ Phân Giải 4K Ultra HD</strong>
                <span style={{ fontSize: '12.5px', color: '#e0f2fe' }}>Ghi hình sắc nét cả ngày lẫn đêm có màu</span>
              </div>
            </div>

            <div className="hero-feature-pill">
              <div className="hero-feature-icon">
                <i className="fas fa-brain"></i>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '15px' }}>Nhận Diện Chuyển Động AI</strong>
                <span style={{ fontSize: '12.5px', color: '#e0f2fe' }}>Báo động chuẩn xác qua Smartphone tức thì</span>
              </div>
            </div>

            <div className="hero-feature-pill">
              <div className="hero-feature-icon">
                <i className="fas fa-cloud-upload-alt"></i>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '15px' }}>Lưu Trữ Đám Mây & Thẻ Nhớ</strong>
                <span style={{ fontSize: '12.5px', color: '#e0f2fe' }}>Bảo mật dữ liệu chuẩn mã hóa ngân hàng</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THANH CAM KẾT (TRUST FEATURES BAR) */}
      <div className="trust-bar">
        <div className="trust-grid">
          <div className="trust-item">
            <div className="trust-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <div className="trust-content">
              <strong>Chính Hãng 100%</strong>
              <span>Bảo hành 24 tháng 1 đổi 1</span>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon">
              <i className="fas fa-shipping-fast"></i>
            </div>
            <div className="trust-content">
              <strong>Lắp Đặt Hỏa Tốc</strong>
              <span>Có mặt trong 2 giờ tại HCM</span>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon">
              <i className="fas fa-sync-alt"></i>
            </div>
            <div className="trust-content">
              <strong>Đổi Mới 30 Ngày</strong>
              <span>Nếu phát sinh lỗi từ nhà sản xuất</span>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon">
              <i className="fas fa-headset"></i>
            </div>
            <div className="trust-content">
              <strong>Hỗ Trợ 24/7</strong>
              <span>Kỹ thuật viên đồng hành trọn đời</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MAIN LAYOUT (SIDEBAR + PRODUCT GRID) */}
      <div className="main-wrapper" id="products-section">
        {/* SIDEBAR CỘT TRÁI */}
        <aside className="sidebar-col">
          {/* Box Danh Mục */}
          <div className="sidebar-box-clean">
            <div className="sidebar-title">
              <i className="fas fa-th-large"></i> Danh Mục Thiết Bị
            </div>
            <div className="category-nav-list">
              <div 
                className={`category-nav-item ${selectedCategory === "all" ? "active" : ""}`}
                onClick={() => setSelectedCategory("all")}
              >
                <span>Tất cả sản phẩm</span>
                <i className="fas fa-chevron-right" style={{ fontSize: '11px' }}></i>
              </div>
              {categories.map((cat) => (
                <div 
                  key={cat.id || cat._id}
                  className={`category-nav-item ${selectedCategory === String(cat.id || cat._id) ? "active" : ""}`}
                  onClick={() => setSelectedCategory(String(cat.id || cat._id))}
                >
                  <span>{cat.name}</span>
                  <i className="fas fa-chevron-right" style={{ fontSize: '11px' }}></i>
                </div>
              ))}
            </div>
          </div>

          {/* Box Lọc Khoảng Giá */}
          <div className="sidebar-box-clean">
            <div className="sidebar-title">
              <i className="fas fa-sliders-h"></i> Khoảng Giá
            </div>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="range"
                min="0"
                max="5000000"
                step="100000"
                value={maxPrice}
                onChange={(e) => {
                  setMinPrice(0);
                  setMaxPrice(Number(e.target.value));
                }}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#0284c7' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginTop: '6px', color: '#0369a1', fontWeight: '700' }}>
                <span>0 đ</span>
                <span>Dưới {maxPrice.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            <div className="price-chip-grid">
              <div 
                className={`price-chip ${minPrice === 0 && maxPrice === 500000 ? "active" : ""}`}
                onClick={() => { setMinPrice(0); setMaxPrice(500000); }}
              >
                <span>Dưới 500.000đ</span>
                <i className="fas fa-check" style={{ display: minPrice === 0 && maxPrice === 500000 ? 'block' : 'none' }}></i>
              </div>

              <div 
                className={`price-chip ${minPrice === 500000 && maxPrice === 1000000 ? "active" : ""}`}
                onClick={() => { setMinPrice(500000); setMaxPrice(1000000); }}
              >
                <span>500.000đ - 1.000.000đ</span>
                <i className="fas fa-check" style={{ display: minPrice === 500000 && maxPrice === 1000000 ? 'block' : 'none' }}></i>
              </div>

              <div 
                className={`price-chip ${minPrice === 1000000 && maxPrice === 3000000 ? "active" : ""}`}
                onClick={() => { setMinPrice(1000000); setMaxPrice(3000000); }}
              >
                <span>1.000.000đ - 3.000.000đ</span>
                <i className="fas fa-check" style={{ display: minPrice === 1000000 && maxPrice === 3000000 ? 'block' : 'none' }}></i>
              </div>

              <div 
                className={`price-chip ${minPrice === 3000000 && maxPrice === 50000000 ? "active" : ""}`}
                onClick={() => { setMinPrice(3000000); setMaxPrice(50000000); }}
              >
                <span>Trên 3.000.000đ</span>
                <i className="fas fa-check" style={{ display: minPrice === 3000000 && maxPrice === 50000000 ? 'block' : 'none' }}></i>
              </div>

              {(minPrice !== 0 || maxPrice !== 5000000) && (
                <button 
                  onClick={() => { setMinPrice(0); setMaxPrice(5000000); }}
                  style={{ background: 'transparent', border: 'none', color: '#0284c7', fontSize: '13px', fontWeight: '700', cursor: 'pointer', marginTop: '6px', textAlign: 'center' }}
                >
                  <i className="fas fa-times-circle"></i> Đặt lại bộ lọc giá
                </button>
              )}
            </div>
          </div>

          {/* Box Hotline Hỗ Trợ */}
          <div className="sidebar-box-clean" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)', border: '1.5px solid #bae6fd' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#0284c7', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                <i className="fas fa-headset"></i>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '14px', color: '#0c4a6e' }}>Cần Tư Vấn Nhanh?</strong>
                <span style={{ fontSize: '12px', color: '#0369a1' }}>Tư vấn kỹ thuật 24/7</span>
              </div>
            </div>
            <a 
              href="tel:0971024173" 
              style={{ display: 'block', textAlign: 'center', padding: '10px', background: '#0284c7', color: 'white', borderRadius: '8px', fontWeight: '800', fontSize: '14px', textDecoration: 'none', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}
            >
              <i className="fas fa-phone-alt"></i> 0971.024.173
            </a>
          </div>
        </aside>

        {/* NỘI DUNG CHÍNH (MAIN CONTENT) */}
        <main className="content-col">
          {/* KHU VỰC VOUCHERS */}
          {vouchers.length > 0 && (
            <div style={{ marginBottom: '35px' }}>
              <div className="section-header-modern">
                <div className="section-title-modern">
                  <span className="title-accent"></span>
                  Mã Giảm Giá Dành Cho Bạn
                </div>
              </div>
              <div className="vouchers-row">
                {vouchers.map((v) => {
                  const isSaved = savedVouchers.includes(v.code);
                  const isUsed = usedVouchers.includes(v.code);
                  return (
                    <div className="voucher-card-pro" key={v._id || v.id}>
                      <div className="voucher-card-left">
                        <span className="discount">{v.discountPercent}%</span>
                        <span className="label">Giảm giá</span>
                      </div>
                      <div className="voucher-card-right">
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#0369a1', marginBottom: '2px' }}>
                            Mã: <span style={{ color: '#0284c7' }}>{v.code}</span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            Đơn tối thiểu {Number(v.minOrderValue).toLocaleString('vi-VN')}đ
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                            HSD: {new Date(v.expireDate).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                          <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700' }}>
                            Còn {v.maxUsage - v.usedCount} lượt
                          </span>
                          <button 
                            disabled={isSaved || isUsed}
                            onClick={() => handleSaveVoucher(v.code)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              background: isSaved || isUsed ? '#cbd5e1' : '#0284c7',
                              color: isSaved || isUsed ? '#64748b' : 'white',
                              fontWeight: '700',
                              fontSize: '11.5px',
                              cursor: isSaved || isUsed ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {isUsed ? 'Đã dùng' : (isSaved ? 'Đã lưu' : 'Lưu mã')}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SẢN PHẨM BÁN CHẠY NHẤT (HOT) */}
          <div style={{ marginBottom: '40px' }}>
            <div className="section-header-modern">
              <div className="section-title-modern">
                <span className="title-accent"></span>
                Top Bán Chạy Nhất
              </div>
              <span style={{ fontSize: '13px', color: '#0284c7', fontWeight: '700' }}>
                <i className="fas fa-fire" style={{ color: '#f43f5e' }}></i> Đang được ưa chuộng
              </span>
            </div>

            <div className="products-grid-modern">
              {hotProducts.map((product) => (
                <div className="product-card-modern" key={product.id || product._id}>
                  <div className="card-badge-tag">TOP BÁN CHẠY</div>
                  
                  <div 
                    className={`card-fav-btn ${favIds.includes(String(product.id || product._id)) ? 'active' : ''}`}
                    onClick={() => toggleFavorite(product)}
                    title="Lưu vào yêu thích"
                  >
                    <i className="fas fa-heart"></i>
                  </div>

                  <div className="card-img-wrapper">
                    <Link href={`/product/${product.id || product._id}`}>
                      <img src={product.image} alt={product.name} />
                    </Link>
                  </div>

                  <div className="card-info-content">
                    <Link href={`/product/${product.id || product._id}`}>
                      <h3 className="card-product-title">{product.name}</h3>
                    </Link>

                    <div className="card-price-container">
                      {isSaleDay && saleDiscount > 0 ? (
                        <>
                          <span className="current-price">
                            {(Number(product.price) * (1 - saleDiscount / 100)).toLocaleString("vi-VN")} đ
                          </span>
                          <span className="old-price">
                            {Number(product.price).toLocaleString("vi-VN")} đ
                          </span>
                        </>
                      ) : (
                        <span className="current-price">
                          {Number(product.price).toLocaleString("vi-VN")} đ
                        </span>
                      )}
                    </div>

                    <div className="card-stock-label">
                      <i className="fas fa-check-circle"></i> Sẵn hàng: {product.quantity} sản phẩm
                    </div>

                    {Number(product.quantity) > 0 ? (
                      <button 
                        className="btn-card-action"
                        onClick={() => {
                          if (!user) {
                            alert("Vui lòng đăng nhập để mua hàng!");
                            router.push('/login');
                          } else {
                            addToCart(product);
                            router.push('/cart');
                          }
                        }}
                      >
                        <i className="fas fa-bolt"></i> Mua Ngay
                      </button>
                    ) : (
                      <button className="btn-card-action" disabled>
                        Tạm hết hàng
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TẤT CẢ SẢN PHẨM */}
          <div>
            <div className="section-header-modern">
              <div className="section-title-modern">
                <span className="title-accent"></span>
                Tất Cả Sản Phẩm
              </div>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                Hiển thị {filteredProducts.length} sản phẩm
              </span>
            </div>

            {currentProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '16px', border: '1px solid #bae6fd' }}>
                <i className="fas fa-search" style={{ fontSize: '48px', color: '#bae6fd', marginBottom: '16px' }}></i>
                <h3 style={{ color: '#0c4a6e', marginBottom: '8px' }}>Không tìm thấy sản phẩm phù hợp</h3>
                <p style={{ color: '#64748b', fontSize: '14px' }}>Hãy thử điều chỉnh từ khóa tìm kiếm hoặc mức giá</p>
              </div>
            ) : (
              <div className="products-grid-modern">
                {currentProducts.map((product) => (
                  <div className="product-card-modern" key={product.id || product._id}>
                    {isSaleDay && saleDiscount > 0 && (
                      <div className="card-badge-discount">-{saleDiscount}%</div>
                    )}

                    <div 
                      className={`card-fav-btn ${favIds.includes(String(product.id || product._id)) ? 'active' : ''}`}
                      onClick={() => toggleFavorite(product)}
                      title="Lưu vào yêu thích"
                    >
                      <i className="fas fa-heart"></i>
                    </div>

                    <div className="card-img-wrapper">
                      <Link href={`/product/${product.id || product._id}`}>
                        <img src={product.image} alt={product.name} />
                      </Link>
                    </div>

                    <div className="card-info-content">
                      <Link href={`/product/${product.id || product._id}`}>
                        <h3 className="card-product-title">{product.name}</h3>
                      </Link>

                      <div className="card-price-container">
                        {isSaleDay && saleDiscount > 0 ? (
                          <>
                            <span className="current-price">
                              {(Number(product.price) * (1 - saleDiscount / 100)).toLocaleString("vi-VN")} đ
                            </span>
                            <span className="old-price">
                              {Number(product.price).toLocaleString("vi-VN")} đ
                            </span>
                          </>
                        ) : (
                          <span className="current-price">
                            {Number(product.price).toLocaleString("vi-VN")} đ
                          </span>
                        )}
                      </div>

                      <div className="card-stock-label">
                        <i className="fas fa-tag"></i> Còn: {product.quantity} cái
                      </div>

                      {Number(product.quantity) > 0 ? (
                        <button 
                          className="btn-card-action"
                          onClick={() => {
                            if (!user) {
                              alert("Vui lòng đăng nhập để thêm vào giỏ hàng!");
                              router.push('/login');
                            } else {
                              addToCart(product);
                            }
                          }}
                        >
                          <i className="fas fa-cart-plus"></i> Thêm Vào Giỏ
                        </button>
                      ) : (
                        <button className="btn-card-action" disabled>
                          Tạm hết hàng
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PHÂN TRANG */}
            {totalPages > 1 && (
              <div className="pagination-wrapper">
                <button 
                  className="page-btn-pro" 
                  onClick={handlePrev}
                  title="Trang trước"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    className={`page-btn-pro ${currentPage === number ? "active" : ""}`}
                    onClick={() => setCurrentPage(number)}
                  >
                    {number}
                  </button>
                ))}

                <button 
                  className="page-btn-pro" 
                  onClick={handleNext}
                  title="Trang tiếp"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 5. FLOATING SPEED DIAL */}
      <FloatingActions />

      {/* 6. SITE FOOTER */}
      <Footer />
    </>
  );
}