<template>
  <div class="categories">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
          <el-button type="primary" @click="handleAdd">添加分类</el-button>
        </div>
      </template>

      <el-table :data="categories" v-loading="loading" row-key="id">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
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
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
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

const categories = ref([])
const loading = ref(false)

const dialogVisible = ref(false)
const dialogTitle = ref('')
const form = ref({
  name: '',
  sort: 0,
  status: 'active'
})
const isEdit = ref(false)
const editId = ref(null)

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await api.getCategories()
    categories.value = res.data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '添加分类'
  form.value = {
    name: '',
    sort: 0,
    status: 'active'
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  editId.value = row.id
  dialogTitle.value = '编辑分类'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleSave = async () => {
  try {
    if (isEdit.value) {
      await api.updateCategory(editId.value, form.value)
    } else {
      await api.createCategory(form.value)
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
    await ElMessageBox.confirm('确定删除该分类吗？', '提示', {
      type: 'warning'
    })
    await api.deleteCategory(row.id)
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
