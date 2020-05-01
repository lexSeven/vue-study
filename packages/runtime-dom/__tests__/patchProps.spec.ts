import { patchProp } from '../src/patchProp'
import { render, h } from '../src'

describe('runtime-dom: props patching', () => {
  test('basic', () => {
    const el = document.createElement('div')
    patchProp(el, 'id', null, 'foo')
    expect(el.id).toBe('foo')
    // prop with string value should be set to empty string on null values
    patchProp(el, 'id', null, null)
    expect(el.id).toBe('')
  })

  test('value', () => {
    const el = document.createElement('input')
    patchProp(el, 'value', null, 'foo')
    expect(el.value).toBe('foo')
    patchProp(el, 'value', null, null)
    expect(el.value).toBe('')
    const obj = {}
    patchProp(el, 'value', null, obj)
    expect(el.value).toBe(obj.toString())
    expect((el as any)._value).toBe(obj)
  })

  test('boolean prop', () => {
    const el = document.createElement('select')
    patchProp(el, 'multiple', null, '')
    expect(el.multiple).toBe(true)
    patchProp(el, 'multiple', null, null)
    expect(el.multiple).toBe(false)
  })

  test('innerHTML unmount prev children', () => {
    const fn = jest.fn()
    const comp = {
      render: () => 'foo',
      unmounted: fn
    }
    const root = document.createElement('div')
    render(h('div', null, [h(comp)]), root)
    expect(root.innerHTML).toBe(`<div>foo</div>`)

    render(h('div', { innerHTML: 'bar' }), root)
    expect(root.innerHTML).toBe(`<div>bar</div>`)
    expect(fn).toHaveBeenCalled()
  })

  // #954
  test('(svg) innerHTML unmount prev children', () => {
    const fn = jest.fn()
    const comp = {
      render: () => 'foo',
      unmounted: fn
    }
    const root = document.createElement('div')
    render(h('div', null, [h(comp)]), root)
    expect(root.innerHTML).toBe(`<div>foo</div>`)

    render(h('svg', { innerHTML: '<g></g>' }), root)
    expect(root.innerHTML).toBe(`<svg><g></g></svg>`)
    expect(fn).toHaveBeenCalled()
  })

  test('textContent unmount prev children', () => {
    const fn = jest.fn()
    const comp = {
      render: () => 'foo',
      unmounted: fn
    }
    const root = document.createElement('div')
    render(h('div', null, [h(comp)]), root)
    expect(root.innerHTML).toBe(`<div>foo</div>`)

    render(h('div', { textContent: 'bar' }), root)
    expect(root.innerHTML).toBe(`<div>bar</div>`)
    expect(fn).toHaveBeenCalled()
  })

  // #1049
  test('set value as-is for non string-value props', () => {
    const el = document.createElement('video')
    // jsdom doesn't really support video playback. srcObject in a real browser
    // should default to `null`, but in jsdom it's `undefined`.
    // anyway, here we just want to make sure Vue doesn't set non-string props
    // to an empty string on nullish values - it should reset to its default
    // value.
    const intiialValue = el.srcObject
    const fakeObject = {}
    patchProp(el, 'srcObject', null, fakeObject)
    expect(el.srcObject).not.toBe(fakeObject)
    patchProp(el, 'srcObject', null, null)
    expect(el.srcObject).toBe(intiialValue)
  })
})