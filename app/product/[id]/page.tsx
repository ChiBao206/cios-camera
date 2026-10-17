"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import NotifBadge from '@/app/components/NotifBadge';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import FloatingActions from '@/app/components/FloatingActions';
import db from '@/db.json';

// Helper xác định chính xác danh mục và loại sản phẩm
function getProductType(product: any): 'switch' | 'router' | 'dvr' | 'camera_outdoor' | 'camera_indoor' | 'camera' | 'accessory' {
  if (!product) return 'camera';
  const catId = String(product.category_id || '');
  const catName = String(product.category || '').toLowerCase();
  const name = String(product.name || '').toLowerCase();

  // 1. Switch mạng
  if (catId === '18' || catName.includes('switch') || name.includes('switch') || name.includes('chia mạng')) {
    return 'switch';
  }
  // 2. Router / Wifi
  if (catId === '17' || catName.includes('router') || name.includes('router') || (name.includes('wifi') && (name.includes('băng tần') || name.includes('ax') || name.includes('ac1200') || name.includes('totolink') || name.includes('archer') || name.includes('phát sóng') || name.includes('kích sóng')))) {
    return 'router';
  }
  // 3. Đầu ghi hình (DVR / NVR / XVR)
  if (catId === '19' || catName.includes('đầu ghi') || name.includes('đầu ghi') || name.includes('nvr') || name.includes('dvr') || name.includes('xvr')) {
    return 'dvr';
  }
  // 4. Phụ kiện & Lưu trữ
  if (name.includes('thẻ nhớ') || name.includes('ổ cứng') || name.includes('hdd') || name.includes('nguồn') || name.includes('jack') || name.includes('dây cáp') || name.includes('chân đế')) {
    return 'accessory';
  }
  // 5. Camera ngoài trời
  if (catId === '14' || name.includes('ngoài trời') || name.includes('outdoor') || name.includes('bullet') || name.includes('solar') || name.includes('năng lượng mặt trời') || name.includes('outpro') || name.includes('c8c') || name.includes('c3tn') || name.includes('s42fp')) {
    return 'camera_outdoor';
  }
  // 6. Camera trong nhà
  if (catId === '13' || name.includes('ranger') || name.includes('c6n') || name.includes('indoor') || name.includes('trong nhà') || name.includes('a22ep') || name.includes('c200') || name.includes('xoay 360')) {
    return 'camera_indoor';
  }
  return 'camera';
}

// Helper trích xuất thương hiệu sản phẩm chính xác
function getProductBrand(product: any): string {
  if (!product?.name) return 'Chính Hãng Phân Phối';
  const name = String(product.name).toUpperCase();
  if (name.includes('TP-LINK') || name.includes('TPLINK')) return 'TP-Link';
  if (name.includes('HIKVISION')) return 'Hikvision';
  if (name.includes('DAHUA')) return 'Dahua Technology';
  if (name.includes('EZVIZ')) return 'Ezviz';
  if (name.includes('IMOU')) return 'Imou';
  if (name.includes('KBVISION') || name.includes('KBONE')) return 'KBVision';
  if (name.includes('VANTECH')) return 'Vantech';
  if (name.includes('TENDA')) return 'Tenda';
  if (name.includes('CISCO')) return 'Cisco Systems';
  if (name.includes('TOTOLINK')) return 'Totolink';
  if (name.includes('XIAOMI')) return 'Xiaomi';
  if (name.includes('VIETMAP')) return 'Vietmap';
  if (name.includes('PANASONIC')) return 'Panasonic';
  if (name.includes('HUVIRON')) return 'Huviron';
  if (name.includes('VIETTEL')) return 'Viettel';
  if (name.includes('FPT')) return 'FPT Telecom';
  if (name.includes('YOOSEE')) return 'Yoosee';
  if (name.includes('GOOGLE')) return 'Google Nest';
  if (name.includes('LOGITECH')) return 'Logitech';
  if (name.includes('EUFY')) return 'Anker Eufy';
  if (name.includes('RING')) return 'Amazon Ring';
  if (name.includes('ARLO')) return 'Arlo Technologies';
  if (name.includes('WYZE')) return 'Wyze Labs';
  if (name.includes('BLINK')) return 'Amazon Blink';
  if (name.includes('WESTERN DIGITAL') || name.includes('WD')) return 'Western Digital';
  if (name.includes('SEAGATE')) return 'Seagate';
  if (name.includes('SANDISK')) return 'SanDisk';
  return 'Chính Hãng Phân Phối';
}

