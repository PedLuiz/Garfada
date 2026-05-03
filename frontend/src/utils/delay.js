export function delay(ms = 450) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
