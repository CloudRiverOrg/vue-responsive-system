let obj = { counter: 0 }
let btn = ''

const effectFnSet = new Set()

let currentEffect 
function registerCurrentEffect(fn) {
  currentEffect = fn
  fn()
}
const effect = registerCurrentEffect

const objRes = new Proxy(obj, {
  get(target, key) {
    // 现在收集依赖固定函数名的耦合解除了 
    currentEffect && effectFnSet.add(currentEffect)
    return target[key]
  },
  set(target, key, newVal) {
    target[key] = newVal
    effectFnSet.forEach(fn => fn())
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
}

