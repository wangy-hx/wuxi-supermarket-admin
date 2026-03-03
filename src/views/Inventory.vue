<template>
  <div class="inventory">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>库存管理</span>
          <el-button type="primary" @click="checkLowStock">检查库存预警</el-button>
        </div>
      </template>

      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="商品名称">
          <el-input 
            v-model="filterForm.keyword" 
            placeholder="请输入商品名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="库存状态">
          <el-select v-model="filterForm.stockStatus" placeholder="请选择状态" clearable>
            <el-option label="库存充足" value="normal" />
            <el-option label="库存不足" value="low" />
            <el-option label="缺货" value="out" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="products" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="图片" width="100">
          <template #default="{ row }">
            <el-image 
              :src="row.images?.[0]" 
              style="width: 60px; height: 60px"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="category.name" label="分类" />
        <el-table-column prop="price" label="价格">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100">
          <template #default="{ row }">
            <el-tag :type="getStockType(row.stock)">
              {{ row.stock }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sales" label="销量" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'on' ? 'success' : 'info'">
              {{ row.status === 'on' ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" link @click="adjustStock(row)">调整库存</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        style="margin-top: 20px; justify-content: flex-end"
        @change="loadData"
      />
    </el-card>

    <!-- 调整库存对话框 -->
    <el-dialog v-model="adjustDialogVisible" title="调整库存" width="500px">
      <el-form :model="adjustForm" label-width="80px">
        <el-form-item label="商品名称">
          <el-input v-model="adjustForm.productName" disabled />
        </el-form-item>
        <el-form-item label="当前库存">
          <el-input v-model.number="adjustForm.currentStock" disabled />
        </el-form-item>
        <el-form-item label="调整数量">
          <el-input-number 
            v-model="adjustForm.adjustAmount" 
            :min="-adjustForm.currentStock" 
            :max="10000" 
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input 
            v-model="adjustForm.remark" 
            type="textarea" 
            :rows="3"
            placeholder="请输入调整原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adjustDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAdjustStock">确认调整</el-button>
      </template>
    </el-dialog>

    <!-- 库存预警对话框 -->
    <el-dialog v-model="lowStockDialogVisible" title="库存预警" width="800px">
      <el-alert 
        :title="`发现 ${lowStockProducts.length} 个商品库存不足`" 
        type="warning" 
        show-icon 
        style="margin-bottom: 20px;"
      />
      
      <el-table :data="lowStockProducts" max-height="400">
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="stock" label="库存" width="100">
          <template #default="{ row }">
            <el-tag type="danger">{{ row.stock }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="quickRestock(row)">
              快速补货
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <template #footer>
        <el-button @click="lowStockDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../api'

const products = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const filterForm = ref({
  keyword: '',
  stockStatus: ''
})

const adjustDialogVisible = ref(false)
const adjustForm = ref({
  productId: '',
  productName: '',
  currentStock: 0,
  adjustAmount: 0,
  remark: ''
})

const lowStockDialogVisible = ref(false)
const lowStockProducts = ref([])

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value
    }
    
    if (filterForm.value.keyword) {
      params.keyword = filterForm.value.keyword
    }
    if (filterForm.value.stockStatus) {
      params.stockStatus = filterForm.value.stockStatus
    }
    
    // 这里需要获取商品列表
    const res = await api.getProducts(params)
    products.value = res.data.list
    total.value = res.data.pagination.total
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const getStockType = (stock) => {
  if (stock <= 0) return 'danger'
  if (stock <= 10) return 'warning'
  return 'success'
}

const adjustStock = (product) => {
  adjustForm.value = {
    productId: product._id,
    productName: product.name,
    currentStock: product.stock,
    adjustAmount: 0,
    remark: ''
  }
  adjustDialogVisible.value = true
}

const handleAdjustStock = async () => {
  try {
    // 获取当前商品信息
    const currentProducts = products.value
    const product = currentProducts.find(p => p._id === adjustForm.value.productId)
    
    if (!product) {
      ElMessage.error('商品不存在')
      return
    }
    
    // 计算新库存
    const newStock = product.stock + adjustForm.value.adjustAmount
    
    // 更新商品库存
    await api.updateProduct(adjustForm.value.productId, {
      ...product,
      stock: newStock
    })
    
    ElMessage.success('库存调整成功')
    adjustDialogVisible.value = false
    loadData()
  } catch (error) {
    console.error(error)
    ElMessage.error('库存调整失败')
  }
}

const checkLowStock = async () => {
  try {
    const res = await api.checkInventory({ threshold: 10 })
    lowStockProducts.value = res.data.lowStockProducts
    lowStockDialogVisible.value = true
  } catch (error) {
    console.error(error)
    ElMessage.error('库存检查失败')
  }
}

const quickRestock = (product) => {
  adjustForm.value = {
    productId: product._id,
    productName: product.name,
    currentStock: product.stock,
    adjustAmount: 50, // 默认补货50件
    remark: '快速补货'
  }
  adjustDialogVisible.value = true
  lowStockDialogVisible.value = false
}

const resetFilter = () => {
  filterForm.value = {
    keyword: '',
    stockStatus: ''
  }
  page.value = 1
  loadData()
}
</script>

<style scoped>
.inventory {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-form {
  margin-bottom: 20px;
}

.filter-form .el-form-item {
  margin-right: 20px;
}
</style>