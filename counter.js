let obj = { counter: 0 }
let btn = document.querySelector('#counter')

export function setupCounter() {
  btn.addEventListener('click', () => obj.counter++)
}

export function setBtnText() {
  btn.innerHTML = `count is ${obj.counter}`
}

function effect () {
  // 结果 按钮点击后 触发 obj.counter++, 按钮内的内容文本自动更新
}