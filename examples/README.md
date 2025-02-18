# Torch ORM 示例

本目录包含了一些使用 Torch ORM 的示例代码。

## 运行示例

1. 首先确保已经安装了所有依赖：
```bash
pnpm install
```

2. 编译 TypeScript 代码：
```bash
pnpm build
```

3. 运行示例：

### MapAdapter 示例
```bash
# 运行 MapAdapter 示例
pnpm ts-node examples/map-adapter.ts
```

这个示例展示了：
- 如何创建和使用 MapAdapter
- 如何进行基本的 CRUD 操作
- 如何使用查询功能（where、sort、limit）
- 如何处理数据关系

## 示例说明

### map-adapter.ts
这个示例实现了一个简单的待办事项管理系统，展示了：
- 创建待办事项
- 查询未完成的待办事项
- 按创建时间排序
- 更新待办事项状态
- 删除待办事项
- 清空所有待办事项 