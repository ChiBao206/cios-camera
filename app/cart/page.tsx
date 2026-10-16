"use client";

import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react'; 
import NotifBadge from '@/app/components/NotifBadge';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import FloatingActions from '@/app/components/FloatingActions';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQty, toggleCheck, toggleAllCheck, totalItems, clearCart } = useCart();
  
  // 1. TIỀN HÀNG (TẠM TÍNH)
  const totalAmount = cartItems.reduce((sum: number, item: any) => sum + (item.checked ? Number(item.price) * item.cartQty : 0), 0);

  const hasCheckedItems = cartItems.some((item: any) => item.checked);
  const isAllChecked = cartItems.length > 0 && cartItems.every((item: any) => item.checked);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [paymentMethod, setPaymentMethod] = useState('cod'); 
  const [user, setUser] = useState<any>(null);
  
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');

  // ==========================================
  // STATE CẤU HÌNH VÀ VOUCHER ĐÃ LƯU / ĐÃ DÙNG
  // ==========================================
  const [systemSettings, setSystemSettings] = useState({
    saleDays: '', saleDiscount: 0, feeHCM: 30000, feeSouth: 50000, feeOther: 80000
  });
  
  const [voucherCode, setVoucherCode] = useState(''); 
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherMsg, setVoucherMsg] = useState({ type: '', text: '' });
  
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [savedVouchersList, setSavedVouchersList] = useState<any[]>([]);
  
  // STATE MỚI: Danh sách các mã khách đã dùng rồi
  const [usedVouchersList, setUsedVouchersList] = useState<string[]>([]);

  // Lấy dữ liệu settings, tỉnh thành và các VOUCHER KHÁCH ĐÃ LƯU TỪ DB
  useEffect(() => {
    const loggedInUser = localStorage.getItem('currentUser');
    
    if (!loggedInUser) {
      alert("Vui lòng đăng nhập tài khoản để vào giỏ hàng!");
      window.location.href = '/login';
      return;
    }

    const parsedUser = JSON.parse(loggedInUser);
    setUser(parsedUser);
    setName(parsedUser.username || '');
    setPhone(parsedUser.phone || '');
    setIsLoadingAuth(false);

    // Fetch API Tỉnh thành
    fetch('https://provinces.open-api.vn/api/?depth=1')
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(err => console.error("Lỗi tải tỉnh thành: ", err));

    const loadData = async () => {
      try {
        const timestamp = new Date().getTime();
        const [setRes, vouRes] = await Promise.all([
          fetch(`/api/settings?t=${timestamp}`).catch(() => null),
          fetch(`/api/vouchers?t=${timestamp}`).catch(() => null)
        ]);

        if (setRes && setRes.ok) {
          const sData = await setRes.json();
          if(sData) setSystemSettings(sData);
        }

        // Lấy danh sách ĐÃ SỬ DỤNG của riêng khách hàng này
        const localUsed = localStorage.getItem(`camera_bn_used_vouchers_${parsedUser.username}`);
        if (localUsed) setUsedVouchersList(JSON.parse(localUsed));

        // Lấy danh sách ĐÃ LƯU VÍ
        const localSaved = localStorage.getItem(`camera_bn_my_vouchers_${parsedUser.username}`);
        let mySavedCodes: string[] = [];
        if (localSaved) mySavedCodes = JSON.parse(localSaved);

        if (vouRes && vouRes.ok) {
          const vData = await vouRes.json();
          const validSavedVouchers = vData.filter((v: any) => 
            mySavedCodes.includes(v.code) && 
            v.isActive && 
            v.usedCount < v.maxUsage && 
            new Date(v.expireDate) >= new Date()
          );
          setSavedVouchersList(validSavedVouchers);
        }

      } catch (error) {
        console.log(error);
      }
    };

    loadData();
  }, []);

  // ==========================================
  // HÀM XỬ LÝ NHẬP MÃ BẰNG TAY VÀ TỪ POPUP
  // ==========================================
  
  const handleSelectVoucher = (voucher: any) => {
    if(totalAmount < voucher.minOrderValue) {
      alert(`Voucher này yêu cầu đơn hàng tối thiểu ${Number(voucher.minOrderValue).toLocaleString('vi-VN')}đ! Vui lòng mua thêm sản phẩm.`);
      return;
    }
    setAppliedVoucher(voucher);
    setVoucherMsg({ type: 'success', text: `Áp dụng thành công mã giảm ${voucher.discountPercent}%!` });
    setShowVoucherModal(false);
  };

  const handleApplyManualVoucher = async () => {
    if(!voucherCode.trim()) {
      setVoucherMsg({ type: 'error', text: 'Vui lòng nhập mã giảm giá!' });
      return;
    }

    // ĐÃ THÊM: CHẶN DÙNG LẠI MÃ NẾU ĐÃ CÓ TRONG LỊCH SỬ
    if (usedVouchersList.includes(voucherCode.trim().toUpperCase())) {
      setVoucherMsg({ type: 'error', text: 'Bạn đã sử dụng mã này cho đơn hàng trước đó rồi!' });
      return;
    }

    setVoucherMsg({ type: '', text: 'Đang kiểm tra mã...' });
    
    try {
      const res = await fetch(`/api/vouchers?code=${voucherCode.trim().toUpperCase()}`);
      if(!res.ok) {
        const data = await res.json();
        setVoucherMsg({ type: 'error', text: data.message || 'Mã không hợp lệ!' });
        setAppliedVoucher(null);
        return;
      }
      
      const voucher = await res.json();
      
      if(totalAmount < voucher.minOrderValue) {
        setVoucherMsg({ type: 'error', text: `Đơn hàng tối thiểu ${Number(voucher.minOrderValue).toLocaleString('vi-VN')}đ để dùng mã này!` });
        setAppliedVoucher(null);
        return;
      }
      
      setAppliedVoucher(voucher);
      setVoucherMsg({ type: 'success', text: `Áp dụng thành công mã giảm ${voucher.discountPercent}%!` });
      setVoucherCode(''); 
    } catch(e) {
      setVoucherMsg({ type: 'error', text: 'Lỗi kiểm tra mã. Vui lòng thử lại!' });
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    setVoucherMsg({ type: '', text: '' });
  };

  useEffect(() => {
    if (appliedVoucher && totalAmount < appliedVoucher.minOrderValue) {
      setAppliedVoucher(null);
      setVoucherCode('');
      setVoucherMsg({ type: 'error', text: `Mã ${appliedVoucher.code} đã bị gỡ vì tổng đơn dưới ${Number(appliedVoucher.minOrderValue).toLocaleString('vi-VN')}đ.` });
    }
  }, [totalAmount, appliedVoucher]);

  // ==========================================
  // THUẬT TOÁN TÍNH TIỀN CHUNG
  // ==========================================
  const currentDay = new Date().getDate();
  const saleDaysArr = (systemSettings.saleDays || "").split(',').map(d => parseInt(d.trim()));
  const isSaleDay = saleDaysArr.includes(currentDay) && systemSettings.saleDiscount > 0;

  const saleDiscountAmount = isSaleDay ? (totalAmount * systemSettings.saleDiscount) / 100 : 0;
  const voucherDiscountAmount = appliedVoucher ? (totalAmount * appliedVoucher.discountPercent) / 100 : 0;
  const totalDiscount = saleDiscountAmount + voucherDiscountAmount;

  let shippingFee = 0;
  if (selectedProvince) {
    const provCode = String(selectedProvince);
    const southCodes = ['70', '72', '74', '75', '77', '80', '82', '83', '84', '86', '87', '89', '91', '92', '93', '94', '95', '96'];
    
    if (provCode === '79') {
      shippingFee = systemSettings.feeHCM;
    } else if (southCodes.includes(provCode)) {
      shippingFee = systemSettings.feeSouth;
    } else {
      shippingFee = systemSettings.feeOther;
    }
  }

  const finalTotal = Math.max(0, totalAmount - totalDiscount) + shippingFee;

  const handleLogout = () => {
    clearCart(); 
    localStorage.removeItem('currentUser'); 
    window.location.href = '/'; 
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceCode = e.target.value;
    setSelectedProvince(provinceCode);
    setSelectedDistrict(''); 
    setWards([]);            
    setSelectedWard('');     
    if (provinceCode) {
      fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
        .then(res => res.json())
        .then(data => setDistricts(data.districts));
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtCode = e.target.value;
    setSelectedDistrict(districtCode);
    setSelectedWard(''); 
    if (districtCode) {
      fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
        .then(res => res.json())
        .then(data => setWards(data.wards));
    }
  };

  const handleCheckout = async () => {
    if (!name || !phone || !selectedProvince || !selectedDistrict || !selectedWard || !addressDetail) {
      alert("Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ giao hàng!");
      return;
    }
    if (totalAmount === 0) {
      alert("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!");
      return;
    }

    setIsSubmitting(true);

    const provName = provinces.find(p => String(p.code) === String(selectedProvince))?.name || '';
    const distName = districts.find(d => String(d.code) === String(selectedDistrict))?.name || '';
    const wardName = wards.find(w => String(w.code) === String(selectedWard))?.name || '';
    
    const paymentText = paymentMethod === 'cod' ? '(COD - Thanh toán khi nhận hàng)' : '(Đã thanh toán Chuyển khoản QR)';
    const fullAddress = `${addressDetail}, ${wardName}, ${distName}, ${provName} ${paymentText}`;

    const purchasedItems = cartItems.filter((i: any) => i.checked);

    const newOrder = {
      user_id: user ? (user._id || user.id) : 2, 
      email: user ? user.email : '',
      total_money: finalTotal,      
      subtotal: totalAmount,        
      shipping_fee: shippingFee,    
      discount: totalDiscount,    
      status: "Chờ xử lý", 
      customer_name: name,
      customer_phone: phone,
      shipping_address: fullAddress,
      items: JSON.parse(JSON.stringify(purchasedItems)) 
    };
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });

      if (res.ok) {
        for (const item of purchasedItems) {
          const remainingQty = Number(item.quantity || item.maxQty) - Number(item.cartQty);
          await fetch(`/api/products?id=${item._id || item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              quantity: remainingQty > 0 ? remainingQty : 0, 
              sold: (Number(item.sold) || 0) + Number(item.cartQty) 
            })
          });
        }

        // ĐÃ THÊM: XÓA VOUCHER KHỎI VÍ VÀ ĐƯA VÀO DANH SÁCH "ĐÃ SỬ DỤNG"
        if (appliedVoucher) {
          await fetch(`/api/vouchers?id=${appliedVoucher._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usedCount: Number(appliedVoucher.usedCount) + 1 })
          }).catch(e => console.log("Lỗi cập nhật voucher:", e));

          const newUsedList = [...usedVouchersList, appliedVoucher.code];
          localStorage.setItem(`camera_bn_used_vouchers_${user.username}`, JSON.stringify(newUsedList));

          const localSaved = localStorage.getItem(`camera_bn_my_vouchers_${user.username}`);
          let mySavedCodes: string[] = localSaved ? JSON.parse(localSaved) : [];
          const updatedSavedList = mySavedCodes.filter(c => c !== appliedVoucher.code);
          localStorage.setItem(`camera_bn_my_vouchers_${user.username}`, JSON.stringify(updatedSavedList));
        }

        alert("🎉 Đặt hàng thành công! Hệ thống đã ghi nhận đơn hàng.");
        clearCart(); 
        window.location.href = '/profile'; 
      } else {
        alert("Có lỗi xảy ra khi lưu đơn hàng vào hệ thống.");
      }
    } catch (error) {
      alert("Lỗi kết nối đến máy chủ API!");
    }
    setIsSubmitting(false);
  };

  if (isLoadingAuth) {
    return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'transparent', color: '#0369a1', fontWeight: 'bold' }}><i className="fas fa-spinner fa-spin" style={{ marginRight: '10px' }}></i> Đang tải giỏ hàng...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* CSS DẠNG KEBAB-CASE CHUẨN */}
      <style>{`
        .voucher-modal-overlay {
          position: fixed; 
          inset: 0; 
          background: rgba(12,74,110,0.7); 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          z-index: 1000; 
          padding: 20px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .voucher-modal-content {
          background: rgba(240, 249, 255, 0.95); 
          border-radius: 16px; 
          width: 100%; 
          max-width: 500px; 
          max-height: 80vh; 
          display: flex; 
          flex-direction: column; 
          overflow: hidden; 
          box-shadow: 0 25px 50px -12px rgba(2,132,199,0.35);
          border: 1px solid rgba(186, 230, 253, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        .voucher-modal-header {
          padding: 20px; 
          background: rgba(224, 242, 254, 0.85); 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          border-bottom: 1px solid #bae6fd;
        }
        .voucher-modal-body {
          padding: 20px; 
          overflow-y: auto; 
          flex: 1; 
          display: flex; 
          flex-direction: column; 
          gap: 15px;
        }
        .v-item {
          display: flex; 
          background: rgba(255, 255, 255, 0.85); 
          border-radius: 10px; 
          border: 1px solid #bae6fd; 
          overflow: hidden; 
          box-shadow: 0 4px 12px rgba(2,132,199,0.08);
        }
        .v-item-left {
          width: 90px; 
          background: linear-gradient(135deg, #0369a1, #0ea5e9); 
          color: white; 
          display: flex; 
          flex-direction: column; 
          justify-content: center; 
          align-items: center; 
          border-right: 2px dashed rgba(255,255,255,0.5); 
          padding: 10px;
        }
        .v-item-right {
          flex: 1; 
          padding: 15px; 
          display: flex; 
          flex-direction: column; 
          justify-content: space-between;
        }
      `}</style>

      {/* POPUP CHỌN VOUCHER TỪ VÍ */}
      {showVoucherModal && (
        <div className="voucher-modal-overlay">
          <div className="voucher-modal-content">
            <div className="voucher-modal-header">
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px' }}><i className="fas fa-ticket-alt" style={{ color: '#f59e0b', marginRight: '8px' }}></i> Ví Voucher của bạn</h3>
              <button onClick={() => setShowVoucherModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
            </div>
            <div className="voucher-modal-body">
              {savedVouchersList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                  <i className="fas fa-box-open" style={{ fontSize: '40px', marginBottom: '15px', color: '#cbd5e1' }}></i>
                  <p>Bạn chưa lưu mã giảm giá nào.</p>
                  <Link href="/" style={{ color: '#3b82f6', fontWeight: 'bold', textDecoration: 'none' }}>Về trang chủ thu thập ngay!</Link>
                </div>
              ) : (
                savedVouchersList.map(v => {
                  const isEligible = totalAmount >= v.minOrderValue;
                  return (
                    <div className="v-item" key={v.code} style={{ opacity: isEligible ? 1 : 0.6 }}>
                      <div className="v-item-left">
                        <span style={{ fontSize: '20px', fontWeight: '900' }}>{v.discountPercent}%</span>
                        <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Giảm</span>
                      </div>
                      <div className="v-item-right">
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}>Mã: <span style={{ color: '#e11d48' }}>{v.code}</span></div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Đơn tối thiểu {Number(v.minOrderValue).toLocaleString('vi-VN')}đ</div>
                          <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>HSD: {new Date(v.expireDate).toLocaleDateString('vi-VN')}</div>
                        </div>
                        <div style={{ marginTop: '10px', textAlign: 'right' }}>
                          <button 
                            onClick={() => handleSelectVoucher(v)}
                            disabled={!isEligible}
                            style={{ background: isEligible ? '#3b82f6' : '#cbd5e1', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '4px', fontWeight: 'bold', cursor: isEligible ? 'pointer' : 'not-allowed' }}
                          >
                            {isEligible ? 'Áp dụng' : 'Chưa đủ ĐK'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

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
      <Header user={user} activePage="cart" onLogout={handleLogout} />

      <main style={{ maxWidth: '1200px', width: '95%', margin: '30px auto', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b' }}>
            GIỎ HÀNG <span style={{ fontSize: '16px', color: '#64748b', fontWeight: 'normal' }}>({cartItems.length} sản phẩm)</span>
          </h1>
          <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
            <i className="fas fa-chevron-left"></i> Tiếp tục mua sắm
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div style={{ background: 'rgba(240, 249, 255, 0.78)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderRadius: '16px', padding: '60px 20px', textAlign: 'center', boxShadow: '0 8px 30px rgba(2, 132, 199, 0.1)', border: '1px solid rgba(186, 230, 253, 0.75)' }}>
            <div style={{ fontSize: '80px', color: '#7dd3fc', marginBottom: '20px' }}><i className="fas fa-shopping-cart"></i></div>
            <h2 style={{ fontSize: '18px', color: '#0369a1', marginBottom: '20px', fontWeight: '700' }}>Giỏ hàng đang trống!</h2>
            <Link href="/" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: 'white', padding: '12px 30px', borderRadius: '30px', fontWeight: 'bold', textDecoration: 'none', boxShadow: '0 4px 15px rgba(2, 132, 199, 0.35)' }}>MUA SẮM NGAY</Link>
          </div>
        ) : (
          <div className="cart-layout-flex" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

            <div className="cart-items-col" style={{ flex: hasCheckedItems ? '1 1 60%' : '1 1 100%', width: '100%', background: 'rgba(240, 249, 255, 0.78)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderRadius: '16px', padding: '0 20px 20px 20px', boxShadow: '0 8px 30px rgba(2, 132, 199, 0.1)', border: '1px solid rgba(186, 230, 253, 0.75)', transition: 'all 0.3s ease' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', padding: '15px 0', borderBottom: '2px solid rgba(186, 230, 253, 0.8)', gap: '12px', marginBottom: '5px' }}>
                <input 
                  type="checkbox" 
                  checked={isAllChecked} 
                  onChange={(e) => toggleAllCheck(e.target.checked)} 
                  style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: '#0ea5e9' }} 
                />
                <span style={{ fontWeight: '700', color: '#0369a1', fontSize: '15px' }}>Chọn tất cả ({cartItems.length} sản phẩm)</span>
              </div>

              {cartItems.map((item: any) => (
                <div key={item._id || item.id} style={{ display: 'flex', alignItems: 'stretch', padding: '15px 0', borderBottom: '1px solid rgba(186, 230, 253, 0.5)', gap: '12px' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input type="checkbox" checked={item.checked} onChange={() => toggleCheck(item._id || item.id)} style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: '#0ea5e9' }} />
                  </div>

                  <div style={{ width: '80px', height: '80px', border: '1px solid #bae6fd', borderRadius: '10px', padding: '6px', flexShrink: 0, background: 'rgba(255, 255, 255, 0.7)' }}>
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <Link href={`/product/${item._id || item.id}`} style={{ fontWeight: '600', color: '#0f172a', textDecoration: 'none', fontSize: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.name}
                      </Link>
                      <button onClick={() => removeFromCart(item._id || item.id)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '15px', marginTop: '2px' }}>
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                      <span style={{ fontWeight: '700', color: '#0284c7', fontSize: '15px' }}>
                        {Number(item.price).toLocaleString('vi-VN')} đ
                      </span>
                      
                      <div style={{ display: 'flex', border: '1px solid #bae6fd', borderRadius: '6px', overflow: 'hidden' }}>
                        <button onClick={() => updateQty(item._id || item.id, item.cartQty - 1)} disabled={item.cartQty <= 1} style={{ width: '28px', height: '28px', background: 'rgba(240, 249, 255, 0.9)', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: '#0369a1' }}>-</button>
                        <input type="text" value={item.cartQty} readOnly style={{ width: '35px', height: '28px', border: 'none', borderLeft: '1px solid #bae6fd', borderRight: '1px solid #bae6fd', textAlign: 'center', fontWeight: 'bold', fontSize: '13px', color: '#0c4a6e', background: 'white' }} />
                        <button onClick={() => updateQty(item._id || item.id, item.cartQty + 1)} disabled={item.cartQty >= (item.quantity || item.maxQty)} style={{ width: '28px', height: '28px', background: 'rgba(240, 249, 255, 0.9)', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: '#0369a1' }}>+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {hasCheckedItems && (
              <div className="cart-summary-col" style={{ flex: '1 1 35%', minWidth: '300px', width: '100%', transition: 'all 0.3s ease' }}>
                <div style={{ background: 'rgba(240, 249, 255, 0.82)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderRadius: '16px', padding: '25px', boxShadow: '0 8px 30px rgba(2, 132, 199, 0.1)', border: '1px solid rgba(186, 230, 253, 0.75)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0369a1', textTransform: 'uppercase', marginBottom: '20px' }}>THÔNG TIN GIAO HÀNG</h3>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#0c4a6e', fontWeight: '600', marginBottom: '8px' }}>Họ tên</label>
                    <input type="text" placeholder="Nhập họ và tên người nhận" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'rgba(255, 255, 255, 0.85)' }} />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#0c4a6e', fontWeight: '600', marginBottom: '8px' }}>Điện thoại</label>
                    <input type="tel" placeholder="Nhập số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'rgba(255, 255, 255, 0.85)' }} />
                  </div>

                  <div style={{ border: '1px dashed #bae6fd', background: 'rgba(224, 242, 254, 0.5)', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
                    <label style={{ display: 'block', fontSize: '14px', color: '#0284c7', fontWeight: 'bold', marginBottom: '15px' }}>
                      <i className="fas fa-map-marker-alt"></i> Địa chỉ nhận hàng (*)
                    </label>
                    <select value={selectedProvince} onChange={handleProvinceChange} style={{ width: '100%', padding: '12px', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '14px', outline: 'none', marginBottom: '10px', background: 'rgba(255, 255, 255, 0.9)', cursor: 'pointer' }}>
                      <option value="" disabled>Chọn Tỉnh/Thành phố</option>
                      {provinces.map((prov) => (<option key={prov.code} value={prov.code}>{prov.name}</option>))}
                    </select>
                    <select value={selectedDistrict} onChange={handleDistrictChange} disabled={!selectedProvince} style={{ width: '100%', padding: '12px', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '14px', outline: 'none', marginBottom: '10px', background: selectedProvince ? 'rgba(255, 255, 255, 0.9)' : '#f1f5f9', cursor: selectedProvince ? 'pointer' : 'not-allowed' }}>
                      <option value="" disabled>Chọn Quận/Huyện</option>
                      {districts.map((dist) => (<option key={dist.code} value={dist.code}>{dist.name}</option>))}
                    </select>
                    <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} disabled={!selectedDistrict} style={{ width: '100%', padding: '12px', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '14px', outline: 'none', marginBottom: '10px', background: selectedDistrict ? 'rgba(255, 255, 255, 0.9)' : '#f1f5f9', cursor: selectedDistrict ? 'pointer' : 'not-allowed' }}>
                      <option value="" disabled>Chọn Phường/Xã</option>
                      {wards.map((ward) => (<option key={ward.code} value={ward.code}>{ward.name}</option>))}
                    </select>
                    <input type="text" placeholder="Nhập số nhà, tên đường, tòa nhà..." value={addressDetail} onChange={(e) => setAddressDetail(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'rgba(255, 255, 255, 0.9)' }} />
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0369a1', textTransform: 'uppercase', marginBottom: '15px' }}>Phương thức thanh toán</h3>
                  <div style={{ marginBottom: '30px' }}>
                    <div onClick={() => setPaymentMethod('cod')} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', border: '1px solid', borderColor: paymentMethod === 'cod' ? '#0284c7' : '#bae6fd', borderRadius: '10px', marginBottom: '10px', cursor: 'pointer', background: paymentMethod === 'cod' ? 'rgba(224, 242, 254, 0.9)' : 'rgba(255, 255, 255, 0.8)', transition: '0.2s' }}>
                      <input type="radio" checked={paymentMethod === 'cod'} readOnly style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: '#0284c7' }} />
                      <div>
                        <div style={{ fontWeight: '700', color: '#0c4a6e', fontSize: '14px' }}>Thanh toán khi nhận hàng (COD)</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Giao hàng tận nơi rồi mới thu tiền</div>
                      </div>
                    </div>
                    <div onClick={() => setPaymentMethod('qr')} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', border: '1px solid', borderColor: paymentMethod === 'qr' ? '#0284c7' : '#bae6fd', borderRadius: '10px', cursor: 'pointer', background: paymentMethod === 'qr' ? 'rgba(224, 242, 254, 0.9)' : 'rgba(255, 255, 255, 0.8)', transition: '0.2s' }}>
                      <input type="radio" checked={paymentMethod === 'qr'} readOnly style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: '#0284c7' }} />
                      <div>
                        <div style={{ fontWeight: '700', color: '#0c4a6e', fontSize: '14px' }}>Chuyển khoản / Quét mã QR</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Quét mã QR qua ứng dụng ngân hàng, Momo</div>
                      </div>
                    </div>
                    
                    {paymentMethod === 'qr' && (
                      <div style={{ marginTop: '15px', background: '#f8fafc', border: '1px dashed #3b82f6', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
                        <p style={{ fontSize: '13px', color: '#334155', fontWeight: '600', marginBottom: '15px' }}>Quét mã QR bên dưới bằng ứng dụng Ngân hàng hoặc Ví điện tử của bạn để thanh toán:</p>
                        <div style={{ width: '220px', height: '220px', margin: '0 auto', background: 'white', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                          <img 
                            src="/uploads/qrck.jpg" 
                            alt="Mã QR Thanh Toán" 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={(e) => { e.currentTarget.src = "https://placehold.co/200x200?text=Ma+QR+Loi" }}
                          />
                        </div>
                        <div style={{ marginTop: '15px', fontSize: '12px', color: '#ef4444', fontStyle: 'italic' }}>
                          * Vui lòng nhập nội dung chuyển khoản là: <strong>SĐT của bạn</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* KHUNG ÁP DỤNG VOUCHER BẰNG NÚT */}
                  <div style={{ border: '1px dashed #bae6fd', background: 'rgba(224, 242, 254, 0.5)', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <label style={{ fontSize: '14px', color: '#0369a1', fontWeight: 'bold' }}>
                        <i className="fas fa-ticket-alt" style={{ color: '#0284c7' }}></i> Mã giảm giá (Voucher)
                      </label>
                      <button 
                        onClick={() => setShowVoucherModal(true)}
                        style={{ background: 'rgba(224, 242, 254, 0.9)', color: '#0284c7', border: '1px solid #bae6fd', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', transition: '0.2s' }}
                      >
                        <i className="fas fa-wallet"></i> Chọn từ Ví
                      </button>
                    </div>
                    
                    {!appliedVoucher ? (
                      <>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input 
                            type="text" 
                            placeholder="Nhập mã voucher (nếu có)..." 
                            value={voucherCode} 
                            onChange={e => setVoucherCode(e.target.value)} 
                            style={{ flex: 1, padding: '10px 15px', border: '1px solid #bae6fd', borderRadius: '8px', outline: 'none', textTransform: 'uppercase', fontSize: '14px', background: 'rgba(255, 255, 255, 0.85)' }} 
                          />
                          <button onClick={handleApplyManualVoucher} style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: 'white', border: 'none', padding: '0 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>
                            Áp dụng
                          </button>
                        </div>
                        {voucherMsg.text && (
                          <div style={{ color: voucherMsg.type === 'error' ? '#ef4444' : '#10b981', fontSize: '12px', marginTop: '8px', fontWeight: 'bold', textAlign: 'center' }}>
                            {voucherMsg.text}
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ecfdf5', border: '1px solid #10b981', padding: '12px 15px', borderRadius: '6px' }}>
                        <div style={{ color: '#047857', fontWeight: 'bold', fontSize: '14px' }}>
                          <i className="fas fa-check-circle"></i> Đã áp dụng: {appliedVoucher.code} (-{appliedVoucher.discountPercent}%)
                        </div>
                        <button onClick={handleRemoveVoucher} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>
                          Gỡ bỏ
                        </button>
                      </div>
                    )}
                  </div>

                  {/* BẢNG TỔNG KẾT TIỀN TỆ */}
                  <div style={{ background: 'rgba(224, 242, 254, 0.6)', border: '1px solid rgba(186, 230, 253, 0.8)', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#475569', marginBottom: '10px' }}>
                      <span>Tạm tính ({cartItems.filter((i:any)=>i.checked).length} SP):</span>
                      <span style={{ fontWeight: '600' }}>{totalAmount.toLocaleString('vi-VN')} đ</span>
                    </div>

                    {isSaleDay && saleDiscountAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#10b981', marginBottom: '10px' }}>
                        <span>Giảm giá ngày vàng ({systemSettings.saleDiscount}%):</span>
                        <span style={{ fontWeight: '600' }}>- {saleDiscountAmount.toLocaleString('vi-VN')} đ</span>
                      </div>
                    )}

                    {appliedVoucher && voucherDiscountAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#f59e0b', marginBottom: '10px' }}>
                        <span>Voucher ({appliedVoucher.code}):</span>
                        <span style={{ fontWeight: '600' }}>- {voucherDiscountAmount.toLocaleString('vi-VN')} đ</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#475569', marginBottom: '10px' }}>
                      <span>Phí vận chuyển:</span>
                      <span style={{ fontWeight: '600' }}>
                        {selectedProvince ? `${shippingFee.toLocaleString('vi-VN')} đ` : 'Chưa xác định'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', paddingTop: '15px', borderTop: '1px dashed #cbd5e1' }}>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>Tổng cộng:</span>
                    <span style={{ fontSize: '24px', fontWeight: '800', color: '#0369a1' }}>{finalTotal.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <button onClick={handleCheckout} disabled={isSubmitting} style={{ width: '100%', padding: '15px', background: isSubmitting ? '#38bdf8' : 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '15px', cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: '0.3s' }}>
                    {isSubmitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐẶT HÀNG'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FLOATING BUTTONS */}
      <FloatingActions />

      {/* FOOTER */}
      <Footer />
    </div>
  );
}