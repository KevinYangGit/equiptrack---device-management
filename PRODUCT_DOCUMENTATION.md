# EquipTrack - 设备管理系统产品文档

<div align="center">
  <h1>EquipTrack</h1>
  <p>专业的设备借用管理系统</p>
  <p>Device Management System</p>
</div>

---

## 📋 目录

- [产品概述](#产品概述)
- [核心功能](#核心功能)
- [快速开始](#快速开始)
- [功能详解](#功能详解)
- [数据管理](#数据管理)
- [部署指南](#部署指南)
- [技术架构](#技术架构)
- [常见问题](#常见问题)
- [更新日志](#更新日志)

---

## 🎯 产品概述

EquipTrack 是一个现代化的设备借用管理系统，帮助团队高效管理设备库存、追踪借用记录，并提供完整的历史记录查询功能。系统采用本地存储，确保数据隐私安全，支持数据备份和恢复。

### 产品特点

- ✅ **完全本地化**：所有数据存储在浏览器本地，保护隐私
- ✅ **实时追踪**：完整的设备状态和借用历史记录
- ✅ **智能提示**：设备名称自动补全，提高输入效率
- ✅ **灵活配置**：自定义设备类型和图标
- ✅ **数据安全**：支持数据导出/导入，防止数据丢失
- ✅ **响应式设计**：完美适配桌面端和移动端
- ✅ **美观界面**：现代化UI设计，流畅的交互体验

### 适用场景

- 公司设备管理
- 学校实验室设备借用
- 团队共享资源管理
- 个人设备清单管理

---

## 🚀 核心功能

### 1. 设备管理

#### 添加设备
- 上传设备图片（支持 JPEG、PNG、GIF、WebP，最大 5MB）
- 输入设备名称（支持历史记录自动补全）
- 选择设备类型（支持自定义类型和图标）
- 自动记录添加时间

#### 设备操作
- **借用设备**：记录借用人信息，更新设备状态
- **归还设备**：自动更新设备状态，清除借用人信息
- **删除设备**：永久删除设备（需二次确认）

#### 设备筛选
- 全部设备
- 可借用设备
- 已借出设备

### 2. 设备统计

实时显示设备统计信息：
- **全部设备数量**：当前系统中的设备总数
- **可借用设备数量**：状态为"可用"的设备数量
- **已借出设备数量**：当前被借用的设备数量

统计信息以卡片形式展示，包含图标和颜色标识，直观易读。

### 3. 历史记录

- 完整记录所有设备操作（添加、借用、归还、删除）
- 按时间倒序显示
- 支持按日期筛选查看
- 显示操作人、操作时间等详细信息
- 操作类型图标标识

### 4. 设备名称智能提示

- 自动记录已使用的设备名称
- 按使用频率排序显示
- 输入时实时过滤匹配项
- 支持删除历史记录
- 点击历史项快速填充

### 5. 设备类型管理

#### 自定义类型
- 添加新的设备类型
- 为每个类型设置专属图标（18种图标可选）
- 选择图标颜色（8种颜色主题）
- 删除不需要的类型（需检查是否被使用）
- 编辑现有类型的图标

#### 图标选择
- 18种常用图标可选（Laptop、Smartphone、Camera、Headphones等）
- 8种颜色主题（蓝色、紫色、玫瑰色、粉色等）
- 实时预览效果
- 支持编辑现有类型的图标

### 6. 数据备份与恢复

#### 导出数据
- 一键导出所有设备数据
- JSON格式，易于阅读和编辑
- 包含元数据（版本、导出日期）
- 自动生成带时间戳的文件名
- 导出前显示数据统计确认

#### 导入数据
- 从备份文件恢复数据
- 导入前预览数据统计（设备数量、历史记录数量、导出日期）
- 二次确认防止误操作
- 自动验证数据格式
- 详细的错误提示

### 7. 壁纸功能

- 每日自动更新背景壁纸
- 本地缓存，快速加载
- 每天仅请求一次新壁纸
- 网络失败时使用默认图片
- 10秒超时保护

---

## 🏁 快速开始

### 环境要求

- **Node.js**: 16.0 或更高版本
- **npm**: 7.0 或更高版本（或使用 yarn）

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/KevinYangGit/equiptrack---device-management.git
   cd equiptrack---device-management
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **访问应用**
   打开浏览器访问：`http://localhost:5173`

### 构建生产版本

```bash
npm run build
```

构建产物位于 `dist` 目录，可用于部署。

### 预览生产版本

```bash
npm run preview
```

---

## 📖 功能详解

### 添加设备

**操作步骤：**

1. 点击 Header 中的 **"Add New Device"** 按钮
2. 在弹窗中填写设备信息：
   - **设备图片**：点击上传区域选择图片（可选）
     - 支持格式：JPEG、PNG、GIF、WebP
     - 最大大小：5MB
   - **设备名称**：
     - 直接输入设备名称
     - 或从下拉菜单选择历史记录（按使用频率排序）
     - 支持删除历史记录（hover 显示删除按钮）
   - **设备类型**：
     - 从下拉菜单选择现有类型
     - 或点击"管理类型"添加新类型
3. 点击 **"Add Device"** 完成添加

**注意事项：**
- 设备名称为必填项
- 图片为可选项，不上传时显示默认图标
- 设备名称会自动保存到历史记录

### 借用设备

**操作步骤：**

1. 在设备列表中，找到要借用的设备（状态为"可用"）
2. 点击设备卡片上的 **"Borrow"** 按钮
3. 在弹窗中输入借用人姓名
4. 点击 **"Confirm Borrow"** 确认

**结果：**
- 设备状态更新为"已借出"
- 显示借用人信息
- 记录借用时间
- 在历史记录中添加借用记录

### 归还设备

**操作步骤：**

1. 在设备列表中，找到已借出的设备（状态为"已借出"）
2. 点击设备卡片上的 **"Return"** 按钮
3. 在确认弹窗中点击 **"Confirm Return"**

**结果：**
- 设备状态更新为"可用"
- 清除借用人信息
- 记录归还时间
- 在历史记录中添加归还记录

### 删除设备

**操作步骤：**

1. 在设备列表中，找到要删除的设备
2. 点击设备卡片上的删除图标（垃圾桶图标）
3. 在确认弹窗中查看警告信息
4. 点击 **"Delete Device"** 确认删除

⚠️ **警告**：删除操作不可撤销，请谨慎操作。

**结果：**
- 设备从列表中永久删除
- 在历史记录中添加删除记录

### 管理设备类型

**打开管理界面：**

1. 点击设备类型选择框旁的 **"管理类型"** 按钮

**添加新类型：**

1. 在"添加新类型"区域输入类型名称
2. 点击"选择图标"展开图标选择器
3. 从18种常用图标中选择一个
4. 从8种颜色中选择一个
5. 点击 **"添加"** 按钮

**编辑现有类型图标：**

1. 在现有类型列表中，hover 要编辑的类型
2. 点击设置图标（齿轮图标）
3. 在展开的编辑区域选择新图标和颜色
4. 点击 **"保存"** 按钮

**删除类型：**

1. 在现有类型列表中，hover 要删除的类型
2. 点击删除图标（垃圾桶图标）
3. 如果类型正在使用中，会显示"使用中"提示，无法删除

**限制：**
- 不能删除正在被设备使用的类型
- 不能删除最后一个类型

### 数据导出

**操作步骤：**

1. 点击 Header 中的 **设置** 按钮（齿轮图标）
2. 在下拉菜单中点击 **"导出数据"**
3. 在确认弹窗中查看数据统计：
   - 当前设备数量
   - 历史记录数量
4. 点击 **"确认导出"**
5. 文件将自动下载到浏览器默认下载目录

**文件信息：**
- 文件名格式：`equiptrack-backup-YYYY-MM-DD-HHmmss.json`
- 文件格式：JSON
- 包含内容：所有设备数据、历史记录、元数据

### 数据导入

**操作步骤：**

1. 点击 Header 中的 **设置** 按钮
2. 在下拉菜单中点击 **"导入数据"**
3. 选择之前导出的 JSON 备份文件
4. 在确认弹窗中查看导入预览：
   - 设备数量
   - 历史记录数量
   - 导出日期（如果有）
5. 仔细阅读警告信息
6. 点击 **"确认导入"** 完成恢复

⚠️ **重要警告**：
- 导入数据会**完全替换**当前所有数据
- 导入前请确保已备份当前数据
- 此操作无法撤销

**导入验证：**
- 自动验证文件格式
- 验证数据结构完整性
- 验证设备数据格式
- 验证历史记录格式
- 如果验证失败，显示详细错误信息

---

## 💾 数据管理

### 数据存储

#### 存储位置
- **技术**：浏览器 localStorage API
- **位置**：浏览器本地数据库
- **容量**：约 5-10MB（每个域名）
- **格式**：JSON 字符串

#### 存储内容

1. **设备数据** (`equiptrack_data_v1`)
   - 设备列表
   - 历史记录

2. **设备名称历史** (`equiptrack_device_names`)
   - 设备名称使用频率记录

3. **设备类型** (`equiptrack_device_types`)
   - 设备类型列表（包含图标和颜色）

4. **壁纸数据** (`equiptrack_wallpaper`)
   - 壁纸URL
   - 壁纸获取日期

### 数据结构

#### 设备数据 (Device)
```typescript
{
  id: string;              // 唯一标识符（时间戳+随机字符串）
  name: string;            // 设备名称
  type: string;            // 设备类型
  image?: string;          // Base64 图片数据（可选）
  status: 'available' | 'borrowed';  // 设备状态
  borrower?: string;       // 借用人姓名（可选）
  lastUpdated: number;     // 最后更新时间戳
}
```

#### 历史记录 (HistoryRecord)
```typescript
{
  id: string;              // 唯一标识符
  deviceId: string;        // 设备ID
  deviceName: string;      // 设备名称
  action: 'add' | 'borrow' | 'return' | 'delete';  // 操作类型
  borrower?: string;       // 借用人（可选）
  timestamp: number;       // 操作时间戳
}
```

#### 设备类型 (DeviceType)
```typescript
{
  name: string;            // 类型名称
  icon: string;            // 图标名称（lucide-react）
  color?: string;          // 图标颜色（可选，Tailwind CSS 类名）
}
```

#### 导出文件格式
```json
{
  "version": "1.0",
  "exportDate": "2024-12-03T12:00:00.000Z",
  "data": {
    "devices": [...],
    "history": [...]
  }
}
```

### 数据安全

#### 数据保护措施

1. **大小限制检查**
   - 保存前检查数据大小
   - 超过 5MB 时显示错误提示
   - 防止 localStorage 溢出

2. **格式验证**
   - 导入数据时验证 JSON 格式
   - 验证数据结构完整性
   - 验证每个字段的数据类型
   - 提供详细的错误信息

3. **错误处理**
   - 完善的错误捕获机制
   - 用户友好的错误提示
   - 操作失败时的回滚机制

#### 数据丢失风险

以下情况可能导致数据丢失：

1. **用户操作**
   - 手动清除浏览器数据
   - 清除网站数据
   - 清除 localStorage

2. **浏览器行为**
   - 使用无痕/隐私模式（关闭后数据清除）
   - 浏览器自动清理存储空间
   - 存储空间不足时被清理

3. **设备限制**
   - 不同浏览器之间数据不共享
   - 不同设备之间数据不共享
   - 更换设备时数据不迁移

#### 数据备份建议

1. **定期备份**
   - 建议每周导出一次数据
   - 重要操作前先备份

2. **多位置存储**
   - 将备份文件保存到多个位置
   - 云盘（Google Drive、Dropbox等）
   - 本地硬盘
   - 外部存储设备

3. **版本管理**
   - 保留多个版本的备份
   - 使用带时间戳的文件名
   - 定期清理旧备份

---

## 🚢 部署指南

### GitHub Pages 部署

#### 方法一：手动部署（推荐用于测试）

**步骤：**

1. **安装部署工具**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **配置 package.json**
   ```json
   {
     "homepage": "https://yourusername.github.io/equiptrack---device-management",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **配置 vite.config.ts**
   ```typescript
   export default defineConfig({
     base: '/equiptrack---device-management/',
     // ... 其他配置
   })
   ```

4. **执行部署**
   ```bash
   npm run deploy
   ```

5. **配置 GitHub Pages**
   - 进入仓库 Settings → Pages
   - Source 选择：`gh-pages` 分支
   - 点击 Save

#### 方法二：自动部署（推荐用于生产环境）

**步骤：**

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

2. **启用 GitHub Actions**
   - 进入仓库 Settings → Actions → General
   - 在 "Actions permissions" 部分：
     - 选择 "Allow all actions and reusable workflows"
     - 点击 Save

3. **配置 GitHub Pages**
   - 进入 Settings → Pages
   - 在 "Build and deployment" 部分：
     - Source 选择：GitHub Actions
     - 点击 Save

4. **自动部署**
   - 每次推送到 main 分支时自动构建和部署
   - 在 Actions 选项卡查看部署状态
   - 通常 2-5 分钟完成部署

### 访问部署的应用

部署成功后，访问地址：
```
https://yourusername.github.io/equiptrack---device-management/
```

### 注意事项

1. **仓库可见性**
   - GitHub Pages 免费版仅支持公开仓库
   - 如需私有仓库，需要 GitHub Pro/Team

2. **分支名称**
   - 确保工作流配置的分支名称正确（main 或 master）

3. **路径配置**
   - `homepage` 和 `base` 路径必须匹配仓库名称
   - 路径区分大小写

4. **首次部署**
   - 可能需要几分钟才能访问
   - 清除浏览器缓存后重试

---

## 🏗️ 技术架构

### 技术栈

- **前端框架**：React 19.2.0
- **开发语言**：TypeScript 5.8.2
- **构建工具**：Vite 6.2.0
- **UI 图标库**：Lucide React 0.555.0
- **样式方案**：Tailwind CSS（内联）
- **数据存储**：localStorage API
- **路由**：单页应用（SPA）

### 项目结构

```
equiptrack---device-management/
├── components/              # React 组件
│   ├── AutocompleteInput.tsx    # 自动补全输入框组件
│   ├── Button.tsx               # 按钮组件
│   ├── DeviceList.tsx           # 设备列表组件
│   ├── HistoryLog.tsx           # 历史记录组件
│   ├── IconSelector.tsx         # 图标选择器组件
│   └── Modal.tsx                # 模态框组件
├── services/                # 服务层
│   └── storageService.ts        # 数据存储服务
├── public/                  # 静态资源
│   └── 404.html                 # SPA 路由支持
├── .github/                 # GitHub 配置
│   └── workflows/
│       └── deploy.yml           # GitHub Actions 部署配置
├── types.ts                 # TypeScript 类型定义
├── index.tsx                # 主应用组件
├── index.html               # HTML 入口文件
├── index.css                # 全局样式
├── vite.config.ts           # Vite 配置
├── tsconfig.json            # TypeScript 配置
├── package.json             # 项目配置
└── README.md                # 项目说明文档
```

### 核心组件说明

#### storageService.ts
负责所有数据存储操作：
- `loadData()` / `saveData()` - 设备数据读写
- `loadDeviceNames()` / `saveDeviceName()` - 设备名称历史
- `loadDeviceTypes()` / `saveDeviceTypes()` - 设备类型管理
- `addDeviceType()` / `deleteDeviceType()` - 类型增删
- `updateDeviceTypeIcon()` - 更新类型图标
- `exportData()` / `importData()` - 数据导入导出
- `loadWallpaper()` / `saveWallpaper()` - 壁纸管理

#### DeviceList.tsx
设备列表展示组件：
- 设备卡片展示（网格布局）
- 状态筛选（全部/可用/已借出）
- 设备操作按钮（借用/归还/删除）
- 图标显示（支持自定义类型映射）
- 响应式设计

#### HistoryLog.tsx
历史记录组件：
- 按时间倒序显示
- 日期筛选功能
- 操作类型图标标识
- 借用人信息显示

#### IconSelector.tsx
图标选择器组件：
- 18种常用图标网格选择
- 8种颜色主题选择
- 实时预览效果
- 展开/收起功能

### 性能优化

1. **React 优化**
   - 使用 `useMemo` 缓存计算结果
   - 使用 `useRef` 避免不必要的重渲染
   - 组件按需渲染

2. **数据优化**
   - 本地存储，无需网络请求
   - 数据大小检查，防止溢出
   - 壁纸本地缓存，减少请求

3. **UI 优化**
   - 响应式设计，适配各种屏幕
   - 动画过渡效果
   - 懒加载和虚拟滚动（未来优化）

---

## ❓ 常见问题

### Q1: 数据会丢失吗？

**A:** 数据存储在浏览器 localStorage 中，正常情况下不会丢失。但以下情况可能导致数据丢失：
- 清除浏览器数据
- 使用无痕模式
- 浏览器自动清理存储

**建议**：定期导出数据备份。

### Q2: 如何在不同设备间同步数据？

**A:** 当前版本不支持自动同步。可以通过以下方式：
1. 在一台设备上导出数据
2. 在另一台设备上导入数据

未来版本可能添加云端同步功能。

### Q3: 可以恢复已删除的设备吗？

**A:** 不可以。删除操作是永久性的，无法恢复。建议在删除前先导出数据备份。

### Q4: 导入数据会覆盖现有数据吗？

**A:** 是的。导入数据会完全替换当前所有数据。导入前会显示确认弹窗，请仔细确认。

### Q5: 设备类型可以删除吗？

**A:** 可以，但有以下限制：
- 不能删除正在被设备使用的类型
- 不能删除最后一个类型

删除时会自动检查使用情况。

### Q6: 图片大小有限制吗？

**A:** 是的。单个图片文件不能超过 5MB，支持格式：JPEG、PNG、GIF、WebP。

### Q7: 如何重置所有数据？

**A:** 可以通过以下方式：
1. 清除浏览器 localStorage
2. 或导入一个空的备份文件
3. 或删除所有设备后重新开始

### Q8: 支持多语言吗？

**A:** 当前版本主要支持中文和英文混合界面。未来版本可能添加完整的多语言支持。

### Q9: 可以离线使用吗？

**A:** 可以。所有功能都基于本地存储，不需要网络连接。只有壁纸功能需要网络（失败时使用默认图片）。

### Q10: 数据存储在哪里？

**A:** 数据存储在浏览器的 localStorage 中，每个域名独立存储。可以通过浏览器开发者工具查看（Application/Storage → Local Storage）。

---

## 📝 更新日志

### v1.0.0 (当前版本)

#### 新增功能
- ✅ 设备管理（添加、借用、归还、删除）
- ✅ 历史记录追踪
- ✅ 设备统计信息展示
- ✅ 设备名称智能提示（历史记录、频率排序、删除功能）
- ✅ 设备类型自定义管理
- ✅ 图标和颜色自定义（18种图标、8种颜色）
- ✅ 数据导出/导入（JSON格式、二次确认）
- ✅ 壁纸功能（每日更新、本地缓存）
- ✅ 响应式设计（移动端适配）

#### 优化改进
- ✅ 性能优化（useMemo 缓存、减少重复计算）
- ✅ 错误处理增强（详细错误提示、验证机制）
- ✅ UI/UX 优化（动画效果、交互反馈）
- ✅ 数据验证增强（格式检查、大小限制）
- ✅ 代码质量提升（TypeScript 类型安全、代码规范）

#### 技术改进
- ✅ GitHub Actions 自动部署
- ✅ SPA 路由支持（404.html）
- ✅ 构建优化（Vite 配置）

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 使用 TypeScript
- 遵循 React Hooks 最佳实践
- 保持代码简洁和可读性
- 添加必要的注释

---

## 📄 许可证

本项目采用 MIT 许可证。

---

## 📧 联系方式

- **GitHub**: [KevinYangGit](https://github.com/KevinYangGit)
- **项目地址**: https://github.com/KevinYangGit/equiptrack---device-management
- **在线演示**: https://KevinYangGit.github.io/equiptrack---device-management

---

<div align="center">
  <p>Made with ❤️ using React & TypeScript</p>
  <p>© 2024 EquipTrack. All rights reserved.</p>
</div>


