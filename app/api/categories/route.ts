import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Category from '../../../models/Category';

import db from '../../../db.json';

export async function GET() {
  try {
    await connectDB();
    let data = await Category.find({});
    if (!data || data.length === 0) {
      if (db.categories && db.categories.length > 0) {
        try {
          await Category.insertMany(db.categories);
          data = await Category.find({});
        } catch (e) {
          return NextResponse.json(db.categories);
        }
      }
    }
    return NextResponse.json(data && data.length > 0 ? data : db.categories);
  } catch (error) {
    console.error("Lỗi kết nối DB danh mục, dùng dự phòng:", error);
    return NextResponse.json(db.categories || []);
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const newData = await Category.create(body);
    return NextResponse.json(newData, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi thêm danh mục" }, { status: 500 });
  }
}

// BỔ SUNG: HÀM SỬA TÊN DANH MỤC (PUT)
export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const body = await req.json();

    if (!id) return NextResponse.json({ message: "Thiếu ID danh mục" }, { status: 400 });

    await connectDB();
    const updatedCategory = await Category.findByIdAndUpdate(id, { name: body.name }, { new: true });
    
    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi cập nhật danh mục" }, { status: 500 });
  }
}

// BỔ SUNG: HÀM XÓA DANH MỤC (DELETE)
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) return NextResponse.json({ message: "Thiếu ID danh mục" }, { status: 400 });

    await connectDB();
    await Category.findByIdAndDelete(id);
    
    return NextResponse.json({ message: "Đã xóa danh mục" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi xóa danh mục" }, { status: 500 });
  }
}