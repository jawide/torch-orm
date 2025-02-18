import { DataStore, MapAdapter } from '../src';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

async function main() {
  // 创建适配器和数据存储实例
  const adapter = new MapAdapter();
  const todoStore = new DataStore<Todo>(adapter, 'todos');

  // 创建一些待办事项
  await todoStore.create({
    id: 1,
    title: '学习 TypeScript',
    completed: false,
    createdAt: new Date().toISOString()
  });

  await todoStore.create({
    id: 2,
    title: '写单元测试',
    completed: true,
    createdAt: new Date().toISOString()
  });

  await todoStore.create({
    id: 3,
    title: '实现新功能',
    completed: false,
    createdAt: new Date().toISOString()
  });

  // 查询所有未完成的待办事项
  console.log('\n未完成的待办事项:');
  const incompleteTodos = await todoStore.find({
    where: { completed: false }
  });
  console.log(incompleteTodos);

  // 按创建时间排序并限制结果
  console.log('\n最新创建的2个待办事项:');
  const latestTodos = await todoStore.find({
    sort: [['createdAt', 'desc']],
    limit: 2
  });
  console.log(latestTodos);

  // 更新待办事项
  console.log('\n更新待办事项:');
  const updated = await todoStore.update(1, { completed: true });
  console.log(updated);

  // 删除待办事项
  await todoStore.delete(2);
  
  // 查询剩余的所有待办事项
  console.log('\n剩余的待办事项:');
  const remainingTodos = await todoStore.find();
  console.log(remainingTodos);

  // 清空所有待办事项
  await todoStore.clear();
  console.log('\n清空后的待办事项:');
  const emptyTodos = await todoStore.find();
  console.log(emptyTodos);
}

main().catch(console.error); 