// Helper sinh 4 điểm nổi bật vượt trội phù hợp từng danh mục
function getProductHighlights(product: any, type: string) {
  const name = String(product?.name || '').toLowerCase();

  if (type === 'switch') {
    const isPoE = name.includes('poe');
    return [
      {
        icon: 'fas fa-network-wired',
        title: isPoE ? 'Cấp Nguồn PoE Tiện Lợi' : 'Cổng Mạng Tốc Độ Cao',
        desc: isPoE 
          ? 'Truyền tải dữ liệu và cấp nguồn trực tiếp cho camera IP chỉ qua 1 sợi cáp mạng duy nhất.'
          : 'Tự động nhận diện và chuyển tiếp dữ liệu tốc độ cao (10/100/1000Mbps), không lo giật lag hay nghẽn mạng.'
      },
      {
        icon: 'fas fa-bolt',
        title: 'Cắm Là Chạy (Plug & Play)',
        desc: 'Không cần cấu hình hay cài đặt phức tạp, chỉ cần cắm dây mạng là thiết bị tự động nhận diện và hoạt động ngay.'
      },
      {
        icon: 'fas fa-leaf',
        title: 'Tiết Kiệm Điện (Green Tech)',
        desc: 'Công nghệ tiết kiệm năng lượng thông minh, tự động điều chỉnh công suất theo chiều dài cáp kết nối.'
      },
      {
        icon: 'fas fa-shield-alt',
        title: 'Vỏ Bền Bỉ, Tản Nhiệt Tốt',
        desc: 'Thiết kế thông minh không quạt êm ái hoặc vỏ hợp kim cao cấp, vận hành 24/7 mát mẻ và ổn định.'
      }
    ];
  }

  if (type === 'router') {
    const isWifi6 = name.includes('wifi 6') || name.includes('ax');
    return [
      {
        icon: 'fas fa-wifi',
        title: isWifi6 ? 'Wi-Fi 6 Siêu Tốc Độ' : 'Băng Tần Kép Sóng Khỏe',
        desc: isWifi6 
          ? 'Chuẩn Wi-Fi 6 thế hệ mới mang lại băng thông siêu nhanh, độ trễ cực thấp cho trải nghiệm xem camera mượt mà.'
          : 'Phát sóng song song 2 băng tần 2.4GHz & 5GHz, loại bỏ nhiễu sóng và tối ưu đường truyền internet.'
      },
      {
        icon: 'fas fa-broadcast-tower',
        title: 'Vùng Phủ Sóng Xuyên Tường',
        desc: 'Hệ thống ăng-ten ngoài độ lợi cao giúp phủ sóng xuyên tường mạnh mẽ, bắt sóng ổn định khắp mọi phòng.'
      },
      {
        icon: 'fas fa-users',
        title: 'Chịu Tải Đa Thiết Bị',
        desc: 'Công nghệ tiên tiến hỗ trợ kết nối đồng thời hàng chục điện thoại, laptop, camera an ninh mà không nghẽn mạng.'
      },
      {
        icon: 'fas fa-lock',
        title: 'Bảo Mật WPA3 Tiên Tiến',
        desc: 'Chuẩn bảo mật mã hóa thế hệ mới nhất bảo vệ toàn diện mạng nội bộ gia đình bạn trước các nguy cơ tấn công.'
      }
    ];
  }

  if (type === 'dvr') {
    return [
      {
        icon: 'fas fa-tv',
        title: 'Xuất Hình 4K / Full HD',
        desc: 'Cổng xuất hình HDMI 4K và VGA đồng thời, hiển thị đa kênh sắc nét rõ ràng trên màn hình lớn.'
      },
      {
        icon: 'fas fa-hdd',
        title: 'Chuẩn Nén H.265+ Tiên Tiến',
        desc: 'Tiết kiệm đến 80% dung lượng lưu trữ trên ổ cứng và giảm băng thông truyền tải qua internet.'
      },
      {
        icon: 'fas fa-mobile-alt',
        title: 'Xem Từ Xa Miễn Phí Trọn Đời',
        desc: 'Dễ dàng cài đặt và theo dõi camera trực tiếp cũng như xem lại lịch sử trên điện thoại, máy tính bảng.'
      },
      {
        icon: 'fas fa-database',
        title: 'Hỗ Trợ Ổ Cứng Lên Đến 10TB',
        desc: 'Khả năng gắn ổ cứng dung lượng cực lớn chuyên dụng an ninh, ghi hình ổn định liên tục 24/7.'
      }
    ];
  }

  if (type === 'camera_outdoor') {
    return [
      {
        icon: 'fas fa-tint',
        title: 'Kháng Nước & Bụi Chuẩn IP67',
        desc: 'Vỏ chuyên dụng kín khít hoàn hảo, chống chịu tốt dưới mưa bão lớn, nắng gắt và bụi bẩn ngoài trời.'
      },
      {
        icon: 'fas fa-moon',
        title: 'Ghi Hình Ban Đêm Có Màu',
        desc: 'Trang bị đèn LED trợ sáng và hồng ngoại thông minh, hình ảnh ban đêm luôn rõ ràng và có màu sắc sinh động.'
      },
      {
        icon: 'fas fa-bell',
        title: 'Cảnh Báo Chuyển Động AI',
        desc: 'Phát hiện chính xác người và phương tiện xâm nhập, tự động kích hoạt còi hú và đèn chớp răn đe kẻ xấu.'
      },
      {
        icon: 'fas fa-video',
        title: 'Độ Phân Giải Sắc Nét 2K/4MP',
        desc: 'Cảm biến chất lượng cao giúp bạn thu phóng hình ảnh vẫn nhìn rõ mặt đối tượng và biển số xe từ xa.'
      }
    ];
  }

  if (type === 'camera_indoor') {
    return [
      {
        icon: 'fas fa-sync-alt',
        title: 'Xoay Quét 360° Toàn Cảnh',
        desc: 'Góc quay ngang 355° và dọc 90°, kiểm soát toàn diện không gian phòng khách, phòng ngủ không có điểm mù.'
      },
      {
        icon: 'fas fa-microphone-alt',
        title: 'Đàm Thoại 2 Chiều To Rõ',
        desc: 'Tích hợp mic và loa lọc tiếng ồn, trò chuyện trực tiếp với người thân và con cái dễ dàng mọi lúc.'
      },
      {
        icon: 'fas fa-user-shield',
        title: 'Nhận Diện Người & Tiếng Khóc',
        desc: 'Thuật toán AI tự động phát hiện chuyển động bất thường hoặc tiếng trẻ em khóc và thông báo ngay về điện thoại.'
      },
      {
        icon: 'fas fa-eye-slash',
        title: 'Bảo Vệ Quyền Riêng Tư',
        desc: 'Chế độ ngủ riêng tư một chạm trên ứng dụng cho phép camera ẩn ống kính khi bạn đang ở nhà.'
      }
    ];
  }

  if (type === 'accessory') {
    return [
      {
        icon: 'fas fa-tachometer-alt',
        title: 'Tốc Độ Đọc/Ghi Siêu Tốc',
        desc: 'Được thiết kế chuyên biệt cho việc ghi hình video độ nét cao liên tục, không bị đứt quãng hay mất khung hình.'
      },
      {
        icon: 'fas fa-shield-alt',
        title: 'Hoạt Động Bền Bỉ 24/7',
        desc: 'Chịu được nhiệt độ vận hành cao và chu kỳ ghi xóa liên tục trong thời gian dài nhiều năm.'
      },
      {
        icon: 'fas fa-check-circle',
        title: 'Tương Thích Mọi Thiết Bị',
        desc: 'Tương thích 100% với các thương hiệu camera, đầu ghi và thiết bị số phổ biến trên thị trường.'
      },
      {
        icon: 'fas fa-bolt',
        title: 'Chống Sốc Điện & Bền Bỉ',
        desc: 'Bảo vệ mạch điện an toàn, chống sốc và chống tĩnh điện bảo toàn tối đa dữ liệu quan trọng.'
      }
    ];
  }

  // Camera chung
  return [
    {
      icon: 'fas fa-video',
      title: 'Độ Phân Giải Sắc Nét',
      desc: 'Cảm biến hình ảnh cao cấp đem lại khung hình chân thực, bắt trọn từng chi tiết biển số xe và gương mặt.'
    },
    {
      icon: 'fas fa-moon',
      title: 'Hồng Ngoại Ban Đêm Smart IR',
      desc: 'Tự động điều chỉnh cường độ sáng hồng ngoại theo khoảng cách, không bị lóa trắng khi đối tượng lại gần.'
    },
    {
      icon: 'fas fa-cloud-download-alt',
      title: 'Chuẩn Nén H.265+ Tiên Tiến',
      desc: 'Tiết kiệm đến 50% dung lượng thẻ nhớ và băng thông mạng so với chuẩn H.264 truyền thống.'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Vận Hành Ổn Định 24/7',
      desc: 'Linh kiện đạt tiêu chuẩn an ninh giám sát cao cấp, vận hành bền bỉ và chính xác suốt ngày đêm.'
    }
  ];
}

