import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb'; 
import Review from '../../../models/Review';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get("product_id") || url.searchParams.get("productId");
    await connectDB();

    let query: any = {};
    if (productId) {
      query = {
        $or: [
          { product_id: productId },
          { productId: productId }
        ]
      };
    }

    const reviews = await Review.find(query).sort({ createdAt: -1 }).lean(); 
    return NextResponse.json(reviews, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi lấy dữ liệu đánh giá" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    console.log("=========================================");
    console.log("1. CÓ NGƯỜI VỪA BẤM NÚT GỬI ĐÁNH GIÁ!");
    
    await connectDB();
    console.log("2. Đã kết nối MongoDB thành công.");
    
    const body = await req.json();
    console.log("3. Dữ liệu từ Web gửi xuống là:", body);

    const newReview = await Review.create({
      product_id: body.product_id,
      username: body.username || body.customer_name || 'Khách hàng',
      customer_name: body.username || body.customer_name || 'Khách hàng',
      rating: body.rating,
      comment: body.comment,
      image: body.image || '', 
      status: body.status || 'Đã duyệt'
    });

    console.log("4. ĐÃ LƯU THÀNH CÔNG VÀO DATABASE:", newReview);
    console.log("=========================================");

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error("🚨 LỖI RỒI, KHÔNG LƯU ĐƯỢC VÀO DATABASE:", error);
    return NextResponse.json({ error: "Lỗi lưu đánh giá vào DB" }, { status: 500 });
  }
}