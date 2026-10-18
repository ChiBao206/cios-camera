const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType
} = require('docx');

// Helper tạo đoạn văn bản thông thường
function createPara(text, options = {}) {
  return new Paragraph({
    alignment: options.alignment || AlignmentType.LEFT,
    spacing: { before: options.before || 100, after: options.after || 120, line: 276 },
    children: [
      new TextRun({
        text: text,
        size: options.size || 24, // 12pt
        font: 'Times New Roman',
        bold: !!options.bold,
        italics: !!options.italic,
        color: options.color || '222222'
      })
    ]
  });
}

// Helper tạo danh sách gạch đầu dòng
function createBullet(title, desc, boldTitle = true) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 60, after: 80, line: 260 },
    children: [
      new TextRun({
        text: title + (desc ? ': ' : ''),
        size: 24,
        font: 'Times New Roman',
        bold: boldTitle,
        color: '0369a1'
      }),
      new TextRun({
        text: desc || '',
        size: 24,
        font: 'Times New Roman',
        color: '333333'
      })
    ]
  });
}

// Helper tạo Heading 1
function createHeading1(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180 },
    children: [
      new TextRun({
        text: title,
        size: 32, // 16pt
        font: 'Times New Roman',
        bold: true,
        color: '0284c7'
      })
    ]
  });
}

// Helper tạo Heading 2
function createHeading2(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text: title,
        size: 28, // 14pt
        font: 'Times New Roman',
        bold: true,
        color: '0f172a'
      })
    ]
  });
}

// Helper tạo ô bảng
function createCell(text, isHeader = false, widthPercent = 25) {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: isHeader ? { fill: '0284c7', type: ShadingType.CLEAR } : { fill: 'f8fafc', type: ShadingType.CLEAR },
    margins: { top: 120, bottom: 120, left: 140, right: 140 },
    children: [
      new Paragraph({
        alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
        children: [
          new TextRun({
            text: text,
            size: isHeader ? 22 : 22,
            font: 'Times New Roman',
            bold: isHeader,
            color: isHeader ? 'ffffff' : '1e293b'
          })
        ]
      })
    ]
  });
}

