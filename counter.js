let obj = { counter: 0 }
let btn = ''

const effectFnSet = new Set()

const objRes = new Proxy(obj, {
  get(target, key) {
    effectFnSet.add(setBtnText)
    return target[key]
  },
  set(target, key, newVal) {
    effectFnSet.forEach(fn => fn())
    target[key] = newVal
    return true
  }
})

export function setupCounter() {
  btn = document.querySelector('#counter')
  btn.addEventListener('click', () => objRes.counter++)
}

export function setBtnText() {
  btn.innerHTML = `count is ${objRes.counter}`
}

