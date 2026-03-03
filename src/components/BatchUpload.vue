<template>
  <div class="batch-upload">
    <el-button 
      type="primary" 
      @click="downloadTemplate"
      style="margin-bottom: 20px;"
    >
      下载模板
    </el-button>
    
    <el-upload
      class="upload-demo"
      drag
      :action="uploadAction"
      :headers="uploadHeaders"
      :on-success="handleUploadSuccess"
      :before-upload="beforeUpload"
      :accept="'.xlsx,.xls'"
      :limit="1"
      :show-file-list="false"
    >
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">
        拖拽Excel文件到此处或<em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          仅支持 .xlsx 或 .xls 格式文件，文件大小不超过 10MB
        </div>
      </template>
    </el-upload>

    <el-progress 
      v-if="uploading" 
      :percentage="uploadProgress" 
      :status="uploadProgress === 100 ? 'success' : null"
      style="margin-top: 20px;"
    />

    <el-table 
      v-if="uploadResult.length > 0" 
      :data="uploadResult" 
      style="margin-top: 20px;" 
      :height="400"
    >
      <el-table-column prop="name" label="商品名称" width="200" />
      <el-table-column prop="categoryName" label="分类" width="120" />
      <el-table-column prop="price" label="价格" width="100">
        <template #default="{ row }">
          ¥{{ row.price }}
        </template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'on' ? 'success' : 'info'">
            {{ row.status === 'on' ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="result" label="结果" width="120">
        <template #default="{ row }">
          <el-tag :type="row.success ? 'success' : 'danger'">
            {{ row.success ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="message" label="消息" />
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'

const emit = defineEmits(['batch-upload-success'])

const uploading = ref(false)
const uploadProgress = ref(0)
const uploadResult = ref([])

// 上传配置
const uploadAction = ref('/api/upload/batch-products')
const uploadHeaders = ref({
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
})

// 下载Excel模板
const downloadTemplate = () => {
  // 创建模板数据
  const templateData = [
    {
      '商品名称': '示例商品1',
      '分类名称': '水果蔬菜',
      '价格': 19.99,
      '原价': 29.99,
      '库存': 100,
      '状态': 'on',
      '描述': '商品描述',
      '图片URL': 'https://example.com/image.jpg'
    },
    {
      '商品名称': '示例商品2',
      '分类名称': '日用品',
      '价格': 29.99,
      '原价': 39.99,
      '库存': 50,
      '状态': 'on',
      '描述': '商品描述',
      '图片URL': 'https://example.com/image2.jpg'
    }
  ]

  // 创建工作簿
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(templateData)
  XLSX.utils.book_append_sheet(wb, ws, '商品模板')
  
  // 设置列宽
  ws['!cols'] = [
    { wch: 20 }, // 商品名称
    { wch: 15 }, // 分类名称
    { wch: 10 }, // 价格
    { wch: 10 }, // 原价
    { wch: 10 }, // 库存
    { wch: 10 }, // 状态
    { wch: 30 }, // 描述
    { wch: 40 }  // 图片URL
  ]
  
  // 导出文件
  XLSX.writeFile(wb, '商品批量上传模板.xlsx')
}

// 上传前验证
const beforeUpload = (file) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                  file.type === 'application/vnd.ms-excel'
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isExcel) {
    ElMessage.error('只能上传 Excel 文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!')
    return false
  }

  uploading.value = true
  uploadProgress.value = 0
  uploadResult.value = []

  // 模拟上传进度
  const timer = setInterval(() => {
    if (uploadProgress.value < 90) {
      uploadProgress.value += 10
    }
  }, 200)

  setTimeout(() => {
    clearInterval(timer)
    uploadProgress.value = 100
  }, 2000)

  return true
}

// 上传成功回调
const handleUploadSuccess = (response) => {
  uploading.value = false
  uploadProgress.value = 100
  
  if (response.success) {
    uploadResult.value = response.data.results || []
    ElMessage.success(`批量上传完成：${response.data.successCount}个成功，${response.data.failCount}个失败`)
    
    // 触发成功事件
    emit('batch-upload-success', response.data)
  } else {
    ElMessage.error(response.message || '批量上传失败')
  }
}

defineExpose({
  downloadTemplate
})
</script>

<style scoped>
.batch-upload {
  padding: 20px;
}

.upload-demo {
  width: 100%;
}
</style>