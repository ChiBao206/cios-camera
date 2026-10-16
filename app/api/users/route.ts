import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
// Import cỗ máy gửi mail bạn vừa tạo ở Bước 4
import { sendEmail } from '../../../lib/sendEmail'; 

import db from '../../../db.json';

export async function GET() {
  try {
    await connectDB();
    let data = await User.find({}).lean();
    if (!data || data.length === 0) {
      if (db.users && db.users.length > 0) {
        try {
          await User.insertMany(db.users);
          data = await User.find({}).lean();
        } catch (e) {
          return NextResponse.json(db.users);
        }
      }
    }
    return NextResponse.json(data && data.length > 0 ? data : db.users);
  } catch (error) {
    console.error("Lỗi kết nối User DB, dùng db.json dự phòng:", error);
    return NextResponse.json(db.users || []);
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const newData = await User.create(body);

    // KÍCH HOẠT GỬI EMAIL CHÀO MỪNG (nếu khách hàng có nhập email)
    if (newData.email) {
      const subject = "🎉 Chào mừng bạn đến với CIOs - impossible is nothing!";
      const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0;">
            <h1 style="color: #1e293b; margin: 0;">🎥 CIOs - impossible is nothing</h1>
          </div>
          <h2 style="color: #3b82f6; text-align: center; margin-top: 30px;">Xin chào ${newData.username}!</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">Cảm ơn bạn đã đăng ký tài khoản tại <strong>CIOs - impossible is nothing</strong>. Chúng tôi rất vui mừng được chào đón bạn gia nhập cộng đồng của chúng tôi.</p>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">Giờ đây, bạn có thể dễ dàng mua sắm các thiết bị an ninh chất lượng cao, theo dõi đơn hàng và nhận những ưu đãi mới nhất.</p>
          <div style="text-align: center; margin: 35px 0;">
            <a href="https://frontend-nextjs-one-dun.vercel.app" style="background-color: #e11d48; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Vào Mua Sắm Ngay</a>
          </div>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 40px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            Trân trọng,<br>Đội ngũ CIOs - impossible is nothing
          </p>
        </div>
      `;
      
      // Gửi mail ngầm, không dùng await để tránh làm khách hàng phải chờ lâu lúc bấm nút Đăng ký
      sendEmail(newData.email, subject, html).catch(err => console.log("Lỗi gửi mail ngầm:", err));
    }

    return NextResponse.json(newData);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server khi đăng ký' }, { status: 500 });
  }
}

// ==========================================
// BỔ SUNG: HÀM SỬA THÔNG TIN KHÁCH HÀNG (PUT)
// ==========================================
export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const body = await req.json();

    if (!id) return NextResponse.json({ message: "Thiếu ID khách hàng" }, { status: 400 });

    await connectDB();
    const updatedUser = await User.findByIdAndUpdate(id, body, { new: true });
    
    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi cập nhật khách hàng" }, { status: 500 });
  }
}

// ==========================================
// BỔ SUNG: HÀM XÓA KHÁCH HÀNG (DELETE)
// ==========================================
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) return NextResponse.json({ message: "Thiếu ID khách hàng" }, { status: 400 });

    await connectDB();
    await User.findByIdAndDelete(id);
    
    return NextResponse.json({ message: "Đã xóa khách hàng" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi xóa khách hàng" }, { status: 500 });
  }
}