// Helper sinh Bảng Thông Số Kỹ Thuật (Specs Table) chính xác theo thiết bị
function getProductSpecs(product: any, type: string, brand: string) {
  const name = String(product?.name || '').toLowerCase();
  const sku = String(product?._id || product?.id || '').toUpperCase();

  if (type === 'switch') {
    const isPoE = name.includes('poe');
    const portCount = name.includes('8') ? '8 Cổng' : (name.includes('16') ? '16 Cổng' : (name.includes('24') ? '24 Cổng' : '5 Cổng'));
    const isGigabit = name.includes('1000') || name.includes('gigabit') || name.includes('ls1005g') || name.includes('cbs110');

    return [
      { label: 'Thương hiệu', value: brand, highlight: true },
      { label: 'Mã sản phẩm (SKU)', value: sku, highlight: false },
      { label: 'Số lượng cổng kết nối', value: `${portCount} RJ45 (Hỗ trợ Auto-MDI/MDIX)`, highlight: false },
      { label: 'Tốc độ truyền dữ liệu', value: isGigabit ? '10/100/1000 Mbps (Gigabit Auto-Negotiation)' : '10/100 Mbps Tự thích ứng', highlight: false },
      { label: 'Chuẩn mạng tương thích', value: 'IEEE 802.3, IEEE 802.3u, IEEE 802.3x', highlight: false },
      { label: 'Tính năng đặc biệt', value: isPoE ? 'Cấp nguồn PoE chuẩn IEEE 802.3af/at (tối đa 30W/cổng)' : 'Công nghệ Green Ethernet tiết kiệm điện đến 70%', highlight: false },
      { label: 'Chất liệu vỏ máy', value: name.includes('vỏ thép') || name.includes('cisco') ? 'Vỏ thép tản nhiệt công nghiệp cao cấp' : 'Vỏ nhựa ABS chống cháy cao cấp', highlight: false },
      { label: 'Nguồn điện cấp', value: isPoE ? '48V - 54V DC chuyên dụng cho PoE' : 'DC 5V / 9V / 12V chính hãng kèm theo', highlight: false },
      { label: 'Chế độ bảo hành', value: '24 tháng chính hãng (1 đổi 1 trong 30 ngày)', highlight: true, green: true }
    ];
  }

  if (type === 'router') {
    const isWifi6 = name.includes('wifi 6') || name.includes('ax');
    const speed = isWifi6 ? 'AX3000 (2402 Mbps trên 5GHz + 574 Mbps trên 2.4GHz)' : 'AC1200 (867 Mbps trên 5GHz + 300 Mbps trên 2.4GHz)';

    return [
      { label: 'Thương hiệu', value: brand, highlight: true },
      { label: 'Mã sản phẩm (SKU)', value: sku, highlight: false },
      { label: 'Chuẩn Wi-Fi hỗ trợ', value: isWifi6 ? 'Wi-Fi 6 (802.11ax/ac/n/a 5GHz & 802.11ax/n/b/g 2.4GHz)' : 'Wi-Fi 5 (802.11ac/n/a 5GHz & 802.11b/g/n 2.4GHz)', highlight: false },
      { label: 'Tốc độ không dây tối đa', value: speed, highlight: false },
      { label: 'Số lượng ăng-ten', value: '4 Ăng-ten ngoài đa hướng 5dBi độ lợi cao', highlight: false },
      { label: 'Cổng kết nối mạng', value: '1 Cổng WAN Gigabit + 3/4 Cổng LAN Gigabit RJ45', highlight: false },
      { label: 'Chuẩn bảo mật', value: 'WPA3-Personal, WPA2-PSK, Tường lửa SPI bảo vệ', highlight: false },
      { label: 'Chế độ hoạt động', value: 'Router Wi-Fi, Điểm truy cập (Access Point), Bộ mở rộng sóng (Repeater)', highlight: false },
      { label: 'Nguồn điện cấp', value: 'Adapter 12V DC - 1A/1.5A chính hãng', highlight: false },
      { label: 'Chế độ bảo hành', value: '24 tháng chính hãng (1 đổi 1 trong 30 ngày)', highlight: true, green: true }
    ];
  }

  if (type === 'dvr') {
    const channelCount = name.includes('8') ? '8 Kênh' : (name.includes('16') ? '16 Kênh' : '4 Kênh');

    return [
      { label: 'Thương hiệu', value: brand, highlight: true },
      { label: 'Mã sản phẩm (SKU)', value: sku, highlight: false },
      { label: 'Số kênh ghi hình', value: `${channelCount} Video đầu vào (Hỗ trợ camera IP & Analog/HDTVI/AHD)`, highlight: false },
      { label: 'Chuẩn nén video', value: 'H.265 Pro+ / H.265 / H.264+ (Tiết kiệm 80% dung lượng)', highlight: false },
      { label: 'Cổng xuất hình ảnh', value: '1 HDMI (Xuất hình 4K/Full HD) + 1 Cổng VGA đồng thời', highlight: false },
      { label: 'Hỗ trợ ổ cứng (HDD)', value: '1 Cổng SATA hỗ trợ dung lượng lên tới 6TB - 10TB', highlight: false },
      { label: 'Cổng mạng LAN', value: '1 Cổng RJ45 10/100 Mbps tự thích ứng', highlight: false },
      { label: 'Quản trị từ xa', value: 'Ứng dụng di động (iOS / Android) & Phần mềm máy tính miễn phí', highlight: false },
      { label: 'Nguồn điện cấp', value: '12V DC - 1.5A / 2A đi kèm máy', highlight: false },
      { label: 'Chế độ bảo hành', value: '24 tháng chính hãng (1 đổi 1 trong 30 ngày)', highlight: true, green: true }
    ];
  }

  if (type === 'camera_outdoor') {
    const resolution = name.includes('4mp') ? '4.0 Megapixel (2K QHD 2560x1440)' : (name.includes('3mp') ? '3.0 Megapixel (2K 2304x1296)' : '2.0 Megapixel (Full HD 1080P)');

    return [
      { label: 'Thương hiệu', value: brand, highlight: true },
      { label: 'Mã sản phẩm (SKU)', value: sku, highlight: false },
      { label: 'Độ phân giải cảm biến', value: resolution, highlight: false },
      { label: 'Góc nhìn & Ống kính', value: 'Ống kính 2.8mm / 3.6mm - Góc mở rộng 108°', highlight: false },
      { label: 'Tầm xa quan sát đêm', value: '30 Mét (Hồng ngoại Smart IR kết hợp LED trợ sáng có màu)', highlight: false },
      { label: 'Chuẩn kháng nước & bụi', value: 'IP67 / IP66 (Hoạt động hoàn hảo dưới mưa bão nhiệt đới)', highlight: false },
      { label: 'Tính năng AI thông minh', value: 'Nhận diện người AI, Báo động còi hú & Đèn chớp, Đàm thoại 2 chiều', highlight: false },
      { label: 'Lưu trữ dữ liệu', value: 'Hỗ trợ thẻ nhớ MicroSD tối đa 256GB hoặc Cloud lưu trữ', highlight: false },
      { label: 'Nguồn điện cấp', value: '12V DC - 1A / Hỗ trợ PoE (tùy phiên bản)', highlight: false },
      { label: 'Chế độ bảo hành', value: '24 tháng chính hãng (1 đổi 1 trong 30 ngày)', highlight: true, green: true }
    ];
  }

  if (type === 'camera_indoor') {
    const resolution = name.includes('2k') || name.includes('3mp') || name.includes('4mp') ? '2K Super HD / 3MP' : 'Full HD 1080P (1920x1080)';

    return [
      { label: 'Thương hiệu', value: brand, highlight: true },
      { label: 'Mã sản phẩm (SKU)', value: sku, highlight: false },
      { label: 'Khả năng xoay quét', value: 'Xoay ngang 355°, Xoay dọc 90° (Bao quát 360° không góc chết)', highlight: false },
      { label: 'Độ phân giải hình ảnh', value: resolution, highlight: false },
      { label: 'Tầm nhìn ban đêm', value: 'Hồng ngoại Smart IR 10 - 15 mét (Rõ nét không chói lóa)', highlight: false },
      { label: 'Âm thanh đàm thoại', value: 'Tích hợp Micro & Loa khử tiếng vang đàm thoại 2 chiều', highlight: false },
      { label: 'Tính năng thông minh', value: 'Theo dõi chuyển động Smart Tracking, Nhận diện tiếng khóc trẻ em', highlight: false },
      { label: 'Lưu trữ dữ liệu', value: 'Khe cắm thẻ nhớ MicroSD lên đến 256GB / Cloud bảo mật', highlight: false },
      { label: 'Nguồn điện cấp', value: 'DC 5V - 1A (Cổng Micro-USB / Type-C)', highlight: false },
      { label: 'Chế độ bảo hành', value: '24 tháng chính hãng (1 đổi 1 trong 30 ngày)', highlight: true, green: true }
    ];
  }

  if (type === 'accessory') {
    return [
      { label: 'Thương hiệu', value: brand, highlight: true },
      { label: 'Mã sản phẩm (SKU)', value: sku, highlight: false },
      { label: 'Phân loại thiết bị', value: 'Phụ kiện an ninh / Thiết bị lưu trữ chuyên dụng', highlight: false },
      { label: 'Đặc tính vận hành', value: 'Thiết kế chịu nhiệt, chống ẩm, hoạt động liên tục 24/7', highlight: false },
      { label: 'Khả năng tương thích', value: 'Tương thích 100% với hệ thống Camera, Router, Đầu ghi hình', highlight: false },
      { label: 'Chế độ bảo hành', value: '24 - 36 tháng chính hãng (1 đổi 1 trong 30 ngày)', highlight: true, green: true }
    ];
  }

  // Mặc định camera khác
  return [
    { label: 'Thương hiệu', value: brand, highlight: true },
    { label: 'Mã sản phẩm (SKU)', value: sku, highlight: false },
    { label: 'Độ phân giải hình ảnh', value: 'Full HD 1080P / 2K Ultra Clear', highlight: false },
    { label: 'Ống kính & Góc nhìn', value: '2.8mm - Góc quan sát rộng 108°', highlight: false },
    { label: 'Tầm quan sát hồng ngoại', value: '30 mét (Công nghệ Smart IR LED kép)', highlight: false },
    { label: 'Chuẩn bảo vệ thiết bị', value: 'IP67 (Chống nước và bụi hoàn toàn)', highlight: false },
    { label: 'Nguồn điện cấp', value: '12V DC / Hỗ trợ PoE chuẩn 802.3af', highlight: false },
    { label: 'Chế độ bảo hành', value: '24 tháng chính hãng (1 đổi 1 trong 30 ngày)', highlight: true, green: true }
  ];
}

