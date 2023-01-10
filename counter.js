let obj = { counter: 0, disabled: false }
let btn = ''

const bucket = new WeakMap()

let currentEffect 
function effect(fn) {
  currentEffect = fn
  fn()
}

function track(target, key) {
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
}

function trigger(target, key) {
  let deps = bucket.get(target)?.get(key)
  deps && deps.forEach(fn => fn())
}

const objRes = new Proxy(obj, {
  get(target, key) {
    if (!currentEffect) return target[key]
    track(target, key)
    return target[key]
  },
  set(target, key, newVal) {
    target[key] = newVal
    trigger(target, key)
    return true
  }
})

export function setupCounter() {
  btn = document.querySelector('#counter')
  btn.addEventListener('click', () => {
    objRes.counter++
    if (objRes.counter > 10 && !objRes.disabled) {
      objRes.disabled = true
    }
  })
  effect(setBtnText)
}

export function setBtnText() {
  // 当 objRes.disabled 为 true 时， counter的变更应该不触发 setBtnText
  btn.innerHTML = objRes.disabled ? 'disabled' : `count is ${objRes.counter}`
  console.log('DOM: setBtnText', bucket);
}

