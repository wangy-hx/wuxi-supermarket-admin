<template>
  <div class="orders">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
          <el-radio-group v-model="status" @change="loadData">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="pending">待付款</el-radio-button>
            <el-radio-button label="paid">待发货</el-radio-button>
            <el-radio-button label="shipped">待收货</el-radio-button>
            <el-radio-button label="completed">已完成</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-table :data="orders" v-loading="loading">
        <el-table-column prop="orderNo" label="订单号" />
        <el-table-column prop="user.nickname" label="用户" />
        <el-table-column prop="payAmount" label="金额">
          <template #default="{ row }">
            ¥{{ row.payAmount }}
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="下单时间" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === 'paid'" 
              type="primary" 
              link 
              @click="handleShip(row)"
            >
              发货
            </el-button>
            <el-button type="primary" link @click="handleDetail(row)">详情</el-button>
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

    <!-- 发货对话框 -->
    <el-dialog v-model="shipDialogVisible" title="订单发货" width="500px">
      <el-form :model="shipForm" label-width="100px">
        <el-form-item label="快递公司">
          <el-input v-model="shipForm.deliveryCompany" placeholder="请输入快递公司" />
        </el-form-item>
        <el-form-item label="快递单号">
          <el-input v-model="shipForm.deliveryNo" placeholder="请输入快递单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleShipSubmit">确认发货</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api'

const orders = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const status = ref('')

const shipDialogVisible = ref(false)
const shipForm = ref({
  deliveryCompany: '',
  deliveryNo: ''
})
const currentOrderId = ref(null)

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await api.getOrders({
      page: page.value,
      pageSize: pageSize.value,
      status: status.value
    })
    orders.value = res.data.list
    total.value = res.data.pagination.total
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const getStatusType = (status) => {
  const map = {
    pending: 'warning',
    paid: 'primary',
    shipped: 'success',
    completed: 'success',
    cancelled: 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    pending: '待付款',
    paid: '待发货',
    shipped: '待收货',
    delivered: '已送达',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

const handleShip = (row) => {
  currentOrderId.value = row.id
  shipForm.value = {
    deliveryCompany: '',
    deliveryNo: ''
  }
  shipDialogVisible.value = true
}

const handleShipSubmit = async () => {
  try {
    await api.shipOrder(currentOrderId.value, shipForm.value)
    ElMessage.success('发货成功')
    shipDialogVisible.value = false
    loadData()
  } catch (error) {
    console.error(error)
  }
}

const handleDetail = (row) => {
  // 查看订单详情
  console.log('订单详情:', row)
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
