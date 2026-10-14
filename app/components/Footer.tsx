import React from 'react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-col">
          <h4>CIOs Camera Security</h4>
          <p style={{ fontSize: '13.5px', color: '#bae6fd', lineHeight: '1.6', marginBottom: '20px' }}>
            Thương hiệu phân phối và thi công giải pháp camera an ninh, thiết bị nhà thông minh AI hàng đầu. Đảm bảo an toàn tuyệt đối cho gia đình và doanh nghiệp.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <i className="fab fa-facebook-f"></i>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <i className="fab fa-youtube"></i>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <i className="fab fa-tiktok"></i>
            </div>
          </div>
        </div>

        <div className="footer-col">
          <h4>Chính Sách & Hỗ Trợ</h4>
          <ul className="footer-links-list">
            <li><a href="#"><i className="fas fa-chevron-right" style={{ fontSize: '10px' }}></i> Chính sách bảo hành 24 tháng</a></li>
            <li><a href="#"><i className="fas fa-chevron-right" style={{ fontSize: '10px' }}></i> Chính sách đổi trả 1-1</a></li>
            <li><a href="#"><i className="fas fa-chevron-right" style={{ fontSize: '10px' }}></i> Hướng dẫn đặt hàng online</a></li>
            <li><a href="#"><i className="fas fa-chevron-right" style={{ fontSize: '10px' }}></i> Hướng dẫn thanh toán & trả góp</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Thông Tin Liên Hệ</h4>
          <div className="footer-contact-row">
            <div className="footer-contact-icon"><i className="fas fa-map-marker-alt"></i></div>
            <div>12 Trịnh Đình Thảo, P. Hòa Thạnh, Q. Tân Phú, TP. Hồ Chí Minh</div>
          </div>
          <div className="footer-contact-row">
            <div className="footer-contact-icon"><i className="fas fa-phone-alt"></i></div>
            <div>Hotline: <strong style={{ color: '#38bdf8' }}>0971.024.173</strong></div>
          </div>
          <div className="footer-contact-row">
            <div className="footer-contact-icon"><i className="fas fa-envelope"></i></div>
            <div>Email: hotro@cios-camera.vn</div>
          </div>
        </div>

        <div className="footer-col">
          <h4>Vị Trí Cửa Hàng</h4>
          <div style={{ borderRadius: '12px', overflow: 'hidden', height: '140px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <iframe
              src="https://maps.google.com/maps?q=12%20Tr%E1%BB%8Bnh%20%C4%90%C3%ACnh%20Th%E1%BA%A3o%2C%20Ho%C3%A0%20Th%E1%BA%A1nh%2C%20T%C3%A2n%20Ph%C3%BA%2C%20H%E1%BB%93%20Ch%C3%AD%20Minh&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        © 2026 CIOs Camera An Ninh. Tất cả quyền được bảo lưu. Thiết kế & phát triển cho trải nghiệm người dùng tối ưu.
      </div>
    </footer>
  );
}

