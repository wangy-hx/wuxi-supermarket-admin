<template>
  <div class="products">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品管理</span>
          <el-button type="primary" @click="handleAdd">添加商品</el-button>
        </div>
      </template>

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
        <el-table-column prop="price" label="售价">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" />
        <el-table-column prop="sales" label="销量" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'on' ? 'success' : 'info'">
              {{ row.status === 'on' ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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

    <!-- 编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="商品名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.categoryId">
            <el-option 
              v-for="cat in categories" 
              :key="cat.id" 
              :label="cat.name" 
              :value="cat.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="售价">
          <el-input-number v-model="form.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="原价">
          <el-input-number v-model="form.originalPrice" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="库存">
          <el-input-number v-model="form.stock" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio label="on">上架</el-radio>
            <el-radio label="off">下架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../api'

const products = ref([])
const categories = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const dialogVisible = ref(false)
const dialogTitle = ref('')
const form = ref({
  name: '',
  categoryId: null,
  price: 0,
  originalPrice: 0,
  stock: 0,
  status: 'on',
  description: ''
})
const isEdit = ref(false)
const editId = ref(null)

onMounted(() => {
  loadData()
  loadCategories()
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await api.getProducts({
      page: page.value,
      pageSize: pageSize.value
    })
    products.value = res.data.list
    total.value = res.data.pagination.total
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const res = await api.getCategories()
    categories.value = res.data
  } catch (error) {
    console.error(error)
  }
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '添加商品'
  form.value = {
    name: '',
    categoryId: null,
    price: 0,
    originalPrice: 0,
    stock: 0,
    status: 'on',
    description: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  editId.value = row.id
  dialogTitle.value = '编辑商品'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleSave = async () => {
  try {
    if (isEdit.value) {
      await api.updateProduct(editId.value, form.value)
    } else {
      await api.createProduct(form.value)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error(error)
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除该商品吗？', '提示', {
      type: 'warning'
    })
    await api.deleteProduct(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
