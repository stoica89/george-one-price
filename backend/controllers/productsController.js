import { Product } from "../models/product.js";

export async function listProducts(_req, res) {
  const products = await Product.find({});
  res.json(products);
}

export async function createProduct(req, res) {
  const body = req.body || {};
  const product = await Product.create(body);
  res.status(201).json(product);
}
