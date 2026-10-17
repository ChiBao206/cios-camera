import mongoose, { Schema, model, models } from 'mongoose';

const ProductSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  category_id: { type: String, required: true },
  sold: { type: Number, default: 0 },
  images: { type: [String], default: [] }
}, { timestamps: true });

const Product = models.Product || model('Product', ProductSchema);

export default Product;