// Helper sinh đoạn văn mô tả bổ sung chuẩn theo thiết bị
function getProductExtraDesc(product: any, type: string) {
  if (type === 'switch') {
    return 'Thiết bị chuyển mạch Switch mạng hiệu năng cao, cung cấp khả năng truyền tải dữ liệu ổn định và liền mạch cho hệ thống camera an ninh, máy tính văn phòng và thiết bị thông minh. Hỗ trợ tính năng cắm và chạy (Plug and Play) tiện lợi, tự động tương thích tốc độ và công nghệ Green Ethernet tiết kiệm năng lượng tối ưu.';
  }
  if (type === 'router') {
    return 'Bộ phát wifi router không dây tốc độ cao, tối ưu vùng phủ sóng mạnh mẽ xuyên qua các tầng lầu và vật cản. Hỗ trợ đa kết nối đồng thời với độ trễ siêu thấp, đảm bảo tín hiệu camera an ninh truyền về màn hình mượt mà không bị gián đoạn, đáp ứng tốt cho nhu cầu xem video 4K và làm việc trực tuyến.';
  }
  if (type === 'dvr') {
    return 'Đầu ghi hình kỹ thuật số chuyên dụng chuẩn giám sát an ninh 24/7, khả năng xử lý tín hiệu camera độ nét cao và quản lý tập trung nhiều kênh ghi hình. Tích hợp chuẩn nén tiên tiến tiết kiệm dung lượng lưu trữ, hỗ trợ xem trực tiếp và xem lại dữ liệu mượt mà trên điện thoại, máy tính bảng từ bất cứ đâu.';
  }
  if (type === 'camera_outdoor') {
    return 'Camera an ninh chuyên dụng lắp đặt ngoài trời với tiêu chuẩn bảo vệ chống bụi và nước nghiêm ngặt, vận hành ổn định trước nắng mưa và thời tiết khắc nghiệt. Tích hợp cảm biến quang học thế hệ mới cùng đèn hồng ngoại / trợ sáng ban đêm, đảm bảo an ninh tối đa cho ngôi nhà và khuôn viên của bạn.';
  }
  if (type === 'camera_indoor') {
    return 'Camera thông minh trong nhà sở hữu thiết kế trang nhã, công nghệ xoay quét góc nhìn toàn cảnh cùng tính năng đàm thoại hai chiều âm thanh trung thực. Thiết bị cho phép bạn theo dõi con nhỏ, người già hoặc quản lý cửa hàng mọi lúc mọi nơi thông qua ứng dụng trên điện thoại vô cùng dễ dàng.';
  }
  if (type === 'accessory') {
    return 'Phụ kiện cao cấp được thiết kế đồng bộ, đảm bảo tính tương thích và độ bền cao nhất cho hệ thống thiết bị an ninh, mang lại sự an tâm tuyệt đối trong quá trình sử dụng lâu dài.';
  }
  return 'Được trang bị vi xử lý xử lý hình ảnh thế hệ mới, thiết bị đem lại chất lượng ghi hình vượt trội trong mọi điều kiện ánh sáng. Vỏ ngoài gia công bằng vật liệu cao cấp đạt tiêu chuẩn quốc tế, phù hợp lắp đặt cho nhà ở, văn phòng, cửa hàng và xưởng sản xuất.';
}

// Helper sinh danh sách ưu đãi quà tặng phù hợp từng sản phẩm
function getProductGiftList(product: any, type: string) {
  if (type === 'switch') {
    return [
      'Miễn phí tư vấn giải pháp mạng & hỗ trợ sơ đồ kết nối camera',
      'Tặng kèm dây nhảy mạng đúc sẵn Cat6 cao cấp chống nhiễu',
      'Freeship toàn quốc cho đơn hàng từ 500.000đ',
      'Bảo hành chính hãng 24 tháng (1 đổi 1 trong 30 ngày)'
    ];
  }
  if (type === 'router') {
    return [
      'Miễn phí cài đặt cấu hình tên Wi-Fi & mật khẩu theo yêu cầu',
      'Tặng kèm dây cáp mạng RJ45 bấm sẵn đúc chất lượng cao',
      'Giao hàng hỏa tốc trong 2H tại nội thành',
      'Hỗ trợ kỹ thuật cấu hình từ xa 24/7 trọn đời thiết bị'
    ];
  }
  if (type === 'dvr') {
    return [
      'Tặng kèm chuột quang điều khiển + cáp nguồn & cáp SATA ổ cứng',
      'Miễn phí cấu hình cài đặt xem qua điện thoại trọn đời máy',
      'Freeship toàn quốc - Kiểm tra hàng trước khi thanh toán',
      'Bảo hành 24 tháng chính hãng (1 đổi 1 trong 30 ngày)'
    ];
  }
  if (type === 'accessory') {
    return [
      'Cam kết linh kiện chính hãng 100%, kiểm tra kỹ trước khi giao',
      'Freeship toàn quốc cho đơn hàng từ 500.000đ',
      'Bảo hành đổi mới 1-1 nhanh chóng nếu phát sinh lỗi',
      'Tư vấn kỹ thuật tương thích chuẩn xác cho mọi thiết bị'
    ];
  }
  return [
    'Miễn phí công tư vấn & khảo sát vị trí lắp đặt tận nơi',
    'Tặng kèm bộ nguồn adapter chính hãng + phụ kiện chân đế & ốc vít',
    'Freeship toàn quốc cho đơn hàng từ 500.000đ',
    'Hỗ trợ kỹ thuật cài đặt từ xa 24/7 trọn đời thiết bị'
  ];
}

