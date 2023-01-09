let obj = { counter: 0 }
let btn = ''

// WeakMap 相比 map： 
//  obj被回收的时候，WeakMap不会占用内存，map会拿着引用一直无法释放，需要手动删除，否则内存溢出风险
const effectBigMap = new WeakMap()

let currentEffect 
function registerCurrentEffect(fn) {
  currentEffect = fn
  fn()
}
const effect = registerCurrentEffect

const objRes = new Proxy(obj, {
  get(target, key) {
    if (!currentEffect) return target[key]
    // 每个依赖对象obj 都是WeakMap的一个key， 值为 一个depsMap(具体依赖map)，数据结构如 { counter: effectSet[] }
    let depsMap = effectBigMap.get(target)
    if (!depsMap) {
      depsMap = new Map()
      effectBigMap.set(target, depsMap)
      // effectBigMap.set(target, (depsMap = new Map()))
    }

    let deps = depsMap.get(key) // effectSet
    if (!deps) {
      depsMap.set(key,deps = new Set())
    }

    deps.add(currentEffect)
    console.log('add over', depsMap);
    return target[key]
  },
  set(target, key, newVal) {
    target[key] = newVal
    let deps = effectBigMap.get(target)?.get(key)
    deps && deps.forEach(fn => fn())
    return true
  }
})

export function setupCounter() {
  btn = document.querySelector('#counter')
  btn.addEventListener('click', () => objRes.counter++)
  effect(setBtnText)
}

export function setBtnText() {
  btn.innerHTML = `count is ${objRes.counter}`
  console.log('DOM: setBtnText', effectBigMap);
}

setTimeout(() => {
  // 每次执行赋值 DOM: setBtnText被打印一次
  objRes.a = 1
  objRes.b = 1
  objRes.c = 1
  objRes.d = 1
})

/*
effectBigMap 最后的数据结构示例

effectBigMap
  |--userInfo
      |--userName
          |-- effect1(SetItemFn)
          |-- effect2

  |--obj2
      |--key1
          |-- effect1
      |--key1
          |-- effect2
*/