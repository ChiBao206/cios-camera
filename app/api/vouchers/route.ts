import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Voucher from '../../../models/Voucher';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    // Dành cho khách: Truyền code lên để check xem mã có xài được không
    if (code) {
      const voucher = await Voucher.findOne({ code: code.toUpperCase() }).lean();
      if (!voucher) return NextResponse.json({ message: "Mã giảm giá không tồn tại!" }, { status: 404 });
      if (!voucher.isActive) return NextResponse.json({ message: "Mã giảm giá đã bị khóa!" }, { status: 400 });
      if (new Date(voucher.expireDate) < new Date()) return NextResponse.json({ message: "Mã giảm giá đã hết hạn!" }, { status: 400 });
      if (voucher.usedCount >= voucher.maxUsage) return NextResponse.json({ message: "Mã giảm giá đã hết lượt sử dụng!" }, { status: 400 });
      
      return NextResponse.json(voucher, { status: 200 });
    }

    // Dành cho Admin: Lấy toàn bộ danh sách mã
    const vouchers = await Voucher.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(vouchers, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Lỗi Server" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    body.code = body.code.toUpperCase(); // Ép tên mã viết hoa hết cho dễ check
    const newVoucher = await Voucher.create(body);
    return NextResponse.json(newVoucher, { status: 201 });
  } catch (error: any) {
    if(error.code === 11000) return NextResponse.json({ message: "Tên mã này đã tồn tại!" }, { status: 400 });
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const body = await req.json();

    if (body.code) body.code = body.code.toUpperCase();
    const updatedVoucher = await Voucher.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(updatedVoucher, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    await Voucher.findByIdAndDelete(id);
    return NextResponse.json({ message: "Đã xóa mã!" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}