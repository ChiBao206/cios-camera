"use client";

import React from 'react';

export default function FloatingActions() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="floating-actions">
      <a href="https://zalo.me/0971024173" target="_blank" rel="noopener noreferrer" className="float-pill zalo">
        <i className="fas fa-comment-dots"></i> <span>Chat Zalo</span>
      </a>
      <a href="tel:0971024173" className="float-pill phone">
        <i className="fas fa-phone-alt"></i> <span>0971.024.173</span>
      </a>
      <button 
        onClick={scrollToTop} 
        className="float-scroll-top"
        title="Lên đầu trang"
      >
        <i className="fas fa-arrow-up"></i>
      </button>
    </div>
  );
}

