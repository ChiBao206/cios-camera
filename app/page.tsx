"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
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

  // BỘ LỌC & PHÂN TRANG (Tự động khôi phục trang và danh mục khi khách từ trang chi tiết quay lại)
  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedPage = sessionStorage.getItem("home_current_page");
        if (savedPage && !isNaN(Number(savedPage)) && Number(savedPage) > 0) {
          return Number(savedPage);
        }
      } catch (e) {}
    }
    return 1;
  });
  const productsPerPage = 8; 
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedCat = sessionStorage.getItem("home_category");
        if (savedCat) return savedCat;
      } catch (e) {}
    }
    return "all";
  });
  const [minPrice, setMinPrice] = useState(0); 
  const [maxPrice, setMaxPrice] = useState(5000000); 
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // DỮ LIỆU THẬT CHO THANH BÊN (SIDEBAR)
  const [recentOrders, setRecentOrders] = useState<any[]>([
    {
      _id: "ord_1",
      customer_name: "Anh Bảo (TP.HCM)",
      status: "Thành công",
      items: [{ name: "Đầu ghi hình Hikvision DS-7204HGHI-K1", image: "/uploads/32.jpg" }]
    },
    {
      _id: "ord_2",
      customer_name: "Chị Hạnh (Hà Nội)",
      status: "Đang giao",
      items: [{ name: "Camera Wifi Kbone H21P", image: "/uploads/96.jpg" }]
    },
    {
      _id: "ord_3",
      customer_name: "Anh Tuấn (Bình Dương)",
      status: "Đã xác nhận",
      items: [{ name: "Camera Wifi Imou Ranger 2 (A22EP)", image: "/uploads/92.jpg" }]
    }
  ]);

  // XỬ LÝ VUỐT / KÉO / CUỘN DANH MỤC TRÊN MỌI THIẾT BỊ
  const categoryNavRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const isDraggingCat = useRef(false);
  const startXCat = useRef(0);
  const scrollLeftCat = useRef(0);
  const hasMovedCat = useRef(false);

  const checkCatScroll = useCallback(() => {
    if (categoryNavRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryNavRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
    }
  }, []);

  useEffect(() => {
    checkCatScroll();
    const t1 = setTimeout(checkCatScroll, 100);
    const t2 = setTimeout(checkCatScroll, 400);
    const t3 = setTimeout(checkCatScroll, 1000);
    const handleResize = () => checkCatScroll();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', handleResize);
    };
  }, [checkCatScroll, categories]);

  useEffect(() => {
    const el = categoryNavRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth > el.clientWidth) {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
          checkCatScroll();
        }
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [checkCatScroll]);

  const handleCatMouseDown = (e: React.MouseEvent) => {
    if (!categoryNavRef.current) return;
    isDraggingCat.current = true;
    hasMovedCat.current = false;
    startXCat.current = e.pageX - categoryNavRef.current.offsetLeft;
    scrollLeftCat.current = categoryNavRef.current.scrollLeft;
  };

  const handleCatMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCat.current || !categoryNavRef.current) return;
    e.preventDefault();
    const x = e.pageX - categoryNavRef.current.offsetLeft;
    const walk = (x - startXCat.current) * 1.5;
    if (Math.abs(walk) > 4) {
      hasMovedCat.current = true;
    }
    categoryNavRef.current.scrollLeft = scrollLeftCat.current - walk;
    checkCatScroll();
  };

  const handleCatMouseUp = () => {
    isDraggingCat.current = false;
    setTimeout(() => {
      hasMovedCat.current = false;
    }, 60);
  };

  // Hỗ trợ vuốt chạm cảm ứng trên điện thoại
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].pageX;
    hasMovedCat.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const delta = Math.abs(e.touches[0].pageX - touchStartX.current);
    if (delta > 6) {
      hasMovedCat.current = true;
    }
    checkCatScroll();
  };

  const handleTouchEnd = () => {
    setTimeout(() => {
      hasMovedCat.current = false;
      checkCatScroll();
    }, 80);
  };

  const scrollCat = (direction: 'left' | 'right') => {
    if (categoryNavRef.current) {
      const scrollStep = Math.max(160, Math.floor(categoryNavRef.current.clientWidth * 0.75));
      const offset = direction === 'left' ? -scrollStep : scrollStep;
      categoryNavRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkCatScroll, 350);
    }
  };

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
        const [prodRes, catRes, setRes, vouRes, ordRes] = await Promise.all([
          fetch(`/api/products`).catch(() => null),
          fetch(`/api/categories`).catch(() => null),
          fetch(`/api/settings`).catch(() => null),
          fetch(`/api/vouchers`).catch(() => null),
          fetch(`/api/orders`).catch(() => null)
        ]);

        if (ordRes && ordRes.ok) {
          const oData = await ordRes.json();
          if (Array.isArray(oData)) {
            const valid = oData
              .filter((o: any) => o.status !== 'Đã hủy' && o.status !== 'cancelled' && Array.isArray(o.items) && o.items.length > 0)
              .slice(0, 3);
            if (valid.length > 0) setRecentOrders(valid);
          }
        }
        
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

  const isFirstFilterRun = useRef(true);

  useEffect(() => {
    if (isFirstFilterRun.current) {
      isFirstFilterRun.current = false;
      return;
    }
    setCurrentPage(1);
    try {
      sessionStorage.setItem("home_current_page", "1");
      sessionStorage.setItem("home_category", String(selectedCategory));
    } catch (e) {}
  }, [selectedCategory, minPrice, maxPrice, searchTerm]);

  // Tự động cuộn lại đúng vị trí xem trước đó khi khách từ trang chi tiết quay lại
  useEffect(() => {
    try {
      const savedScrollY = sessionStorage.getItem("home_scroll_y");
      if (savedScrollY && products.length > 0) {
        const y = Number(savedScrollY);
        if (!isNaN(y) && y > 0) {
          const timer = setTimeout(() => {
            window.scrollTo({ top: y, behavior: "instant" });
          }, 80);
          return () => clearTimeout(timer);
        }
      }
    } catch (e) {}
  }, [products]);

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

  const scrollToProducts = () => {
    const elem = document.getElementById('products-section');
    if (elem) {
      const yOffset = -90;
      const y = elem.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    try {
      sessionStorage.setItem("home_current_page", String(newPage));
    } catch (e) {}
    scrollToProducts();
  };

  const handlePrev = () => {
    const prev = currentPage === 1 ? totalPages : currentPage - 1;
    handlePageChange(prev);
  };
  
  const handleNext = () => {
    const next = currentPage === totalPages ? 1 : currentPage + 1;
    handlePageChange(next);
  };

  const handleProductClick = () => {
    try {
      sessionStorage.setItem("home_current_page", String(currentPage));
      sessionStorage.setItem("home_scroll_y", String(window.scrollY));
      sessionStorage.setItem("home_category", String(selectedCategory));
    } catch (e) {}
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
          <div className="sidebar-box-clean sidebar-box-categories">
            <div className="sidebar-title">
              <i className="fas fa-th-large"></i> Danh Mục Thiết Bị
            </div>
            <div className="category-scroll-container">
              {canScrollLeft && (
                <div className="cat-arrow-wrapper-left">
                  <button
                    type="button"
                    className="cat-arrow-btn cat-arrow-left"
                    onClick={() => scrollCat('left')}
                    title="Cuộn sang trái"
                    aria-label="Cuộn sang trái"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                </div>
              )}

              <div 
                className="category-nav-list"
                ref={categoryNavRef}
                onScroll={checkCatScroll}
                onMouseDown={handleCatMouseDown}
                onMouseMove={handleCatMouseMove}
                onMouseUp={handleCatMouseUp}
                onMouseLeave={handleCatMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div 
                  className={`category-nav-item ${selectedCategory === "all" ? "active" : ""}`}
                  onClick={() => {
                    if (!hasMovedCat.current) setSelectedCategory("all");
                  }}
                >
                  <i className="fas fa-border-all" style={{ fontSize: '11px' }}></i>
                  <span>Tất cả sản phẩm</span>
                </div>
                {categories.map((cat) => (
                  <div 
                    key={cat.id || cat._id}
                    className={`category-nav-item ${selectedCategory === String(cat.id || cat._id) ? "active" : ""}`}
                    onClick={() => {
                      if (!hasMovedCat.current) setSelectedCategory(String(cat.id || cat._id));
                    }}
                  >
                    <span>{cat.name}</span>
                    <i className="fas fa-chevron-right" style={{ fontSize: '11px' }}></i>
                  </div>
                ))}
              </div>

              {canScrollRight && (
                <div className="cat-arrow-wrapper-right">
                  <button
                    type="button"
                    className="cat-arrow-btn cat-arrow-right"
                    onClick={() => scrollCat('right')}
                    title="Cuộn sang phải"
                    aria-label="Cuộn sang phải"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Box Lọc Khoảng Giá Hiện Đại & Gọn Gàng */}
          <div className="sidebar-box-clean sidebar-box-price">
            <div className="sidebar-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-sliders-h" style={{ color: '#0284c7' }}></i>
                <span>Khoảng Giá</span>
              </div>
              {(minPrice !== 0 || maxPrice !== 5000000) && (
                <button 
                  type="button"
                  className="price-reset-pill"
                  onClick={() => { setMinPrice(0); setMaxPrice(5000000); }}
                  title="Xóa bộ lọc giá"
                >
                  <i className="fas fa-undo-alt"></i> Đặt lại
                </button>
              )}
            </div>

            {/* Thẻ hiển thị mức giá đang chọn */}
            <div className="price-display-card">
              <span className="price-display-label">
                <i className="fas fa-filter"></i> Mức giá lọc:
              </span>
              <span className="price-display-val">
                {minPrice === 0 && maxPrice >= 5000000 ? (
                  <span className="price-val-all">Tất cả mức giá</span>
                ) : (
                  <span className="price-val-active">
                    {minPrice > 0 ? `${minPrice.toLocaleString('vi-VN')} đ` : '0 đ'} 
                    <span style={{ margin: '0 4px', color: '#94a3b8' }}>→</span>
                    {maxPrice >= 50000000 ? 'Trên 3 Triệu' : `${maxPrice.toLocaleString('vi-VN')} đ`}
                  </span>
                )}
              </span>
            </div>

            {/* Thanh trượt khoảng giá công nghệ hiện đại */}
            <div className="modern-slider-container">
              <input
                type="range"
                min="0"
                max="5000000"
                step="100000"
                value={maxPrice > 5000000 ? 5000000 : maxPrice}
                onChange={(e) => {
                  setMinPrice(0);
                  setMaxPrice(Number(e.target.value));
                }}
                className="modern-price-slider"
                style={{
                  background: `linear-gradient(to right, #0284c7 0%, #0284c7 ${Math.min(100, Math.max(0, (Math.min(maxPrice, 5000000) / 5000000) * 100))}%, #e2e8f0 ${Math.min(100, Math.max(0, (Math.min(maxPrice, 5000000) / 5000000) * 100))}%, #e2e8f0 100%)`
                }}
              />
              <div className="slider-tick-labels">
                <span>0 đ</span>
                <span>2.5 Triệu</span>
                <span>5+ Triệu</span>
              </div>
            </div>

            {/* Các thẻ chọn nhanh khoảng giá dạng pills hiện đại */}
            <div className="price-chip-grid">
              <button 
                type="button"
                className={`price-chip ${minPrice === 0 && maxPrice === 500000 ? "active" : ""}`}
                onClick={() => { setMinPrice(0); setMaxPrice(500000); }}
              >
                <span className="price-chip-dot"></span>
                <span>Dưới 500K</span>
              </button>

              <button 
                type="button"
                className={`price-chip ${minPrice === 500000 && maxPrice === 1000000 ? "active" : ""}`}
                onClick={() => { setMinPrice(500000); setMaxPrice(1000000); }}
              >
                <span className="price-chip-dot"></span>
                <span>500K - 1 Triệu</span>
              </button>

              <button 
                type="button"
                className={`price-chip ${minPrice === 1000000 && maxPrice === 3000000 ? "active" : ""}`}
                onClick={() => { setMinPrice(1000000); setMaxPrice(3000000); }}
              >
                <span className="price-chip-dot"></span>
                <span>1 - 3 Triệu</span>
              </button>

              <button 
                type="button"
                className={`price-chip ${minPrice === 3000000 && maxPrice === 50000000 ? "active" : ""}`}
                onClick={() => { setMinPrice(3000000); setMaxPrice(50000000); }}
              >
                <span className="price-chip-dot"></span>
                <span>Trên 3 Triệu</span>
              </button>
            </div>
          </div>

          {/* 1. Box Hotline Hỗ Trợ & Zalo */}
          <div className="sidebar-box-clean sidebar-box-hotline" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)', border: '1.5px solid #bae6fd' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#0284c7', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)' }}>
                <i className="fas fa-headset"></i>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '14.5px', color: '#0c4a6e', fontWeight: '800' }}>Cần Tư Vấn Nhanh?</strong>
                <span style={{ fontSize: '12px', color: '#0369a1', fontWeight: '600' }}>Kỹ thuật viên trực 24/7</span>
              </div>
            </div>
            <a 
              href="tel:0971024173" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: '#0284c7', color: 'white', borderRadius: '8px', fontWeight: '800', fontSize: '14px', textDecoration: 'none', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)', marginBottom: '8px' }}
            >
              <i className="fas fa-phone-alt"></i> 0971.024.173
            </a>
            <a 
              href="https://zalo.me/0971024173"
              target="_blank"
              rel="noopener noreferrer"
              className="sidebar-zalo-btn"
            >
              <i className="fas fa-comment-dots"></i> Chat Zalo Tư Vấn Miễn Phí
            </a>
          </div>

          {/* 2. Box Đơn Hàng Mới Nhất (Live Real-Time Feed từ MongoDB) */}
          {recentOrders.length > 0 && (
            <div className="sidebar-box-clean sidebar-box-orders">
              <div className="sidebar-widget-header">
                <span className="sidebar-widget-title">
                  <i className="fas fa-bolt" style={{ color: '#f59e0b' }}></i> Đơn Hàng Mới
                </span>
                <span className="live-status-pill">
                  <span className="pulse-indicator"></span> Trực tiếp
                </span>
              </div>

              <div className="sidebar-orders-list">
                {recentOrders.map((ord, idx) => {
                  const item = ord.items?.[0] || {};
                  const matchedProduct = products.find(p => 
                    String(p._id || p.id) === String(item._id || item.id) || 
                    String(p.name || '').trim().toLowerCase() === String(item.name || '').trim().toLowerCase()
                  );
                  const displayImg = item.image || matchedProduct?.image || '/uploads/32.jpg';
                  const custName = ord.customer_name || 'Khách hàng';
                  const safeName = custName.length > 3 ? custName.slice(0, 3) + '***' : custName;
                  const pId = item._id || item.id || matchedProduct?._id || matchedProduct?.id;

                  return (
                    <Link 
                      href={pId ? `/product/${pId}` : '#'} 
                      key={ord._id || idx}
                      className="sidebar-order-item"
                      onClick={handleProductClick}
                      title={item.name}
                    >
                      <div className="sidebar-order-thumb">
                        <img src={displayImg} alt={item.name || 'Sản phẩm'} />
                      </div>
                      <div className="sidebar-order-info">
                        <div className="sidebar-order-buyer">
                          <span><i className="fas fa-user-check" style={{ color: '#0284c7' }}></i> {safeName}</span>
                          <span className="sidebar-order-tag">Đã đặt</span>
                        </div>
                        <div className="sidebar-order-pname">
                          {item.name || 'Thiết bị an ninh'}
                        </div>
                        <div className="sidebar-order-meta">
                          <span className="sidebar-order-time">Vừa đặt mua</span>
                          <span className="sidebar-order-view">Xem <i className="fas fa-chevron-right" style={{ fontSize: '9px' }}></i></span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Box Cam Kết Tiêu Chuẩn Dịch Vụ Vàng */}
          <div className="sidebar-box-clean sidebar-box-trust">
            <div className="sidebar-widget-title" style={{ marginBottom: '14px', borderBottom: '2px solid #e0f2fe', paddingBottom: '10px' }}>
              <i className="fas fa-medal" style={{ color: '#0284c7' }}></i> Tiêu Chuẩn CiOs
            </div>
            <div className="sidebar-trust-list">
              <div className="sidebar-trust-item">
                <div className="sidebar-trust-icon"><i className="fas fa-shield-alt"></i></div>
                <div className="sidebar-trust-text">
                  <strong>Bảo Hành 24 Tháng</strong>
                  <span>1 đổi 1 trong 30 ngày tận nơi</span>
                </div>
              </div>
              <div className="sidebar-trust-item">
                <div className="sidebar-trust-icon"><i className="fas fa-shipping-fast"></i></div>
                <div className="sidebar-trust-text">
                  <strong>Lắp Đặt Hỏa Tốc</strong>
                  <span>Có mặt trong 2 giờ tại HCM</span>
                </div>
              </div>
              <div className="sidebar-trust-item">
                <div className="sidebar-trust-icon"><i className="fas fa-qrcode"></i></div>
                <div className="sidebar-trust-text">
                  <strong>Quét Mã VietQR / COD</strong>
                  <span>Thanh toán chuẩn xác, tiện lợi</span>
                </div>
              </div>
              <div className="sidebar-trust-item">
                <div className="sidebar-trust-icon"><i className="fas fa-headset"></i></div>
                <div className="sidebar-trust-text">
                  <strong>Hỗ Trợ Trọn Đời</strong>
                  <span>Kỹ thuật viên hướng dẫn từ xa</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* NỘI DUNG CHÍNH (MAIN CONTENT) */}
        <main className="content-col">
          {/* KHU VỰC VOUCHERS */}
          {vouchers.length > 0 && (
            <div className="content-section-vouchers" style={{ marginBottom: '35px' }}>
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
          <div className="content-section-hot" style={{ marginBottom: '40px' }}>
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
                    <Link href={`/product/${product.id || product._id}`} onClick={handleProductClick}>
                      <img src={product.image} alt={product.name} />
                    </Link>
                  </div>

                  <div className="card-info-content">
                    <Link href={`/product/${product.id || product._id}`} onClick={handleProductClick}>
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
          <div className="content-section-products">
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
                      <Link href={`/product/${product.id || product._id}`} onClick={handleProductClick}>
                        <img src={product.image} alt={product.name} />
                      </Link>
                    </div>

                    <div className="card-info-content">
                      <Link href={`/product/${product.id || product._id}`} onClick={handleProductClick}>
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
                    onClick={() => handlePageChange(number)}
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