// Helper lấy danh sách đầy đủ các ảnh góc nhìn cho toàn bộ sản phẩm
function getProductImages(product: any, type: string): string[] {
  if (product?.images && Array.isArray(product.images) && product.images.length > 1) {
    return product.images;
  }

  const mainImg = product?.image || '/uploads/32.jpg';
  const name = String(product?.name || '').toLowerCase();
  const list: string[] = [mainImg];

  // 1. Imou Ranger 2 (A22EP)
  if (name.includes('ranger 2') || name.includes('a22ep')) {
    list.push('/uploads/gallery/imou_ranger2_angle.png');
    list.push('/uploads/gallery/indoor_rear.jpg');
    list.push('/uploads/gallery/indoor_kit.jpg');
    return list;
  }

  // 2. Camera Ezviz C6N
  if (name.includes('c6n')) {
    list.push('/uploads/gallery/imou_ranger2_angle.png');
    list.push('/uploads/gallery/indoor_rear.jpg');
    list.push('/uploads/gallery/indoor_kit.jpg');
    return list;
  }

  // 3. Switch Mạng (TP-Link, PoE Hikvision, Tenda, Cisco)
  if (type === 'switch') {
    list.push('/uploads/gallery/switch_rear.jpg');
    list.push('/uploads/gallery/switch_angle.jpg');
    list.push('/uploads/gallery/switch_box.jpg');
    return list;
  }

  // 4. Router Wi-Fi (Archer AX53, Totolink)
  if (type === 'router') {
    list.push('/uploads/gallery/router_back.jpg');
    list.push('/uploads/gallery/indoor_kit.jpg');
    return list;
  }

  // 5. Đầu Ghi Hình (Hikvision, Vantech)
  if (type === 'dvr') {
    list.push('/uploads/gallery/dvr_back.jpg');
    list.push('/uploads/gallery/switch_angle.jpg');
    list.push('/uploads/gallery/indoor_kit.jpg');
    return list;
  }

  // 6. Camera Ngoài Trời (Bullet 2C, OutPro, C8C, Cruiser...)
  if (type === 'camera_outdoor') {
    list.push('/uploads/gallery/outdoor_bracket.jpg');
    list.push('/uploads/gallery/outdoor_ports.jpg');
    list.push('/uploads/gallery/indoor_kit.jpg');
    return list;
  }

  // 7. Camera Trong Nhà (Kbone, Tapo, Xiaomi, FPT, Viettel...)
  if (type === 'camera_indoor') {
    list.push('/uploads/gallery/indoor_rear.jpg');
    list.push('/uploads/gallery/imou_ranger2_angle.png');
    list.push('/uploads/gallery/indoor_kit.jpg');
    return list;
  }

  // Mặc định cho mọi sản phẩm khác
  list.push('/uploads/gallery/indoor_rear.jpg');
  list.push('/uploads/gallery/switch_angle.jpg');
  return list;
}

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter(); 
  const { addToCart, totalItems } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc'); 
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false); 
  
  // STATE LẤY DỮ LIỆU
  const [user, setUser] = useState<any>(null);
  const initialProduct = db.products.find((p: any) => String(p.id) === String(params?.id)) || null;
  const [product, setProduct] = useState<any>(initialProduct);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(false);

  // State cho Form Đánh giá mới
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(0); 
  const [hoverRating, setHoverRating] = useState(0); 
  const [newComment, setNewComment] = useState('');
  const [reviewImage, setReviewImage] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // STATE SALE VÀ GIẢM GIÁ TỪ ADMIN
  const [isSaleDay, setIsSaleDay] = useState(false);
  const [saleDiscount, setSaleDiscount] = useState(0);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) setUser(JSON.parse(loggedInUser));

    const fetchData = async () => {
      try {
        const timestamp = new Date().getTime();
        
        const [prodRes, reviewRes, setRes] = await Promise.all([
          fetch(`/api/products?t=${timestamp}`).catch(() => null),
          fetch(`/api/reviews?t=${timestamp}`).catch(() => null),
          fetch(`/api/settings?t=${timestamp}`).catch(() => null)
        ]);

        let allProducts: any[] = db.products || [];
        if (prodRes && prodRes.ok) {
          const pData = await prodRes.json();
          if (Array.isArray(pData) && pData.length > 0) {
            allProducts = pData;
          }
        }

        const currentProduct = allProducts.find((p: any) => String(p._id || p.id) === String(params?.id)) 
          || db.products.find((p: any) => String(p.id) === String(params?.id));
        
        if (currentProduct) {
          setProduct(currentProduct);
          const related = allProducts
            .filter((p: any) => String(p.category_id) === String(currentProduct.category_id) && String(p._id || p.id) !== String(params?.id))
            .slice(0, 4);
          setRelatedProducts(related);
        }

        let fetchedReviews: any[] = [];
        if (reviewRes && reviewRes.ok) {
          try {
            const rData = await reviewRes.json();
            if (Array.isArray(rData)) fetchedReviews = rData;
          } catch (e) {
            console.error("Lỗi parse reviews:", e);
          }
        }

        // Kết hợp dữ liệu đánh giá từ Database MongoDB và db.json dự phòng
        const combinedReviews: any[] = [...fetchedReviews];
        if (db.reviews && Array.isArray(db.reviews)) {
          for (const dbr of db.reviews) {
            const alreadyExists = combinedReviews.some((cr: any) => 
              String(cr._id || cr.id) === String(dbr.id) ||
              (cr.comment === dbr.comment && String(cr.username || '') === String(dbr.user_id || '') && Number(cr.rating) === Number(dbr.rating))
            );
            if (!alreadyExists) {
              combinedReviews.push({
                ...dbr,
                customer_name: dbr.user_id === '11' ? 'bao' : (dbr.user_id === '1' ? 'ADMIN' : 'Khách hàng'),
                createdAt: dbr.created_at
              });
            }
          }
        }

        // Lọc chuẩn xác cho sản phẩm hiện tại: khớp với param id, Mongo _id hoặc db.json id
        const prodMongoId = currentProduct?._id ? String(currentProduct._id) : '';
        const prodDbId = currentProduct?.id ? String(currentProduct.id) : '';
        const paramId = String(params?.id || '');

        const currentReviews = combinedReviews.filter((r: any) => {
          const rProdId = String(r.product_id || r.productId || '');
          if (!rProdId) return false;
          return rProdId === paramId || 
                 (prodMongoId && rProdId === prodMongoId) || 
                 (prodDbId && rProdId === prodDbId);
        });

        setReviews(currentReviews);

        if (setRes && setRes.ok) {
          const sData = await setRes.json();
          if (sData) {
            const discount = Number(sData.saleDiscount) || 0;
            setSaleDiscount(discount);
            
            const currentDay = new Date().getDate();
            const daysArray = (sData.saleDays || "").split(',').map((d: string) => parseInt(d.trim()));
            
            if (daysArray.includes(currentDay) && discount > 0) {
              setIsSaleDay(true);
            }
          }
        }

      } catch (error) {
        console.error("Lỗi tải dữ liệu sản phẩm:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params?.id) {
      fetchData();
    }
  }, [params?.id]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser'); 
    window.location.href = '/'; 
  };

  const handleReviewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Vui lòng đăng nhập để gửi đánh giá!");
    if (newRating === 0) return alert("Vui lòng chọn số sao đánh giá cho sản phẩm!");
    if (!newComment.trim()) return alert("Vui lòng nhập nội dung đánh giá!");

    setIsSubmittingReview(true);
    
    const reviewData = {
      product_id: String(product?._id || product?.id || params?.id),
      username: user.username,
      customer_name: user.full_name || user.username,
      rating: newRating,
      comment: newComment,
      image: reviewImage, 
      status: "Đã duyệt" 
    };

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });

      if (res.ok) {
        const savedReview = await res.json();
        setReviews([savedReview, ...reviews]);
        setShowReviewForm(false);
        setNewComment('');
        setNewRating(0); 
        setReviewImage(''); 
        alert("🎉 Cảm ơn bạn đã đánh giá sản phẩm!");
      } else {
        alert("Có lỗi xảy ra khi lưu đánh giá.");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ API!");
    }
    setIsSubmittingReview(false);
  };

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / totalReviews).toFixed(1) 
    : null;

  if (isLoading) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "18px", fontWeight: "700", color: "#0284c7" }}>
        <i className="fas fa-spinner fa-spin" style={{ marginRight: "12px", fontSize: "24px" }}></i> Đang tải thông tin sản phẩm...
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <i className="fas fa-box-open" style={{ fontSize: '64px', color: '#bae6fd', marginBottom: '20px' }}></i>
        <h1 style={{ fontSize: '28px', color: '#0c4a6e', marginBottom: '16px', fontWeight: '800' }}>Không tìm thấy sản phẩm!</h1>
        <p style={{ color: '#64748b', marginBottom: '25px' }}>Sản phẩm này có thể đã ngừng kinh doanh hoặc đường dẫn không chính xác.</p>
        <Link href="/" className="btn-hero-primary" style={{ background: '#0284c7', color: 'white' }}>
          <i className="fas fa-arrow-left"></i> Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const addToFavorite = (productData: any) => {
    if (!user) {
      alert("Vui lòng đăng nhập để lưu vào mục yêu thích!");
      router.push('/login');
      return;
    }
    const saved = localStorage.getItem('camera_bn_favs');
    let favList = saved ? JSON.parse(saved) : [];
    const exists = favList.find((item: any) => String(item._id || item.id) === String(productData._id || productData.id));
    
    if(!exists) {
      favList.push(productData);
      localStorage.setItem('camera_bn_favs', JSON.stringify(favList));
      alert("❤️ Đã thêm sản phẩm vào danh sách yêu thích!");
    } else { 
      alert("Sản phẩm này đã có trong danh sách yêu thích của bạn!"); 
    }
  };
  
  const handleDecrease = () => { if (quantity > 1) setQuantity(quantity - 1); };
  const handleIncrease = () => { if (quantity < Number(product.quantity)) setQuantity(quantity + 1); };

  const currentPrice = isSaleDay && saleDiscount > 0 
    ? Number(product.price) * (1 - saleDiscount / 100) 
    : Number(product.price);

  // Tính toán dữ liệu thông minh theo danh mục sản phẩm
  const productType = getProductType(product);
  const productBrand = getProductBrand(product);
  const highlights = getProductHighlights(product, productType);
  const specs = getProductSpecs(product, productType, productBrand);
  const extraDesc = getProductExtraDesc(product, productType);
  const giftLines = getProductGiftList(product, productType);
  const categoryObj = db.categories?.find((c: any) => String(c.id) === String(product?.category_id));
  const categoryName = categoryObj?.name || (
    productType === 'switch' ? 'Switch Mạng' :
    productType === 'router' ? 'Router Wi-Fi' :
    productType === 'dvr' ? 'Đầu Ghi Hình' :
    productType === 'accessory' ? 'Phụ Kiện An Ninh' : 'Camera Quan Sát'
  );

  // Danh sách hình ảnh đa góc độ phong phú của sản phẩm
  const productImages = getProductImages(product, productType);
  const currentMainImg = productImages[activeImageIndex] || product.image;

  const handlePrevImg = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveImageIndex(prev => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNextImg = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveImageIndex(prev => (prev === productImages.length - 1 ? 0 : prev + 1));
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
      <Header user={user} onLogout={handleLogout} />

      {/* MAIN CONTAINER */}
      <main className="product-detail-main">
        {/* Breadcrumb */}
        <div className="product-breadcrumb">
          <Link href="/">Trang chủ</Link>
          <span style={{ color: '#cbd5e1' }}>›</span>
          <span style={{ color: '#0369a1' }}>{categoryName}</span>
          <span style={{ color: '#cbd5e1' }}>›</span>
          <span style={{ color: '#0284c7', fontWeight: '700' }}>{product.name}</span>
        </div>

        {/* KHUNG SẢN PHẨM CHÍNH (PRODUCT SHOWCASE) */}
        <div className="product-showcase-card">
          {/* Sale badge */}
          {isSaleDay && saleDiscount > 0 && (
            <div className="product-sale-badge">
              🔥 GIẢM NGAY {saleDiscount}% HÔM NAY
            </div>
          )}

          {/* CỘT ẢNH SẢN PHẨM CHÍNH (GALLERY SLIDER & THUMBNAILS) */}
          <div className="product-gallery-col">
            <div className="product-main-img-box">
              <img 
                src={currentMainImg} 
                alt={product.name} 
              />

              {/* Nút lướt ảnh trái / phải */}
              {productImages.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevImg}
                    className="product-img-nav-btn prev"
                    title="Ảnh trước"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>

                  <button 
                    onClick={handleNextImg}
                    className="product-img-nav-btn next"
                    title="Ảnh kế tiếp"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </>
              )}

              {/* Icon phóng to ảnh ở góc dưới bên trái */}
              <button 
                onClick={() => setIsZoomModalOpen(true)}
                className="product-zoom-trigger-btn"
                title="Phóng to ảnh"
              >
                <i className="fas fa-expand-alt"></i>
              </button>

              {/* Tag số thứ tự ảnh */}
              <div className="product-img-counter-tag">
                <i className="fas fa-images"></i> {activeImageIndex + 1} / {productImages.length}
              </div>
            </div>

            {/* DẢI THUMBNAILS THU NHỎ BÊN DƯỚI */}
            {productImages.length > 1 && (
              <div className="product-thumbnails-row">
                {productImages.map((img, idx) => {
                  const isActive = activeImageIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`product-thumb-btn${isActive ? " is-active" : ""}`}
                      title={`Xem góc ảnh ${idx + 1}`}
                    >
                      <img 
                        src={img} 
                        alt={`${product.name} góc ${idx + 1}`} 
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Dải thông số nhanh */}
            <div className="product-quick-specs-grid">
              <div className="product-quick-spec-item">
                <i className="fas fa-award"></i>
                <span className="product-quick-spec-title">Chính Hãng</span>
                <span className="product-quick-spec-desc">Bảo hành 24T</span>
              </div>
              <div className="product-quick-spec-item">
                <i className="fas fa-bolt"></i>
                <span className="product-quick-spec-title">Giao Hỏa Tốc</span>
                <span className="product-quick-spec-desc">Nhận trong 2H</span>
              </div>
              <div className="product-quick-spec-item">
                <i className="fas fa-shield-alt"></i>
                <span className="product-quick-spec-title">Đổi Mới 1-1</span>
                <span className="product-quick-spec-desc">Trong 30 ngày</span>
              </div>
            </div>
          </div>

          {/* CỘT THÔNG TIN VÀ NÚT MUA HÀNG */}
          <div className="product-info-col">
            <div className="product-info-topbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className="product-sku-tag">
                  SKU: {String(product._id || product.id).slice(-6).toUpperCase()}
                </span>
                <span className="product-stock-tag">
                  <i className="fas fa-check-circle"></i> Còn hàng
                </span>
              </div>

              <button 
                onClick={() => addToFavorite(product)}
                className="product-fav-btn"
                title="Lưu vào yêu thích"
              >
                <i className="fas fa-heart"></i>
              </button>
            </div>

            <h1 className="product-title-heading">
              {product.name}
            </h1>

            {/* Đánh giá & đã bán */}
            <div className="product-rating-row">
              {totalReviews > 0 && avgRating ? (
                <>
                  <div style={{ color: '#f59e0b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontWeight: '800', color: '#0f172a' }}>{avgRating}</span>
                    <span>{'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}</span>
                  </div>
                  <span>•</span>
                  <button 
                    onClick={() => setActiveTab('reviews')}
                    style={{ background: 'transparent', border: 'none', color: '#0284c7', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {totalReviews} đánh giá khách hàng
                  </button>
                </>
              ) : (
                <>
                  <div style={{ color: '#94a3b8', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#cbd5e1' }}>☆☆☆☆☆</span>
                    <span style={{ color: '#64748b', fontWeight: '600', fontSize: '13px' }}>Chưa có đánh giá</span>
                  </div>
                  <span>•</span>
                  <button 
                    onClick={() => {
                      setActiveTab('reviews');
                      setShowReviewForm(true);
                    }}
                    style={{ background: 'transparent', border: 'none', color: '#0284c7', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Viết đánh giá đầu tiên
                  </button>
                </>
              )}
              <span>•</span>
              <span>Đã bán <strong>{product.sold || 48}</strong></span>
            </div>

            {/* Khung Giá bán */}
            <div className="product-price-box">
              <span className="product-current-price">
                {currentPrice.toLocaleString('vi-VN')} đ
              </span>
              {isSaleDay && saleDiscount > 0 && (
                <span className="product-old-price">
                  {Number(product.price).toLocaleString('vi-VN')} đ
                </span>
              )}
              <span className="product-vat-tag">
                [Đã bao gồm VAT]
              </span>
            </div>

            {/* HỘP QUÀ TẶNG & KHUYẾN MÃI ĐẶC QUYỀN */}
            <div className="product-gift-box">
              <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0369a1', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-gift" style={{ color: '#0284c7', fontSize: '16px' }}></i> ƯU ĐÃI ĐẶC BIỆT KHI MUA HÀNG HÔM NAY
              </div>
              <ul style={{ fontSize: '13px', color: '#334155', lineHeight: '1.7', paddingLeft: '4px', listStyleType: 'none', margin: 0 }}>
                {giftLines.map((gift, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ color: '#0284c7', fontSize: '12px' }}>🎁</span>
                    <span>{gift}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Chọn số lượng */}
            <div className="product-qty-row">
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#0c4a6e' }}>Số lượng:</span>
              <div className="product-qty-control">
                <button 
                  onClick={handleDecrease}
                  className="product-qty-btn"
                >
                  -
                </button>
                <input 
                  type="text" 
                  value={quantity} 
                  readOnly 
                  className="product-qty-input"
                />
                <button 
                  onClick={handleIncrease}
                  className="product-qty-btn"
                >
                  +
                </button>
              </div>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                (Còn {product.quantity} sản phẩm trong kho)
              </span>
            </div>

            {/* Nút hành động */}
            <div className="product-actions-row">
              {Number(product.quantity) > 0 ? (
                <>
                  <button 
                    onClick={() => {
                      if (!user) {
                        alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
                        router.push('/login');
                      } else {
                        addToCart(product, quantity, true);
                        alert(`🎉 Đã thêm ${quantity} sản phẩm vào giỏ hàng thành công!`);
                      }
                    }}
                    className="btn-add-to-cart"
                  >
                    <i className="fas fa-cart-plus"></i> THÊM VÀO GIỎ
                  </button>

                  <button 
                    onClick={() => {
                      if (!user) {
                        alert("Vui lòng đăng nhập để mua hàng!");
                        router.push('/login');
                      } else {
                        addToCart(product, quantity, false);
                        router.push('/cart');
                      }
                    }}
                    className="btn-card-action btn-buy-now"
                  >
                    <i className="fas fa-bolt"></i> MUA NGAY (GIAO 2H)
                  </button>
                </>
              ) : (
                <button disabled className="btn-card-action" style={{ width: '100%', padding: '14px', background: '#cbd5e1', cursor: 'not-allowed' }}>
                  SẢN PHẨM TẠM HẾT HÀNG
                </button>
              )}
            </div>
          </div>
        </div>

        {/* TABS NỘI DUNG CHI TIẾT (MÔ TẢ - THÔNG SỐ - ĐÁNH GIÁ) */}
        <div className="product-tabs-card">
          {/* Tab Header */}
          <div className="product-tabs-header">
            <button 
              onClick={() => setActiveTab('desc')}
              className={`product-tab-btn${activeTab === 'desc' ? " is-active" : ""}`}
            >
              <i className="fas fa-file-alt"></i> <span>Mô Tả Chi Tiết</span>
            </button>

            <button 
              onClick={() => setActiveTab('specs')}
              className={`product-tab-btn${activeTab === 'specs' ? " is-active" : ""}`}
            >
              <i className="fas fa-cogs"></i> <span>Thông Số Kỹ Thuật</span>
            </button>

            <button 
              onClick={() => setActiveTab('reviews')}
              className={`product-tab-btn${activeTab === 'reviews' ? " is-active" : ""}`}
            >
              <i className="fas fa-star"></i> <span>Đánh Giá ({totalReviews})</span>
            </button>
          </div>

          {/* Tab Body */}
          <div className="product-tab-body">
            
            {/* TAB 1: MÔ TẢ CHI TIẾT */}
            {activeTab === 'desc' && (
              <div>
                <h3 style={{ fontSize: '20px', color: '#0c4a6e', fontWeight: '800', marginBottom: '16px' }}>
                  Giới thiệu tổng quan về {product.name}
                </h3>
                <p style={{ marginBottom: '16px', color: '#334155', fontSize: '15.5px', fontWeight: '500', lineHeight: '1.8' }}>
                  {product.description || `Sản phẩm ${product.name} chính hãng phân phối bởi CIOs Camera, đáp ứng tiêu chuẩn chất lượng và độ bền cao.`}
                </p>
                <p style={{ marginBottom: '25px', color: '#475569', lineHeight: '1.8' }}>
                  {extraDesc}
                </p>

                {/* ẢNH MINH HỌA NẰM CHÍNH GIỮA */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '40px auto', 
                  textAlign: 'center',
                  width: '100%'
                }}>
                  <div style={{ 
                    maxWidth: '520px', 
                    width: '100%', 
                    background: '#ffffff', 
                    borderRadius: '20px', 
                    padding: '30px', 
                    boxShadow: '0 12px 35px -5px rgba(2, 132, 199, 0.15)', 
                    border: '1.5px solid #bae6fd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto'
                  }}>
                    <img 
                      src={currentMainImg} 
                      alt={product.name} 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '380px', 
                        objectFit: 'contain', 
                        margin: '0 auto', 
                        display: 'block',
                        transition: 'all 0.3s ease'
                      }} 
                    />
                  </div>
                  <span style={{ fontSize: '13px', color: '#64748b', marginTop: '12px', fontStyle: 'italic' }}>
                    Hình ảnh thiết kế chi tiết của {product.name} chính hãng
                  </span>
                </div>

                {/* KHỐI 4 TÍNH NĂNG NỔI BẬT THEO LOẠI THIẾT BỊ */}
                <h3 style={{ fontSize: '18px', color: '#0c4a6e', fontWeight: '800', margin: '35px 0 16px' }}>
                  Điểm Nổi Bật Vượt Trội
                </h3>
                <div className="product-highlights-grid">
                  {highlights.map((h, i) => (
                    <div key={i} className="product-highlight-item">
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#0284c7', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
                        <i className={h.icon}></i>
                      </div>
                      <strong style={{ display: 'block', fontSize: '15px', color: '#0c4a6e', marginBottom: '6px' }}>{h.title}</strong>
                      <p style={{ margin: 0, fontSize: '13.5px', color: '#475569' }}>{h.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: THÔNG SỐ KỸ THUẬT */}
            {activeTab === 'specs' && (
              <div className="product-specs-table-wrapper">
                <table className="product-specs-table">
                  <tbody>
                    {specs.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: idx < specs.length - 1 ? '1px solid #e0f2fe' : 'none', background: idx % 2 === 0 ? '#f0f9ff' : '#ffffff' }}>
                        <td style={{ width: '35%', fontWeight: '700', color: '#0c4a6e', background: idx % 2 === 1 ? '#f8fafc' : undefined }}>
                          {item.label}
                        </td>
                        <td style={{ 
                          color: (item as any).green ? '#16a34a' : (item.highlight ? '#0284c7' : '#1e293b'), 
                          fontWeight: (item as any).green || item.highlight ? '800' : '500' 
                        }}>
                          {item.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 3: ĐÁNH GIÁ KHÁCH HÀNG */}
            {activeTab === 'reviews' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '40px', marginBottom: '35px', paddingBottom: '30px', borderBottom: '1.5px solid #e0f2fe', flexWrap: 'wrap' }}>
                  
                  {totalReviews > 0 && avgRating ? (
                    <div style={{ textAlign: 'center', minWidth: '140px', padding: '20px', background: '#f0f9ff', borderRadius: '16px', border: '1px solid #bae6fd' }}>
                      <div style={{ fontSize: '48px', fontWeight: '900', color: '#0284c7', lineHeight: '1' }}>{avgRating}</div>
                      <div style={{ color: '#f59e0b', fontSize: '18px', margin: '8px 0' }}>
                        {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>Dựa trên {totalReviews} đánh giá</div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', minWidth: '140px', padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1.5px solid #e2e8f0' }}>
                      <div style={{ fontSize: '40px', fontWeight: '900', color: '#94a3b8', lineHeight: '1' }}>0.0</div>
                      <div style={{ color: '#cbd5e1', fontSize: '18px', margin: '8px 0' }}>
                        ☆☆☆☆☆
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>Chưa có đánh giá</div>
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: '260px' }}>
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = reviews.filter(r => Number(r.rating || 5) === star).length;
                      const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                      return (
                        <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '8px', fontSize: '13px', color: '#475569' }}>
                          <span style={{ width: '45px', fontWeight: '700' }}>{star} sao</span>
                          <div style={{ flex: 1, background: '#f1f5f9', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${percent}%`, background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', height: '100%', borderRadius: '4px', transition: 'width 0.3s ease' }}></div>
                          </div>
                          <span style={{ width: '25px', textAlign: 'right', fontWeight: '600' }}>{count}</span>
                        </div>
                      )
                    })}
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '12px' }}>Bạn đã trải nghiệm thiết bị này?</p>
                    <button 
                      onClick={() => {
                        if (!user) { alert("Vui lòng đăng nhập để gửi đánh giá!"); router.push('/login'); return; }
                        setShowReviewForm(!showReviewForm);
                      }} 
                      className="btn-card-action"
                      style={{ padding: '12px 24px', fontSize: '14px' }}
                    >
                      {showReviewForm ? 'Hủy bỏ' : 'Viết Đánh Giá Của Bạn'}
                    </button>
                  </div>
                </div>

                {/* FORM GỬI ĐÁNH GIÁ */}
                {showReviewForm && (
                  <form onSubmit={handleSubmitReview} style={{ background: '#f8fafc', padding: '25px', borderRadius: '16px', border: '1.5px solid #bae6fd', marginBottom: '35px' }}>
                    <h4 style={{ margin: '0 0 16px 0', color: '#0c4a6e', fontSize: '16px', fontWeight: '800' }}>Gửi Nhận Xét & Đánh Giá Của Bạn</h4>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#0c4a6e' }}>Đánh giá chất lượng:</span>
                      <div style={{ display: 'flex', gap: '6px', fontSize: '26px', cursor: 'pointer' }} onMouseLeave={() => setHoverRating(0)}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <i 
                            key={star} 
                            className={star <= (hoverRating || newRating) ? "fas fa-star" : "far fa-star"} 
                            style={{ color: star <= (hoverRating || newRating) ? '#f59e0b' : '#cbd5e1' }}
                            onClick={() => setNewRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                          ></i>
                        ))}
                      </div>
                      <span style={{ fontSize: '13px', color: newRating > 0 ? '#0284c7' : '#94a3b8', fontWeight: '700' }}>
                        {newRating === 0 ? 'Vui lòng chọn số sao' : `${newRating} Sao - Rất hài lòng`}
                      </span>
                    </div>

                    <textarea 
                      required 
                      value={newComment} 
                      onChange={e => setNewComment(e.target.value)} 
                      placeholder="Hãy chia sẻ chi tiết trải nghiệm của bạn (chất lượng hình ảnh, độ mượt khi xem trên điện thoại, dịch vụ giao hàng...)" 
                      style={{ width: '100%', height: '110px', padding: '14px', borderRadius: '10px', border: '1.5px solid #bae6fd', outline: 'none', fontSize: '14px', resize: 'vertical', marginBottom: '15px' }}
                    ></textarea>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'white', border: '1.5px solid #bae6fd', borderRadius: '8px', fontSize: '13px', color: '#0284c7', fontWeight: '700' }}>
                        <i className="fas fa-camera"></i> {reviewImage ? 'Đã đính kèm ảnh' : 'Đính kèm hình ảnh'}
                        <input type="file" accept="image/*" onChange={handleReviewImageUpload} style={{ display: 'none' }} />
                      </label>

                      <button type="submit" disabled={isSubmittingReview} className="btn-card-action" style={{ padding: '12px 28px', fontSize: '14px' }}>
                        {isSubmittingReview ? 'ĐANG GỬI...' : 'HOÀN TẤT & ĐĂNG BÌNH LUẬN'}
                      </button>
                    </div>

                    {reviewImage && (
                      <div style={{ marginTop: '12px', position: 'relative', display: 'inline-block' }}>
                        <img src={reviewImage} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #bae6fd' }} />
                        <button type="button" onClick={() => setReviewImage('')} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px' }}>&times;</button>
                      </div>
                    )}
                  </form>
                )}

                {/* DANH SÁCH BÌNH LUẬN */}
                <h4 style={{ fontSize: '17px', color: '#0c4a6e', fontWeight: '800', marginBottom: '20px' }}>
                  Bình Luận Từ Khách Hàng
                </h4>
                
                {reviews.length === 0 ? (
                  <div style={{ color: '#64748b', fontStyle: 'italic', textAlign: 'center', padding: '30px', background: '#f8fafc', borderRadius: '12px' }}>
                    Chưa có bài đánh giá nào cho sản phẩm này. Hãy là người đầu tiên trải nghiệm và để lại nhận xét nhé!
                  </div>
                ) : (
                  reviews.map((r, index) => {
                    const rName = r.customer_name || r.customer || r.username || 'Khách hàng';
                    const rRating = Number(r.rating || 5);
                    const rDate = r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : 'Mới đây';

                    return (
                      <div key={index} style={{ display: 'flex', gap: '16px', marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ width: '46px', height: '46px', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '17px', flexShrink: 0 }}>
                          {rName.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '800', fontSize: '14.5px', color: '#0f172a' }}>{rName}</span>
                            <span style={{ fontSize: '11px', background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>
                              <i className="fas fa-check-circle"></i> Đã mua tại CIOs Camera
                            </span>
                          </div>
                          
                          <div style={{ color: '#f59e0b', fontSize: '12.5px', marginBottom: '6px' }}>
                             {'★'.repeat(rRating)}{'☆'.repeat(5 - rRating)}
                          </div>
                          
                          <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6', margin: '4px 0' }}>{r.comment || r.content}</p>
                          
                          {r.image && (
                            <div style={{ marginTop: '10px' }}>
                              <img src={r.image} alt="Review attachment" style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #bae6fd', cursor: 'pointer' }} onClick={() => window.open(r.image, '_blank')} />
                            </div>
                          )}

                          <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '8px' }}>
                            Đánh giá lúc {rDate}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* 4. SẢN PHẨM TƯƠNG TỰ (GỢI Ý CÙNG DANH MỤC) */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <div className="section-header-modern">
              <div className="section-title-modern">
                <span className="title-accent"></span>
                Sản Phẩm Tương Tự
              </div>
              <span style={{ fontSize: '13px', color: '#0284c7', fontWeight: '700' }}>
                Cùng danh mục thiết bị
              </span>
            </div>

            <div className="products-grid-modern">
              {relatedProducts.map((p) => (
                <div className="product-card-modern" key={p._id || p.id}>
                  {isSaleDay && saleDiscount > 0 && <div className="card-badge-discount">-{saleDiscount}%</div>}
                  
                  <div className="card-img-wrapper">
                    <Link href={`/product/${p._id || p.id}`}>
                      <img src={p.image} alt={p.name} />
                    </Link>
                  </div>
                  
                  <div className="card-info-content">
                    <Link href={`/product/${p._id || p.id}`}>
                      <h3 className="card-product-title">{p.name}</h3>
                    </Link>
                    
                    <div className="card-price-container">
                      {isSaleDay && saleDiscount > 0 ? (
                        <>
                          <span className="current-price">
                            {(Number(p.price) * (1 - saleDiscount / 100)).toLocaleString('vi-VN')} đ
                          </span>
                          <span className="old-price">
                            {Number(p.price).toLocaleString('vi-VN')} đ
                          </span>
                        </>
                      ) : (
                        <span className="current-price">
                          {Number(p.price).toLocaleString('vi-VN')} đ
                        </span>
                      )}
                    </div>
                    
                    <div className="card-stock-label">
                      <i className="fas fa-check-circle"></i> Sẵn hàng: {p.quantity || 10} cái
                    </div>

                    <Link href={`/product/${p._id || p.id}`} className="btn-card-action" style={{ textDecoration: 'none' }}>
                      <i className="fas fa-eye"></i> Xem Chi Tiết
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* FLOATING BUTTONS */}
      <FloatingActions />

      {/* FOOTER */}
      <Footer />

      {/* MODAL PHÓNG TO HÌNH ẢNH TOÀN MÀN HÌNH (LIGHTBOX ZOOM) */}
      {isZoomModalOpen && (
        <div 
          onClick={() => setIsZoomModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(12, 74, 110, 0.88)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '25px',
            animation: 'fadeIn 0.25s ease-out'
          }}
        >
          {/* Nút đóng X */}
          <button 
            onClick={() => setIsZoomModalOpen(false)}
            style={{
              position: 'absolute',
              top: '25px',
              right: '25px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1.5px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              zIndex: 10
            }}
            title="Đóng (ESC)"
          >
            &times;
          </button>

          {/* Tiêu đề & chỉ số ảnh */}
          <div style={{ color: 'white', textAlign: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
              {product.name}
            </h3>
            <span style={{ fontSize: '13px', color: '#bae6fd' }}>
              Ảnh {activeImageIndex + 1} / {productImages.length}
            </span>
          </div>

          {/* Khung ảnh to */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              position: 'relative', 
              maxWidth: '85vw', 
              maxHeight: '70vh', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: '#ffffff',
              padding: '20px',
              borderRadius: '24px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
              border: '2px solid #bae6fd'
            }}
          >
            <img 
              src={currentMainImg} 
              alt={product.name} 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '62vh', 
                objectFit: 'contain', 
                borderRadius: '12px'
              }} 
            />

            {/* Nút lướt ảnh trái / phải trong modal */}
            {productImages.length > 1 && (
              <>
                <button 
                  onClick={handlePrevImg}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#0284c7',
                    border: '2px solid white',
                    color: 'white',
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    transition: 'all 0.2s',
                    zIndex: 10
                  }}
                  title="Ảnh trước"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button 
                  onClick={handleNextImg}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#0284c7',
                    border: '2px solid white',
                    color: 'white',
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    transition: 'all 0.2s',
                    zIndex: 10
                  }}
                  title="Ảnh kế tiếp"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </>
            )}
          </div>

          {/* Dải Thumbnails trong Modal Zoom */}
          {productImages.length > 1 && (
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{ display: 'flex', gap: '12px', marginTop: '22px', flexWrap: 'wrap', justifyContent: 'center' }}
            >
              {productImages.map((img, i) => (
                <div 
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: activeImageIndex === i ? '2.5px solid #38bdf8' : '2px solid rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    background: 'white',
                    opacity: activeImageIndex === i ? 1 : 0.6,
                    padding: '4px',
                    transform: activeImageIndex === i ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}