import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Order from '../../../models/Order';
import User from '../../../models/User'; 
import { sendEmail } from '../../../lib/sendEmail'; 

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const data = await Order.find({}).sort({ createdAt: -1 }).lean(); 
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: "Lỗi kết nối DB" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    console.log("👉 DỮ LIỆU ĐANG GỬI LÊN MONGODB:", body); 
    
    if (body.user_id) {
      body.user_id = String(body.user_id);
    }

    const newData = await Order.create(body);

    // ==========================================
    // KÍCH HOẠT GỬI HÓA ĐƠN EMAIL BẢN NÂNG CẤP CHI TIẾT
    // ==========================================
    try {
      let customerEmail = body.email; 
      
      if (!customerEmail && body.user_id && body.user_id !== '2') {
        const user = await User.findOne({ 
          $or: [{ _id: body.user_id }, { id: body.user_id }, { username: body.customer_name }] 
        });
        if (user && user.email) customerEmail = user.email;
      }

      if (customerEmail) {
        const itemsHtml = body.items.map((item: any) => `
          <tr>
            <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; color: #334155; font-weight: 600;">${item.name}</td>
            <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #64748b;">${item.cartQty}</td>
            <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #334155; font-weight: bold;">${(item.price * item.cartQty).toLocaleString('vi-VN')} đ</td>
          </tr>
        `).join('');

        const subject = `🎉 Xác nhận Đơn hàng #${String(newData._id || newData.id).slice(-4)} | CIOs - impossible is nothing`;
        
        // ĐÃ NÂNG CẤP: Hiển thị chi tiết Tạm tính, Phí ship, Giảm giá
        const html = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
            <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px dashed #cbd5e1;">
              <h1 style="color: #1e293b; margin: 0; font-size: 24px;">🎥 CIOs - impossible is nothing</h1>
              <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Giải pháp an ninh hàng đầu</p>
            </div>
            
            <h2 style="color: #10b981; text-align: center; margin-top: 25px; font-size: 22px;">ĐẶT HÀNG THÀNH CÔNG!</h2>
            <p style="color: #334155; font-size: 15px;">Xin chào <strong>${body.customer_name}</strong>,</p>
            <p style="color: #334155; font-size: 15px; line-height: 1.6;">Cảm ơn bạn đã tin tưởng mua sắm tại CIOs - impossible is nothing. Đơn hàng của bạn đã được hệ thống ghi nhận và đang trong quá trình xử lý.</p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
              <h3 style="margin-top: 0; color: #1e293b; font-size: 16px; text-transform: uppercase;">Thông tin giao hàng</h3>
              <p style="margin: 8px 0; font-size: 14px; color: #475569;">📍 <strong>Địa chỉ:</strong> ${body.shipping_address}</p>
              <p style="margin: 8px 0; font-size: 14px; color: #475569;">📞 <strong>Điện thoại:</strong> ${body.customer_phone}</p>
              <p style="margin: 8px 0; font-size: 14px; color: #475569;">🧾 <strong>Mã đơn hàng:</strong> #${String(newData._id || newData.id).slice(-4).toUpperCase()}</p>
            </div>

            <h3 style="color: #1e293b; font-size: 16px; text-transform: uppercase;">Chi tiết đơn hàng</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: white; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
              <thead>
                <tr style="background-color: #f1f5f9;">
                  <th style="padding: 12px 10px; text-align: left; border-bottom: 2px solid #cbd5e1; color: #475569; font-size: 13px;">SẢN PHẨM</th>
                  <th style="padding: 12px 10px; text-align: center; border-bottom: 2px solid #cbd5e1; color: #475569; font-size: 13px;">SL</th>
                  <th style="padding: 12px 10px; text-align: right; border-bottom: 2px solid #cbd5e1; color: #475569; font-size: 13px;">THÀNH TIỀN</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 15px 10px 10px 10px; text-align: right; font-weight: bold; font-size: 13px; color: #475569; border-top: 2px solid #e2e8f0;">TẠM TÍNH:</td>
                  <td style="padding: 15px 10px 10px 10px; text-align: right; font-weight: bold; font-size: 14px; color: #1e293b; border-top: 2px solid #e2e8f0;">${Number(body.subtotal || 0).toLocaleString('vi-VN')} đ</td>
                </tr>
                ${body.discount > 0 ? `
                <tr>
                  <td colspan="2" style="padding: 5px 10px; text-align: right; font-weight: bold; font-size: 13px; color: #10b981;">GIẢM GIÁ (5%):</td>
                  <td style="padding: 5px 10px; text-align: right; font-weight: bold; font-size: 14px; color: #10b981;">- ${Number(body.discount).toLocaleString('vi-VN')} đ</td>
                </tr>` : ''}
                <tr>
                  <td colspan="2" style="padding: 5px 10px 15px 10px; text-align: right; font-weight: bold; font-size: 13px; color: #475569;">PHÍ VẬN CHUYỂN:</td>
                  <td style="padding: 5px 10px 15px 10px; text-align: right; font-weight: bold; font-size: 14px; color: #1e293b;">${Number(body.shipping_fee || 0).toLocaleString('vi-VN')} đ</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: 900; font-size: 15px; color: #1e293b; border-top: 1px dashed #cbd5e1;">TỔNG THANH TOÁN:</td>
                  <td style="padding: 15px 10px; text-align: right; font-weight: 900; font-size: 18px; color: #e11d48; border-top: 1px dashed #cbd5e1;">${Number(body.total_money).toLocaleString('vi-VN')} đ</td>
                </tr>
              </tfoot>
            </table>

            <p style="color: #94a3b8; font-size: 13px; text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 20px; margin-top: 30px;">
              Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ Hotline hỗ trợ: <strong>0972.413.759</strong><br>
              Một lần nữa, cảm ơn bạn đã đồng hành cùng CIOs - impossible is nothing!
            </p>
          </div>
        `;
        
        sendEmail(customerEmail, subject, html).catch(err => console.log("Lỗi gửi mail đơn hàng ngầm:", err));
      }
    } catch (mailError) {
      console.error("Lỗi hệ thống chuẩn bị mail:", mailError);
    }

    return NextResponse.json(newData, { status: 201 });
    
  } catch (error: any) {
    console.error("❌ LỖI LƯU ĐƠN HÀNG MONGODB:", error.message); 
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const body = await req.json(); 

    if (!id) {
      return NextResponse.json({ message: "Thiếu ID đơn hàng" }, { status: 400 });
    }

    await connectDB();
    const updatedOrder = await Order.findByIdAndUpdate(
      id, 
      { status: body.status }, 
      { new: true }
    );
    
    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error: any) {
    console.error("❌ LỖI CẬP NHẬT TRẠNG THÁI MONGODB:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Thiếu ID đơn hàng" }, { status: 400 });
    }

    await connectDB();
    await Order.findByIdAndDelete(id);

    return NextResponse.json({ message: "Đã xóa đơn hàng thành công" }, { status: 200 });
  } catch (error: any) {
    console.error("❌ LỖI XÓA ĐƠN HÀNG MONGODB:", error.message);
    return NextResponse.json({ message: "Không thể xóa đơn hàng", error: error.message }, { status: 500 });
  }
}