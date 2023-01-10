let obj = { counter: 0, disabled: false }
let btn = ''

const bucket = new WeakMap()

let currentEffect 

function clearUp (proxyFn) {
  proxyFn.deps.forEach(depsSetData => {
    // set 相比 array 更有优势
    depsSetData.delete(proxyFn)
    console.log('clearUp', depsSetData);
  })
  // 不清空会越来越多
  proxyFn.deps.length = 0
}

function effect(fn) {
  // 代理一层 方便存储 被引用的set集合方便到时候清除
  let proxyFn = () => { 
    clearUp(proxyFn)
    currentEffect = proxyFn
    fn()
  }
  proxyFn.deps = []
  proxyFn()
}

function track(target, key) {
  if (!currentEffect) return
  
  // 每个依赖对象obj 都是WeakMap的一个key， 值为 一个depsMap(具体依赖map)，数据结构如 { counter: effectSet[] }
  let depsMap = bucket.get(target)
  if (!depsMap) {
    bucket.set(target, depsMap = new Map())
  }

  let deps = depsMap.get(key) // effectSet
  if (!deps) {
    depsMap.set(key,deps = new Set())
  }

  deps.add(currentEffect)
  // push(target, key)
  currentEffect.deps.push(deps)
}

function trigger(target, key) {
  let deps = bucket.get(target)?.get(key)
  if (deps) {
    // 避免在循环中的时候 set里面又进行了插入操作，导致无限循环
    let depsToRun = new Set(deps)
    depsToRun.forEach(fn => fn())
  }
}

const objRes = new Proxy(obj, {
  get(target, key) {
    if (!currentEffect) return target[key]
    console.log('Proxy.get', key);
    track(target, key)
    return target[key]
  },
  set(target, key, newVal) {
    target[key] = newVal
    trigger(target, key)
    console.log('Proxy.set', key);
    return true
  }
})
let counterCache = 0
let disabledCache = false
export function setupCounter() {
  btn = document.querySelector('#counter')
  btn.addEventListener('click', () => {
    counterCache++
    objRes.counter = counterCache
    if (Math.random() > 0.6 && !disabledCache) {
      objRes.disabled = true
      disabledCache = true
    }
  })
  effect(setBtnText)
}

export function setBtnText() {
  // 当 objRes.disabled 为 true 时， counter的变更应该不触发 setBtnText
  btn.innerHTML = objRes.disabled ? 'disabled' : `count is ${objRes.counter}`
  console.log('DOM: setBtnText', bucket);
}

