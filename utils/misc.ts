export const debounce = <T extends (...args: any) => void>(
  fn: T,
  ms: number,
) => {
  let timer: any
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      fn.apply(this, args)
    }, ms)
  }
}
