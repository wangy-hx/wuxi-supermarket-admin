# Vercel部署详细步骤

## 第一步：创建GitHub仓库

1. 访问 [GitHub](https://github.com) 并登录
2. 点击右上角的 "+" 号，选择 "New repository"
3. 填写仓库信息：
   - Repository name: `wuxi-supermarket-admin`
   - Description: `悟喜超市后台管理系统`
   - 选择 Public 或 Private
   - 不要初始化 README、.gitignore 或 license
4. 点击 "Create repository"

## 第二步：推送代码到GitHub

在终端中执行以下命令：

```bash
cd /Users/wangyang/工作/00项目+工程+代码/AI完成应用开发/悟喜超市小程序开发/admin

# 添加远程仓库（替换为你的GitHub仓库地址）
git remote add origin https://github.com/你的用户名/wuxi-supermarket-admin.git

# 推送代码
git branch -M main
git push -u origin main
```

## 第三步：在Vercel部署

1. 访问 [Vercel官网](https://vercel.com)
2. 使用GitHub账号登录
3. 点击 "Add New Project"
4. 选择刚才创建的 `wuxi-supermarket-admin` 仓库
5. 配置项目设置：
   - Framework Preset: Vue.js
   - Root Directory: admin
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. 点击 "Deploy"

## 第四步：配置环境变量

在Vercel项目设置中添加环境变量：

```
VITE_API_BASE_URL=https://你的云函数域名
```

## 第五步：访问应用

部署完成后，Vercel会提供一个类似这样的URL：
`https://wuxi-supermarket-admin.vercel.app`

## 常见问题解决

### 如果部署失败：
1. 检查 `vercel.json` 配置是否正确
2. 确认 `package.json` 中的构建脚本
3. 查看Vercel的构建日志

### 如果页面空白：
1. 检查控制台错误信息
2. 确认环境变量配置
3. 验证API接口地址是否正确

### 静态资源404：
1. 检查 `vite.config.js` 中的base配置
2. 确认路由模式（hash vs history）