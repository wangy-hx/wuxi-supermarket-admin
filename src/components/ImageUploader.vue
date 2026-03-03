<template>
  <div class="image-uploader">
    <div class="image-preview">
      <div 
        v-for="(image, index) in modelValue" 
        :key="index" 
        class="image-item"
      >
        <el-image 
          :src="image" 
          fit="cover" 
          :preview-src-list="modelValue"
          :initial-index="index"
          style="width: 100px; height: 100px; border-radius: 4px;"
        />
        <div class="image-actions">
          <el-button 
            type="danger" 
            size="small" 
            circle 
            @click="removeImage(index)"
          >
            -
          </el-button>
        </div>
      </div>
      
      <el-upload
        class="upload-area"
        :action="uploadAction"
        :headers="uploadHeaders"
        :show-file-list="false"
        :on-success="handleUploadSuccess"
        :before-upload="beforeUpload"
        :multiple="true"
        :disabled="disabled"
        list-type="picture-card"
      >
        <el-icon><Plus /></el-icon>
      </el-upload>
    </div>
    
    <div class="upload-tips" v-if="showTips">
      支持 JPG/PNG/GIF/WebP 格式，单张图片不超过 5MB，可多选
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showTips: {
    type: Boolean,
    default: true
  },
  maxCount: {
    type: Number,
    default: 10 // 最大上传数量
  }
})

const emit = defineEmits(['update:modelValue'])

// 上传配置
const uploadAction = computed(() => '/api/upload/images')
const uploadHeaders = computed(() => ({
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
}))

const handleUploadSuccess = (response, uploadFile, uploadFiles) => {
  if (response.success) {
    let newImages = []
    if (response.data.urls) {
      // 多文件上传
      newImages = response.data.urls
    } else if (response.data.url) {
      // 单文件上传
      newImages = [response.data.url]
    }
    
    // 检查是否超过最大数量限制
    const totalImages = props.modelValue.length + newImages.length
    if (totalImages <= props.maxCount) {
      const updatedImages = [...props.modelValue, ...newImages]
      emit('update:modelValue', updatedImages)
      ElMessage.success('图片上传成功')
    } else {
      ElMessage.warning(`最多只能上传 ${props.maxCount} 张图片`)
    }
  } else {
    ElMessage.error(response.message || '图片上传失败')
  }
}

const beforeUpload = (rawFile) => {
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(rawFile.type)) {
    ElMessage.error('只能上传 JPG/PNG/GIF/WebP 格式的图片')
    return false
  }
  
  // 检查文件大小 (5MB)
  const maxSize = 5 * 1024 * 1024
  if (rawFile.size > maxSize) {
    ElMessage.error('图片大小不能超过 5MB')
    return false
  }
  
  // 检查总数限制
  if (props.modelValue.length >= props.maxCount) {
    ElMessage.warning(`最多只能上传 ${props.maxCount} 张图片`)
    return false
  }
  
  return true
}

const removeImage = (index) => {
  const updatedImages = [...props.modelValue]
  updatedImages.splice(index, 1)
  emit('update:modelValue', updatedImages)
}
</script>

<style scoped>
.image-uploader {
  width: 100%;
}

.image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.image-item {
  position: relative;
  display: inline-block;
}

.image-actions {
  position: absolute;
  top: -8px;
  right: -8px;
}

.upload-area {
  margin-top: 10px;
}

.upload-area .el-upload {
  width: 100px;
  height: 100px;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.upload-area .el-upload:hover {
  border-color: var(--el-color-primary);
}

.upload-tips {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}
</style>