async function buildDoc() {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        children: [
          // TIÊU ĐỀ TRANG BÌA
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: 'BÁO CÁO TỔNG QUAN KIẾN TRÚC VÀ VẬN HÀNH',
                size: 36,
                bold: true,
                font: 'Times New Roman',
                color: '0284c7'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 50, after: 300 },
            children: [
              new TextRun({
                text: 'HỆ THỐNG WEBSITE THƯƠNG MẠI ĐIỆN TỬ CIOS CAMERA',
                size: 30,
                bold: true,
                font: 'Times New Roman',
                color: '0f172a'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 50, after: 400 },
            children: [
              new TextRun({
                text: 'Website: cios-camera.vercel.app | Cơ sở dữ liệu: MongoDB Cloud Atlas',
                size: 22,
                italics: true,
                font: 'Times New Roman',
                color: '64748b'
              })
            ]
          }),

          // PHẦN 1
          createHeading1('PHẦN 1: TỔNG QUAN VỀ DỰ ÁN VÀ CÔNG NGHỆ ÁP DỤNG'),
          createPara(
            'CiOs Camera là nền tảng thương mại điện tử chuyên nghiệp, phục vụ nhu cầu kinh doanh, tư vấn và cung cấp giải pháp an ninh, giám sát thông minh cho hộ gia đình, văn phòng, cửa hàng và nhà xưởng. Hệ thống hỗ trợ hoàn chỉnh chu trình mua bán từ tra cứu thông số sản phẩm, so sánh ảnh thực tế đa góc, đặt hàng trực tuyến, thanh toán chuyển khoản quét mã VietQR tự động đến quản trị vận hành đơn hàng và sản phẩm trong thời gian thực.'
          ),
          createHeading2('1.1. Ngăn xếp công nghệ (Technology Stack)'),
          createBullet('Frontend Framework', 'Next.js 16 (App Router) với kiến trúc React Server & Client Components hiện đại, đóng gói và tối ưu bằng Turbopack.'),
          createBullet('Ngôn ngữ lập trình', 'TypeScript 100%, bảo đảm tính chặt chẽ về dữ liệu, giảm thiểu tối đa lỗi runtime trong quá trình hoạt động.'),
          createBullet('Giao diện & Trải nghiệm', 'Hệ thống CSS Design System chuẩn mực, hỗ trợ Responsive toàn diện trên mọi màn hình từ điện thoại di động (iPhone, Android), máy tính bảng đến máy tính để bàn.'),
          createBullet('Backend & API', 'Next.js Serverless API Routes (/app/api/*), hoạt động độc lập dưới dạng các hàm Microservices Serverless trên nền tảng đám mây.'),
          createBullet('Cơ sở dữ liệu chính (Database)', 'MongoDB Cloud Atlas (kết nối qua Mongoose ODM) lưu trữ toàn vẹn dữ liệu đơn hàng, người dùng, sản phẩm, đánh giá và khuyến mãi.'),
          createBullet('Nền tảng hạ tầng & Triển khai', 'Vercel Cloud Platform (tích hợp CDN toàn cầu Edge Network, chứng chỉ bảo mật SSL/HTTPS tự động, CI/CD tự động build khi cập nhật mã nguồn).'),

          // PHẦN 2
          createHeading1('PHẦN 2: CHI TIẾT CÁC GIAO DIỆN VÀ CHỨC NĂNG CỦA HỆ THỐNG'),
          createPara(
            'Website được thiết kế gồm 9 cụm màn hình giao diện cốt lõi, phục vụ trọn vẹn cả hai đối tượng: Khách hàng mua sắm và Quản trị viên cửa hàng.'
          ),

          createHeading2('2.1. Trang chủ (Home Page - URL: /)'),
          createBullet('Thanh tiện ích đỉnh (Top Utility Bar)', 'Hiển thị hotline tư vấn 0971.024.173, địa chỉ công ty tại 12 Trịnh Đình Thảo, Tân Phú, TP. HCM cùng cam kết bảo hành chính hãng 24 tháng.'),
          createBullet('Header điều hướng thông minh', 'Tích hợp Logo CiOs Camera, thanh tìm kiếm sản phẩm nhanh (Live Search), nút giỏ hàng có huy hiệu (Badge) đếm số lượng hàng thực tế, nút thông báo, nút Đăng nhập / Đăng ký hoặc hiển thị tên người dùng khi đã đăng nhập.'),
          createBullet('Banner khuyến mãi & Giờ vàng Sale', 'Tự động tính toán ngày hội Sale trong tháng dựa trên cấu hình Admin, hiển thị huy hiệu giảm giá hấp dẫn.'),
          createBullet('Bộ lọc danh mục sản phẩm (Category Filters)', 'Cho phép lọc nhanh theo 7 danh mục thiết bị: Camera Wifi, Camera ngoài trời, Camera IP thân, Camera IP tròn, Router Wi-Fi, Switch chia mạng, và Đầu ghi hình kỹ thuật số.'),
          createBullet('Thanh bên Sidebar Đa năng (Multi-Widget Sidebar)', 'Khu vực thanh bên được bố trí đầy đặn, khoa học với 4 khối tiện ích hiện đại sử dụng 100% dữ liệu thật: (1) Hộp Hotline & Nút Chat Zalo trực tiếp 24/7; (2) Khối Đơn hàng mới nhất chạy Live theo thời gian thực từ Collection orders của MongoDB; (3) Khối Dự án thi công tiêu biểu lấy từ Collection projects kèm hình ảnh thực tế công trình; (4) Khối Cam kết tiêu chuẩn CiOs (Bảo hành 24T 1 đổi 1, Lắp đặt hỏa tốc 2H, VietQR/COD, Bảo mật Cloud).'),
          createBullet('Lưới sản phẩm hiện đại (Product Grid)', 'Thẻ sản phẩm chuẩn thương mại điện tử: Ảnh đại diện nét căng, tên, giá bán, số lượt bán, số sao đánh giá trung bình, nhãn Còn hàng, nút Thêm giỏ hàng và Mua ngay.'),
          createBullet('Bộ nút liên hệ nổi (Floating Actions)', 'Nút Chat Zalo, Nút gọi Hotline và Nút cuộn lên đầu trang (Back to top) được tối ưu khoảng cách Safe-Area trên thanh điều hướng điện thoại di động.'),

          createHeading2('2.2. Trang Chi tiết sản phẩm (Product Detail - URL: /product/[id])'),
          createBullet('Bộ sưu tập ảnh đa góc độ chuẩn TikTok Shop / Shopee', 'Mỗi sản phẩm hiển thị bộ ảnh thật 100% gồm các góc: Chính diện, góc nghiêng 45°, mặt sau chi tiết cổng kết nối LAN/WAN/Nguồn, khe cắm thẻ nhớ, nút Reset, phụ kiện mở hộp hoặc tấm pin năng lượng mặt trời (cho dòng Solar). Tuyệt đối hiển thị đúng mẫu mã của từng sản phẩm, không bị nhầm lẫn.'),
          createBullet('Bộ chuyển ảnh & Phóng to (Zoom Modal)', 'Khách hàng có thể bấm chuyển ảnh qua lại mượt mà hoặc bấm icon kính lúp để phóng to ảnh xem chi tiết linh kiện.'),
          createBullet('Đánh giá & Lượt bán thực tế', 'Hiển thị số sao trung bình kèm số lượng đã bán chuẩn xác lấy từ cơ sở dữ liệu thật MongoDB (sản phẩm chưa có khách mua hiển thị "Đã bán 0", sản phẩm có đơn hàng hiển thị đúng số lượng thật).'),
          createBullet('Tính toán giá bán thông minh', 'Tự động áp dụng mức giảm giá (% Sale) nếu ngày truy cập trùng với ngày hội Flash Sale do Admin thiết lập.'),
          createBullet('Bộ chọn số lượng & Nút hành động', 'Tăng/giảm số lượng theo tồn kho thực tế, nút Thêm vào giỏ hàng, nút Mua ngay dẫn thẳng tới trang thanh toán, và nút Thêm vào danh sách Yêu thích (Favorites).'),
          createBullet('Tab Mô tả chi tiết & 4 Điểm nổi bật độc quyền', 'Tự động hiển thị các ưu điểm kỹ thuật tương ứng với loại thiết bị (Router thì nhấn mạnh Wi-Fi 6 & vùng phủ sóng, Switch thì nhấn mạnh PoE & Gigabit, Camera thì nhấn mạnh đàm thoại 2 chiều, xoay 360 & chống nước IP67).'),
          createBullet('Tab Bảng thông số kỹ thuật (Specs Table)', 'Bảng tra cứu kỹ thuật chuẩn chỉ (Thương hiệu, SKU, chuẩn Wi-Fi/cổng mạng, độ phân giải, tầm xa hồng ngoại, chính sách bảo hành 24 tháng 1 đổi 1 trong 30 ngày).'),
          createBullet('Tab Đánh giá sản phẩm (Review System)', 'Khách hàng có thể chấm điểm từ 1 đến 5 sao, viết bình luận và tải ảnh chụp thực tế sản phẩm từ điện thoại hoặc máy tính để gửi lên hệ thống.'),
          createBullet('Sản phẩm liên quan (Related Products)', 'Hiển thị 4 sản phẩm cùng danh mục giúp khách hàng dễ dàng so sánh và lựa chọn.'),

          createHeading2('2.3. Trang Giỏ hàng & Thanh toán (Cart & Checkout - URL: /cart)'),
          createBullet('Quản lý giỏ hàng trực quan', 'Xem danh sách các món hàng đã chọn, điều chỉnh tăng giảm số lượng hoặc xóa sản phẩm khỏi giỏ, tự động cập nhật tổng tiền.'),
          createBullet('Áp dụng mã giảm giá (Voucher)', 'Hệ thống cho phép nhập mã Voucher để được trừ tiền trực tiếp trên đơn hàng.'),
          createBullet('Form thông tin giao hàng', 'Nhập họ tên, số điện thoại người nhận, địa chỉ giao hàng và ghi chú đơn hàng.'),
          createBullet('Phương thức thanh toán COD', 'Thanh toán tiền mặt khi nhận hàng tận nhà.'),
          createBullet('Phương thức Chuyển khoản quét mã QR tự động (VietQR)', 'Hệ thống tự động sinh mã QR ngân hàng chuẩn xác có sẵn số tiền và nội dung chuyển khoản gồm mã đơn hàng, giúp khách quét bằng app ngân hàng là hoàn tất thanh toán trong 3 giây.'),

          createHeading2('2.4. Trang Đăng nhập & Đăng ký (Auth - URL: /login & /register)'),
          createBullet('Đăng ký tài khoản', 'Form tạo tài khoản với họ tên, email, mật khẩu bảo mật. Tích hợp gửi mã OTP xác thực qua email để bảo đảm tài khoản thật.'),
          createBullet('Đăng nhập an toàn', 'Kiểm tra tài khoản, phân loại tự động vai trò người dùng: Tài khoản Khách hàng thông thường hoặc Tài khoản Quản trị viên (Admin).'),

          createHeading2('2.5. Trang Hồ sơ cá nhân (Profile - URL: /profile)'),
          createBullet('Thông tin tài khoản', 'Hiển thị họ tên, email, ngày đăng ký thành viên.'),
          createBullet('Lịch sử đơn hàng', 'Theo dõi toàn bộ đơn hàng cá nhân đã đặt, xem chi tiết tình trạng đơn (Chờ xử lý, Đang giao, Đã hoàn thành).'),
          createBullet('Danh sách yêu thích', 'Quản lý các sản phẩm khách đã thả tim lưu lại để tiện mua sau.'),

          createHeading2('2.6. Trang Quản trị viên Toàn năng (Admin Portal - URL: /admin)'),
          createBullet('Quản lý sản phẩm (Products CRUD)', 'Xem danh sách toàn bộ sản phẩm trên Cloud MongoDB, tìm kiếm nhanh, lọc theo danh mục, thêm sản phẩm mới (tên, giá, ảnh, danh mục, số lượng kho), chỉnh sửa thông tin sản phẩm và xóa sản phẩm vĩnh viễn khỏi Database.'),
          createBullet('Quản lý đơn hàng (Orders Management)', 'Xem danh sách đơn hàng thực tế của khách, ngày đặt, danh sách sản phẩm, địa chỉ, tổng tiền. Nút mũi tên chuyển đổi trạng thái đơn hàng (Chờ xác nhận -> Đang vận chuyển -> Đã giao hàng -> Đã hủy). Thống kê tổng doanh thu bán hàng.'),
          createBullet('Cài đặt Chiến dịch Ngày hội Sale', 'Thiết lập danh sách các ngày trong tháng áp dụng giảm giá (ví dụ ngày 1, 15, 25) và tỷ lệ % chiết khấu. Hệ thống tự động kích hoạt tính năng giảm giá toàn sàn khi bước sang các ngày này.'),
          createBullet('Quản lý Đánh giá & Hỗ trợ kỹ thuật', 'Kiểm duyệt hoặc gỡ bỏ đánh giá không phù hợp từ khách hàng, tiếp nhận các yêu cầu tư vấn kỹ thuật gửi về từ trang Liên hệ.'),

          createHeading2('2.7. Các trang chức năng bổ trợ khác'),
          createBullet('Trang Dự án thi công (/projects)', 'Hình ảnh và thông tin các dự án lắp đặt hệ thống an ninh thực tế cho nhà xưởng, văn phòng và biệt thự.'),
          createBullet('Trang Thông báo (/notifications)', 'Cung cấp các thông báo khuyến mãi và bản tin an ninh định kỳ.'),
          createBullet('Trang Liên hệ (/contact)', 'Bản đồ chỉ dẫn đường đi, form gửi tin nhắn hỗ trợ trực tuyến và số hotline.'),

          // PHẦN 3
          createHeading1('PHẦN 3: BẢN ĐỒ DỮ LIỆU - CÁI NÀO LƯU MONGODB? CÁI NÀO ĐƯA LÊN VERCEL?'),
          createPara(
            'Hệ thống được tổ chức theo mô hình phân tách rõ ràng giữa Tầng Xử lý Giao diện (Hosting trên Vercel) và Tầng Lưu trữ Dữ liệu Bền vững (MongoDB Cloud Atlas).'
          ),

          // BẢNG PHÂN CHIA VAI TRÒ
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell('Thành phần hệ thống', true, 25),
                  createCell('Nơi triển khai / Lưu trữ', true, 25),
                  createCell('Tệp mã nguồn liên quan', true, 25),
                  createCell('Nhiệm vụ & Chức năng', true, 25)
                ]
              }),
              new TableRow({
                children: [
                  createCell('Giao diện người dùng (Frontend UI)'),
                  createCell('Vercel Cloud (Edge Network)'),
                  createCell('app/page.tsx, app/product/[id]/page.tsx, app/cart/page.tsx, app/admin/page.tsx'),
                  createCell('Biên dịch HTML/CSS/JS, hiển thị giao diện mượt mà trên mọi thiết bị.')
                ]
              }),
              new TableRow({
                children: [
                  createCell('Hệ thống API Backend (Serverless)'),
                  createCell('Vercel Serverless Functions'),
                  createCell('app/api/products/route.ts, app/api/orders/route.ts, app/api/reviews/route.ts...'),
                  createCell('Tiếp nhận yêu cầu từ web, xử lý logic, tính toán giá, kết nối cơ sở dữ liệu.')
                ]
              }),
              new TableRow({
                children: [
                  createCell('Dữ liệu Sản phẩm (Products)'),
                  createCell('MongoDB Cloud Atlas'),
                  createCell('models/Product.ts, app/api/products/route.ts'),
                  createCell('Lưu 40+ sản phẩm, giá bán, số lượng tồn kho, danh mục và mảng ảnh đa góc images.')
                ]
              }),
              new TableRow({
                children: [
                  createCell('Dữ liệu Đơn hàng (Orders)'),
                  createCell('MongoDB Cloud Atlas'),
                  createCell('models/Order.ts, app/api/orders/route.ts'),
                  createCell('Lưu trữ đơn hàng khách đặt, trạng thái đơn, địa chỉ giao hàng, phương thức thanh toán.')
                ]
              }),
              new TableRow({
                children: [
                  createCell('Dữ liệu Khách hàng (Users)'),
                  createCell('MongoDB Cloud Atlas'),
                  createCell('models/User.ts, app/api/users/route.ts'),
                  createCell('Lưu thông tin đăng ký, mật khẩu mã hóa an toàn, phân quyền user và admin.')
                ]
              }),
              new TableRow({
                children: [
                  createCell('Dữ liệu Đánh giá (Reviews)'),
                  createCell('MongoDB Cloud Atlas'),
                  createCell('models/Review.ts, app/api/reviews/route.ts'),
                  createCell('Lưu số sao 1-5 sao, bình luận đánh giá, ảnh chụp thực tế khách đính kèm.')
                ]
              }),
              new TableRow({
                children: [
                  createCell('Dữ liệu Cấu hình Sale (Settings)'),
                  createCell('MongoDB Cloud Atlas'),
                  createCell('models/Setting.ts, app/api/settings/route.ts'),
                  createCell('Lưu các ngày diễn ra Sale trong tháng và mức % chiết khấu do Admin chỉ định.')
                ]
              }),
              new TableRow({
                children: [
                  createCell('File dữ liệu dự phòng db.json'),
                  createCell('Kho lưu trữ mã nguồn (Git)'),
                  createCell('db.json, app/api/seed/route.ts'),
                  createCell('Dùng làm dữ liệu mẫu ban đầu để khôi phục (Seed) và làm phao cứu sinh khi mất mạng.')
                ]
              }),
              new TableRow({
                children: [
                  createCell('Tệp hình ảnh & Video tĩnh'),
                  createCell('Vercel Global CDN'),
                  createCell('public/uploads/*, public/uploads/gallery/*'),
                  createCell('Cung cấp ảnh sản phẩm, ảnh gallery đa góc và video giới thiệu công ty.')
                ]
              })
            ]
          }),

          createHeading2('3.1. Các Collection cụ thể đang hoạt động trên MongoDB Cloud'),
          createBullet('Collection "products"', 'Chứa toàn bộ thông tin về các dòng camera, router wifi, switch mạng, đầu ghi. Mỗi bản ghi bao gồm: name, price, old_price, category_id, image, images (mảng 4-5 ảnh đa góc), description, quantity (tồn kho), sold (số lượng đã bán thực tế cập nhật theo từng đơn hàng), status.'),
          createBullet('Collection "orders"', 'Lưu vết từng giao dịch mua bán: customer_name, customer_phone, customer_address, payment_method, cart_items (mảng các sản phẩm đã mua), total_amount, status (Chờ xử lý, Đang giao, Đã giao, Đã hủy), created_at.'),
          createBullet('Collection "users"', 'Quản lý định danh tài khoản: username, email, password, full_name, role (user hoặc admin).'),
          createBullet('Collection "reviews"', 'Lưu trữ nhận xét của người tiêu dùng: product_id, username, customer_name, rating (1-5 sao), comment, image, status.'),
          createBullet('Collection "settings"', 'Quản lý thông số chiến dịch: saleDays (danh sách ngày sale), saleDiscount (% giảm giá), bannerTitle, bannerSubtitle.'),

          createHeading2('3.2. Vai trò thực tế của file db.json'),
          createPara(
            'File db.json trong dự án đóng vai trò là "Bản thiết kế gốc (Ground Truth & Backup)". Toàn bộ dữ liệu sản phẩm chuẩn, các đường dẫn ảnh đa góc độ đẹp nhất và danh mục được biên soạn hoàn chỉnh trong db.json. Khi triển khai lên Cloud, nếu MongoDB Cloud bị rỗng, hệ thống sẽ tự động kích hoạt nạp dữ liệu từ db.json lên Cloud. Ngược lại, nếu trong quá trình hoạt động MongoDB Cloud gặp sự cố rớt mạng, trang web tự động dùng db.json làm phao cứu sinh để khách xem hàng không bị gián đoạn.'
          ),

          createHeading2('3.3. Các thành phần chạy và phục vụ từ Vercel'),
          createBullet('Toàn bộ mã nguồn Next.js biên dịch', 'Next.js App Router được Vercel tự động đóng gói bằng Turbopack thành các khối mã nguồn tĩnh và Serverless Functions siêu nhỏ gọn.'),
          createBullet('Mạng lưới phân phối cạnh Edge Network', 'Tất cả các trang web và hình ảnh trong thư mục public/uploads được cache tại hơn 300 trung tâm dữ liệu toàn cầu của Vercel, giúp người dùng tại Việt Nam mở web trong tích tắc (dưới 100ms).'),
          createBullet('Quản lý biến môi trường an toàn', 'Biến kết nối bí mật MONGODB_URI được lưu trữ bảo mật trên Vercel Environment Variables, không sợ bị lộ mật khẩu cơ sở dữ liệu.'),

          // PHẦN 4
          createHeading1('PHẦN 4: TỐI ƯU HÓA HIỆU NĂNG VÀ ĐẢM BẢO CHUẨN XÁC HÌNH ẢNH'),
          createHeading2('4.1. Tối ưu hóa tải trang chi tiết siêu tốc (Zero-Delay Loading)'),
          createBullet('Truy vấn có mục tiêu theo ID', 'Thay vì tải toàn bộ kho hàng qua mạng, trang chi tiết gọi trực tiếp API /api/products?id=... sử dụng chỉ mục B-tree index của MongoDB, trả về dữ liệu trong vòng vài mili-giây.'),
          createBullet('Nạp dữ liệu đa luồng song song', 'Sản phẩm, đánh giá và cài đặt khuyến mãi được tải độc lập. Nếu người dùng vừa bấm từ trang chủ sang, dữ liệu được hiển thị tức thì (0ms) từ bộ nhớ tạm session.'),
          createBullet('Cơ chế Connection Pooling', 'Tệp lib/mongodb.ts được cấu hình tái sử dụng kết nối (global cache pooling) và giới hạn timeout 5 giây, bảo đảm không bao giờ làm nghẽn kết nối của gói MongoDB Atlas miễn phí.'),

          createHeading2('4.2. Chuẩn hóa hình ảnh thực tế đa góc nhìn 100%'),
          createBullet('Khắc phục triệt để lỗi ảnh Imou lẫn lộn', 'Trước đây, một số sản phẩm khác loại như Camera Năng lượng mặt trời 4G hoặc Camera Logitech Circle bị hiển thị ảnh phụ là camera Imou Ranger 2 hoặc camera thân Bullet. Hiện tại, toàn bộ 40 sản phẩm đã được gắn đúng 100% bộ ảnh thật của chính sản phẩm đó.'),
          createBullet('Camera Năng Lượng Mặt Trời 4G (ID 113)', 'Có đầy đủ ảnh tấm pin solar ngoài trời, cụm xoay PTZ 360, khe cắm SIM 4G và thẻ nhớ chống nước, cùng ảnh trọn bộ phụ kiện mở hộp.'),
          createBullet('Camera Logitech Circle (ID 124)', 'Có đầy đủ 4 góc chụp chính hãng của Logitech Circle View dạng tròn đặc trưng, góc nghiêng 45° trên đế xoay và chế độ gập bảo mật riêng tư.'),
          createBullet('Thiết bị mạng (Router & Switch)', 'Toàn bộ Router (Totolink, Archer AX53) và Switch (Tenda, TP-Link, Hikvision PoE, Cisco) đều hiển thị đúng ảnh thiết bị mạng với cổng LAN/WAN, đèn LED và bộ sạc adapter.'),
          createBullet('Đầu ghi hình (DVR/NVR)', 'Hiển thị chính xác mặt trước, khay gắn ổ cứng SATA và mặt sau đầy đủ cổng BNC, HDMI 4K, VGA, LAN và Audio.'),

          createHeading2('4.3. Chuẩn hóa 100% dữ liệu lượt bán (Sold Count) và tồn kho thực tế'),
          createBullet('Xóa bỏ hoàn toàn giá trị ảo (Fallback || 48)', 'Trước đây ở giao diện chi tiết sản phẩm tồn tại đoạn mã fallback `product.sold || 48`, dẫn đến tình trạng các sản phẩm mới hoặc sản phẩm chưa phát sinh đơn hàng (như Camera Năng Lượng Mặt Trời 4G, Camera Panasonic K-EF134L01E...) đều bị hiển thị là "Đã bán 48". Hiện tại lỗi này đã được loại bỏ triệt để.'),
          createBullet('Đồng bộ hóa 100% dữ liệu thực từ MongoDB Orders', 'Toàn bộ trường `sold` trên MongoDB Cloud Atlas đã được quét và tính toán chính xác tuyệt đối dựa trên các đơn hàng thực tế do khách hàng đặt. Sản phẩm nào chưa từng được mua sẽ hiển thị đúng thực tế "Đã bán 0", sản phẩm nào đã bán được bao nhiêu chiếc sẽ hiển thị chuẩn xác bấy nhiêu (ví dụ: Đầu ghi Hikvision DS-7204HGHI-K1 đã bán 10, Camera Kbone H21P đã bán 3, Imou Ranger 2 đã bán 2, Imou Bullet 2C đã bán 2, Vantech V-2020AI đã bán 2, Switch Tenda S105 đã bán 1, Camera Ezviz C3TN OutPro đã bán 1, Đầu ghi Vantech VP-464A đã bán 1...).'),
          createBullet('Cơ chế trừ tồn kho và tăng lượt bán thời gian thực (Real-Time Stock & Sales)', 'Khi khách hàng tiến hành Đặt hàng tại trang Giỏ hàng (/cart), hệ thống sẽ gửi lệnh cập nhật trực tiếp vào MongoDB để trừ đi số lượng tồn kho (quantity) và tự động cộng dồn số lượng đã bán (sold).'),
          createBullet('Top Bán Chạy Nhất xếp hạng theo dữ liệu thật', 'Mục "Top Bán Chạy Nhất" ở Trang chủ hiện được tự động sắp xếp theo số lượng bán thật giảm dần từ MongoDB, mang lại thông tin trung thực và minh bạch cho khách hàng.'),

          // PHẦN 5
          createHeading1('PHẦN 5: KẾT LUẬN VÀ HƯỚNG DẪN BÀN GIAO'),
          createPara(
            'Hệ thống website thương mại điện tử CiOs Camera đã được xây dựng và hoàn thiện ở mức độ chỉn chu cao. Dự án đáp ứng xuất sắc các tiêu chí về mặt kỹ thuật, kiến trúc đám mây hiện đại, tốc độ tải trang nhanh chóng, tính năng quản trị phong phú và trải nghiệm mua sắm tiện lợi trên mọi thiết bị di động.'
          ),
          createBullet('Đường dẫn truy cập Website chính thức', 'https://cios-camera.vercel.app/'),
          createBullet('Tài khoản Quản trị viên (Admin)', 'Đăng nhập bằng tài khoản Quản trị với đầy đủ quyền quản lý đơn hàng, thêm sửa xóa sản phẩm và cài đặt ngày sale.'),
          createBullet('Cơ chế an toàn dữ liệu', 'Dữ liệu vận hành được bảo vệ và đồng bộ liên tục trên MongoDB Cloud Atlas, song song với bản dự phòng db.json luôn sẵn sàng.'),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 400 },
            children: [
              new TextRun({
                text: 'Báo cáo được khởi tạo tự động từ hệ thống CiOs Camera.',
                size: 20,
                italics: true,
                font: 'Times New Roman',
                color: '64748b'
              })
            ]
          })
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(process.cwd(), 'BAO_CAO_HE_THONG_CIOS_CAMERA.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log('SUCCESS: Generated Word report at:', outputPath);
}

buildDoc().catch(err => {
  console.error('Error generating document:', err);
  process.exit(1);
});

