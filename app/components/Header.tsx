"use client";

import Link from "next/link";
import { useState } from "react";
import NotifBadge from "./NotifBadge";
import { useCart } from "../context/CartContext";

interface HeaderProps {
  user?: any;
  activePage?: string; // 'home' | 'projects' | 'contact' | 'cart' | 'profile'
  onLogout?: () => void;
}

export default function Header({ user, activePage, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();

  const close = () => setMobileMenuOpen(false);

  return (
    <>
      {/* Mobile Nav Overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-nav-overlay"
          style={{ display: "block" }}
          onClick={close}
        />
      )}

      <header className="site-header">
        <div className="header-container">
          {/* Logo */}
          <Link href="/" className="brand-logo" onClick={close}>
            <div className="brand-icon">
              <i className="fas fa-video"></i>
            </div>
            <div className="brand-info">
              <div className="brand-name">
                CIOs <span>Camera</span>
              </div>
              <div className="brand-tagline">Security &amp; Smart Solutions</div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className={`nav-menu${mobileMenuOpen ? " is-open" : ""}`}>
            {/* Header top inside mobile drawer */}
            <div className="mobile-drawer-header">
              <span className="mobile-drawer-title">Menu Điều Hướng</span>
              <button 
                className="mobile-drawer-close"
                onClick={close}
                aria-label="Đóng menu"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <Link
              href="/"
              className={`nav-item-link${activePage === "home" ? " active" : ""}`}
              onClick={close}
            >
              <i className="fas fa-home"></i> <span>Trang chủ</span>
            </Link>
            <Link
              href="/projects"
              className={`nav-item-link${activePage === "projects" ? " active" : ""}`}
              onClick={close}
            >
              <i className="fas fa-tools"></i> <span>Dự án</span>
            </Link>
            <Link
              href="/contact"
              className={`nav-item-link${activePage === "contact" ? " active" : ""}`}
              onClick={close}
            >
              <i className="fas fa-headset"></i> <span>Liên hệ</span>
            </Link>

            <Link
              href="/notifications"
              className={`nav-item-link${activePage === "notifications" ? " active" : ""}`}
              style={{ position: "relative" }}
              onClick={close}
            >
              <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                <i className="fas fa-bell"></i>
                <NotifBadge />
              </span>
              <span>Thông báo</span>
            </Link>

            <Link
              href="/cart"
              className={`nav-item-link${activePage === "cart" ? " active" : ""}`}
              style={{ position: "relative" }}
              onClick={close}
            >
              <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                <i className="fas fa-shopping-cart"></i>
                {totalItems > 0 && (
                  <span className="nav-badge-pill">{totalItems}</span>
                )}
              </span>
              <span>Giỏ hàng</span>
            </Link>

            {user ? (
              <div className="nav-auth-user-box">
                <Link
                  href={String(user.role) === "1" ? "/admin" : "/profile"}
                  className="header-user-btn"
                  onClick={close}
                >
                  <div className="header-user-avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="header-user-text">
                    <span className="header-user-name">{user.username}</span>
                    <span className="header-user-role">
                      {String(user.role) === "1" ? "Quản trị viên" : "Khách hàng"}
                    </span>
                  </div>
                </Link>
                {onLogout && (
                  <button
                    onClick={() => {
                      close();
                      onLogout();
                    }}
                    className="header-logout-btn"
                    title="Đăng xuất"
                  >
                    <i className="fas fa-sign-out-alt"></i>
                  </button>
                )}
              </div>
            ) : (
              <div className="nav-auth-buttons">
                <Link href="/login" className="btn-auth-login" onClick={close}>
                  <i className="fas fa-sign-in-alt"></i> Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="btn-auth-register"
                  onClick={close}
                >
                  <i className="fas fa-user-plus"></i> Đăng ký
                </Link>
              </div>
            )}
          </nav>

          {/* Hamburger Button - chỉ hiện trên mobile */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Mở menu điều hướng"
          >
            <span
              style={{
                transform: mobileMenuOpen
                  ? "rotate(45deg) translate(5px, 5px)"
                  : "none",
              }}
            ></span>
            <span style={{ opacity: mobileMenuOpen ? 0 : 1 }}></span>
            <span
              style={{
                transform: mobileMenuOpen
                  ? "rotate(-45deg) translate(5px, -5px)"
                  : "none",
              }}
            ></span>
          </button>
        </div>
      </header>
    </>
  );
}

