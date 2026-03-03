import request from '../utils/request'

export default {
  // 登录
  login: (data) => request.post('/auth/admin-login', data),
  
  // 商品
  getProducts: (params) => request.get('/products', { params }),
  createProduct: (data) => request.post('/products', data),
  updateProduct: (id, data) => request.put(`/products/${id}`, data),
  deleteProduct: (id) => request.delete(`/products/${id}`),
  
  // 分类
  getCategories: () => request.get('/categories'),
  createCategory: (data) => request.post('/categories', data),
  updateCategory: (id, data) => request.put(`/categories/${id}`, data),
  deleteCategory: (id) => request.delete(`/categories/${id}`),
  
  // 订单
  getOrders: (params) => request.get('/orders/admin/list', { params }),
  shipOrder: (id, data) => request.put(`/orders/${id}/ship`, data),
  
  // 轮播图
  getBanners: (params) => request.get('/banners', { params }),
  createBanner: (data) => request.post('/banners', data),
  updateBanner: (id, data) => request.put(`/banners/${id}`, data),
  deleteBanner: (id) => request.delete(`/banners/${id}`),

  // 库存管理
  checkInventory: (params) => request.get('/inventory/check', { params }),

  // 图片上传
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  uploadImages: (files) => {
    const formData = new FormData()
    for (let file of files) {
      formData.append('files', file)
    }
    return request.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // 批量上传
  batchUploadProducts: (file) => {
    const formData = new FormData()
    formData.append('fileData', file)
    return request.post('/upload/batch-products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}