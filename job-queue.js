// 任务队列
export const jobs = new Set()
// 是否执行中
let isExecuting = false
// 执行任务
export function executeJob () {
  if (isExecuting) return
  isExecuting = true
  Promise.resolve().then(() => {
    jobs.forEach(fn => fn())
  }).finally(() => {
    isExecuting = false
  })
}