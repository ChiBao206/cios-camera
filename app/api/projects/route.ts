export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '../../../lib/mongodb';

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  details: { type: [String], required: true },
  images: { type: [String], required: true }
}, { timestamps: true });

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

// DỮ LIỆU CŨ TỪ TRANG PROJECTS CỦA BẠN (SẼ TỰ ĐỘNG IMPORT NẾU DB TRỐNG)
const initialProjects = [
  {
    title: "Hệ thống Mạng & IT Văn phòng OOCL",
    description: "Thi công hạ tầng mạng và lắp đặt thiết bị tin học toàn diện cho văn phòng làm việc.",
    details: [
      "Thi công, lắp ráp và đi dây gọn gàng cho hệ thống tủ Rack trung tâm.",
      "Triển khai kéo cáp, bấm node mạng nội bộ đến từng vị trí bàn làm việc của nhân viên.",
      "Lắp đặt, cài đặt hệ điều hành và phần mềm cho toàn bộ hệ thống máy tính văn phòng.",
      "Kiểm tra và nghiệm thu tín hiệu mạng, đảm bảo kết nối ổn định cho toàn bộ công ty."
    ],
    images: ["/uploads/oocl1.JPG", "/uploads/oocl2.JPG", "/uploads/oocl3.JPG", "/uploads/oocl4.JPG", "/uploads/oocl5.JPG"]
  },
  {
    title: "Giải pháp Giám sát & Mạng nội bộ Nhà hàng Kalbi",
    description: "Bảo đảm an ninh khu vực kinh doanh, quản lý hạ tầng mạng và hệ thống âm thanh.",
    details: [
      "Sử dụng và lắp đặt hệ thống Camera Dome Wifi, đảm bảo tính thẩm mỹ cao cho không gian nhà hàng.",
      "Triển khai hạ tầng mạng và cấu hình quản lý tập trung thông qua hệ thống Omada Controller.",
      "Thi công lắp đặt hệ thống loa phát nhạc nền và thông báo, tạo không gian chuyên nghiệp cho thực khách.",
      "Tối ưu hóa vùng phủ sóng wifi, đảm bảo kết nối ổn định cho cả khách hàng và hệ thống vận hành nội bộ."
    ],
    images: ["/uploads/kalbi1.JPG", "/uploads/kalbi2.JPG", "/uploads/kalbi3.JPG", "/uploads/kalbi4.JPG", "/uploads/kalbi5.JPG"]
  },
  {
    title: "Trường Dạy Lái Xe Hóc Môn",
    description: "Triển khai hệ thống camera giám sát ngoài trời với hạ tầng cáp quang chuyên dụng.",
    details: [
      "Trang bị và lắp đặt hệ thống camera thân Vantech chuyên dụng, chống chịu tốt với điều kiện thời tiết ngoài trời.",
      "Triển khai kéo cáp quang khoảng cách xa để truyền tải tín hiệu camera từ sa hình về trung tâm điều hành.",
      "Thực hiện đo kiểm và hàn nối cáp quang chuyên nghiệp, đảm bảo suy hao tín hiệu ở mức thấp nhất.",
      "Cấu hình hệ thống lưu trữ và hiển thị giám sát bao quát toàn bộ bãi sa hình tập lái xe."
    ],
    images: ["/uploads/hocmon1.JPG", "/uploads/hocmon2.JPG", "/uploads/hocmon3.JPG", "/uploads/hocmon4.JPG", "/uploads/hocmon5.JPG"]
  },
  {
    title: "Hệ thống Photobooth Chụp Ảnh Tự Động",
    description: "Bảo vệ tài sản và quản trị mạng từ xa cho chuỗi điểm chụp ảnh không người trực.",
    details: [
      "Lắp đặt hệ thống Camera siêu nhỏ gọn với góc nhìn toàn cảnh, bao quát khu vực buồng chụp mà không gây mất thẩm mỹ.",
      "Trang bị tính năng AI báo động chủ động, tự động phát hiện và cảnh báo qua App khi có người lạ đột nhập ngoài giờ hoạt động.",
      "Thiết lập mạng diện rộng đồng bộ qua nền tảng Omada Cloud SDN, giúp IT quản lý băng thông và trạng thái mạng của hàng loạt chi nhánh buồng chụp từ một giao diện duy nhất.",
      "Cấu hình VLAN và tường lửa (Firewall) bảo mật cấp doanh nghiệp trên Omada Gateway để cô lập hệ thống camera, bảo vệ tuyệt đối dữ liệu hình ảnh riêng tư của khách hàng."
    ],
    images: ["/uploads/photobooth3.PNG", "/uploads/photobooth2.JPG", "/uploads/photobooth1.png", "/uploads/photobooth4.JPG", "/uploads/photobooth5.JPG"]
  },
  {
    title: "Bệnh viện Đông Sài Gòn",
    description: "Thi công hệ thống điện mạng và trang thiết bị cảnh báo y tế chuyên dụng.",
    details: [
      "Thi công hạ tầng đi dây cáp mạng và cáp điện an toàn, đáp ứng tiêu chuẩn khắt khe của bệnh viện.",
      "Lắp đặt hệ thống thiết bị y tế chuyên dụng: trung tâm đầu báo, nút bấm gọi y tá tại các giường bệnh.",
      "Trang bị và kết nối hệ thống đèn báo hiệu trước cửa phòng bệnh và hành lang khu vực cấp cứu.",
      "Đồng bộ hóa hệ thống gọi y tá với trung tâm trực ban, đảm bảo phản ứng nhanh chóng trong các tình huống khẩn cấp."
    ],
    images: ["/uploads/dongsgn1.JPG", "/uploads/dongsgn2.JPG", "/uploads/dongsgn3.JPG", "/uploads/dongsgn4.JPG", "/uploads/dongsgn5.JPG"]
  }
];

export async function GET() {
  try {
    await connectDB();
    
    // Tự động import dữ liệu mẫu nếu DB trống
    const count = await Project.countDocuments();
    if (count === 0) {
      console.log("Đang import dữ liệu dự án mẫu vào MongoDB...");
      await Project.insertMany(initialProjects);
    }

    const data = await Project.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: "Lỗi lấy dữ liệu dự án" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const newData = await Project.create(body);
    return NextResponse.json(newData, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi thêm dự án" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const body = await req.json();

    if (!id) return NextResponse.json({ message: "Thiếu ID dự án" }, { status: 400 });

    await connectDB();
    const updated = await Project.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi cập nhật dự án" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) return NextResponse.json({ message: "Thiếu ID dự án" }, { status: 400 });

    await connectDB();
    await Project.findByIdAndDelete(id);
    return NextResponse.json({ message: "Đã xóa dự án" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi xóa dự án" }, { status: 500 });
  }
}