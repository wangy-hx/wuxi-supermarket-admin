<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <div class="stat-title">今日订单</div>
            <div class="stat-value">{{ stats.todayOrders }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <div class="stat-title">今日销售额</div>
            <div class="stat-value">¥{{ stats.todaySales }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <div class="stat-title">商品总数</div>
            <div class="stat-value">{{ stats.totalProducts }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <div class="stat-title">用户总数</div>
            <div class="stat-value">{{ stats.totalUsers }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>待处理订单</span>
          </template>
          <el-table :data="pendingOrders" style="width: 100%">
            <el-table-column prop="orderNo" label="订单号" />
            <el-table-column prop="payAmount" label="金额" />
            <el-table-column prop="createdAt" label="下单时间" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>库存预警</span>
          </template>
          <el-table :data="lowStockProducts" style="width: 100%">
            <el-table-column prop="name" label="商品名称" />
            <el-table-column prop="stock" label="库存" />
            <el-table-column label="操作">
              <template #default>
                <el-button type="primary" link>补货</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const stats = ref({
  todayOrders: 0,
  todaySales: 0,
  totalProducts: 0,
  totalUsers: 0
})

const pendingOrders = ref([])
const lowStockProducts = ref([])

onMounted(() => {
  // 加载统计数据
  loadStats()
})

const loadStats = async () => {
  // 这里可以调用统计接口
  // 简化处理
}
</script>

<style scoped>
.stat-item {
  text-align: center;
}

.stat-title {
  color: #999;
  font-size: 14px;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}
</style>
