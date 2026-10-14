import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Product from '../../../models/Product';

import db from '../../../db.json';

// LẤY DANH SÁCH SẢN PHẨM TỪ MONGODB (KÈM FALLBACK TỰ ĐỘNG KHÔNG LO MẤT DỮ LIỆU)
export async function GET() {
  try {
    await connectDB();
    let products = await Product.find({}).sort({ createdAt: -1 });
    
    // Nếu MongoDB kết nối được nhưng chưa có sản phẩm, nạp tự động từ db.json
    if (!products || products.length === 0) {
      if (db.products && db.products.length > 0) {
        try {
          await Product.insertMany(db.products);
          products = await Product.find({}).sort({ createdAt: -1 });
        } catch (e) {
          return NextResponse.json(db.products);
        }
      }
    }
    
    return NextResponse.json(products && products.length > 0 ? products : db.products);
  } catch (error) {
    console.error("Lỗi kết nối MongoDB, chuyển sang nạp dữ liệu từ db.json dự phòng:", error);
    // Luôn trả về dữ liệu từ db.json dự phòng để website không bao giờ bị mất sản phẩm
    return NextResponse.json(db.products || []);
  }
}

// THÊM SẢN PHẨM MỚI (Dùng cho nút Thêm Mới)
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const newProduct = await Product.create(body);
    return NextResponse.json({ message: "Đã thêm sản phẩm", product: newProduct }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi khi thêm sản phẩm" }, { status: 500 });
  }
}

// CẬP NHẬT SẢN PHẨM (Dùng cho nút Sửa)
export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const body = await request.json();

    if (!id) return NextResponse.json({ message: "Thiếu ID sản phẩm" }, { status: 400 });

    await connectDB();
    const updatedProduct = await Product.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ message: "Đã cập nhật sản phẩm", product: updatedProduct }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi khi cập nhật sản phẩm" }, { status: 500 });
  }
}

// XÓA SẢN PHẨM KHỎI MONGODB (Đã mở khóa lệnh xóa thật)
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Thiếu ID sản phẩm" }, { status: 400 });
    }

    await connectDB();
    // Đã gỡ bỏ dấu // và gọi đúng tên hàm xóa
    await Product.findByIdAndDelete(id);

    return NextResponse.json({ message: "Đã xóa sản phẩm thành công" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Không thể kết nối Database" }, { status: 500 });
  }
}