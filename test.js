/**
 * @import {Root} from 'mdast'
 */

import assert from 'node:assert/strict'
import {execFile as execFileCallback} from 'node:child_process'
import process from 'node:process'
import test from 'node:test'
import {promisify} from 'node:util'
import {VFileMessage} from 'vfile-message'

const execFile = promisify(execFileCallback)

/* eslint-disable no-undef -- `variable` is undefined on purpose. */
/** @type {Error} */
let exception
/** @type {Error} */
let changedMessage
/** @type {Error} */
let multilineException

try {
  // @ts-expect-error: we want to capture this error.
  variable = 1
} catch (error_) {
  const error = /** @type {Error} */ (error_)
  exception = error
}

try {
  // @ts-expect-error: we want to capture this error.
  variable = 1
} catch (error_) {
  const error = /** @type {Error} */ (error_)
  error.message = 'foo'
  changedMessage = error
}

try {
  // @ts-expect-error: we want to capture this error.
  variable = 1
} catch (error_) {
  const error = /** @type {Error} */ (error_)
  error.message = 'foo\nbar\nbaz'
  multilineException = error
}
/* eslint-enable no-undef */

test('core', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('vfile-message')).sort(), [
      'VFileMessage'
    ])
  })
})

test('VFileMessage', async function (t) {
  await t.test('should create an error', async function () {
    assert.ok(new VFileMessage('') instanceof Error)
  })

  await t.test('should support a reason', async function () {
    const message = new VFileMessage('Foo')

    assert.equal(message.message, 'Foo')
    assert.equal(message.reason, 'Foo')
  })

  await t.test('should set defaults', async function () {
    const message = new VFileMessage('')

    assert.equal(message.column, undefined)
    assert.equal(message.fatal, undefined)
    assert.equal(message.file, '')
    assert.equal(message.line, undefined)
    assert.equal(message.name, '1:1')
    assert.equal(message.place, undefined)
    assert.equal(message.ruleId, undefined)
    assert.equal(message.source, undefined)
    assert.equal(message.stack, '')
  })

  await t.test('should serialize w/ `toString()`', async function () {
    assert.equal(String(new VFileMessage('Foo')), '1:1: Foo')
  })

  await t.test('should support an error', async function () {
    const message = new VFileMessage(exception)

    assert.equal(message.message, 'variable is not defined')
    assert.equal(
      String(message.stack).split('\n', 1)[0],
      'ReferenceError: variable is not defined'
    )
  })

  await t.test(
    'should support an error w/ a changed message',
    async function () {
      const message = new VFileMessage(changedMessage)

      assert.equal(message.message, 'foo')
      assert.equal(
        String(message.stack).split('\n', 1)[0],
        'ReferenceError: foo'
      )
    }
  )

  await t.test(
    'should support an error w/ a multiline message',
    async function () {
      const message = new VFileMessage(multilineException)

      assert.equal(message.message, 'foo\nbar\nbaz')
      assert.equal(
        String(message.stack).split('\n').slice(0, 3).join('\n'),
        'ReferenceError: foo\nbar\nbaz'
      )
    }
  )

  await t.test('should support a node', async function () {
    const position = {start: {line: 2, column: 3}, end: {line: 2, column: 5}}
    const message = new VFileMessage('test', {type: 'x', position})

    assert.deepEqual(message.place, position)
    assert.equal(String(message), '2:3-2:5: test')
  })

  await t.test('should support a node w/o position', async function () {
    assert.equal(String(new VFileMessage('test', {type: 'x'})), '1:1: test')
  })

  await t.test('should support a typed node', async function () {
    /** @type {Root} */
    const node = {
      type: 'root',
      children: [],
      position: {start: {line: 1, column: 1}, end: {line: 2, column: 1}}
    }

    assert.equal(String(new VFileMessage('test', node)), '1:1-2:1: test')
  })

  await t.test('should support a position', async function () {
    const position = {start: {line: 2, column: 3}, end: {line: 2, column: 5}}
    const message = new VFileMessage('test', position)

    assert.deepEqual(message.place, position)
    assert.equal(String(message), '2:3-2:5: test')
  })

  await t.test('should support a point', async function () {
    const point = {line: 2, column: 3}
    const message = new VFileMessage('test', point)

    assert.deepEqual(message.place, point)
    assert.equal(String(message), '2:3: test')
  })

  await t.test('should support a `ruleId` as `origin`', async function () {
    assert.equal(new VFileMessage('test', 'charlie').ruleId, 'charlie')
  })

  await t.test(
    'should support a `source` and `ruleId` as `origin`',
    async function () {
      const message = new VFileMessage('test', 'delta:echo')

      assert.equal(message.source, 'delta')
      assert.equal(message.ruleId, 'echo')
    }
  )

  await t.test('should support `options.ancestors`', async function () {
    const node = {type: 'x'}
    const message = new VFileMessage('test', {ancestors: [node]})

    assert.deepEqual(message.ancestors, [node])
  })

  await t.test(
    'should use the position of the last ancestor as `place`',
    async function () {
      const position = {start: {line: 2, column: 3}, end: {line: 2, column: 5}}
      const message = new VFileMessage('test', {
        ancestors: [{type: 'x'}, {type: 'y', position}]
      })

      assert.deepEqual(message.place, position)
    }
  )

  await t.test('should support `options.cause`', async function () {
    const cause = new Error('cause')
    const message = new VFileMessage('test', {cause})

    assert.equal(message.cause, cause)
    assert.equal(message.reason, 'test')
  })

  await t.test('should support `options.place`', async function () {
    const message = new VFileMessage('test', {
      place: {start: {line: 2, column: 3}, end: {line: 2, column: 5}}
    })

    assert.equal(message.line, 2)
    assert.equal(message.column, 3)
  })

  await t.test(
    'should support `options.ruleId`, `options.source`',
    async function () {
      const message = new VFileMessage('test', {
        ruleId: 'my-rule',
        source: 'my-package'
      })

      assert.equal(message.ruleId, 'my-rule')
      assert.equal(message.source, 'my-package')
    }
  )

  await t.test(
    'should set defaults on `VFileMessage.prototype`',
    async function () {
      assert.deepEqual(
        Object.getOwnPropertyDescriptor(VFileMessage.prototype, 'stack'),
        {configurable: true, enumerable: true, value: '', writable: true}
      )
    }
  )

  await t.test(
    'should not call setters on `Error.prototype`',
    async function () {
      const code = [
        'const sets = []',
        'for (const key of ["message", "name", "stack"]) {',
        '  Object.defineProperty(Error.prototype, key, {',
        '    configurable: true,',
        '    set() { sets.push(key) }',
        '  })',
        '}',
        'const {VFileMessage} = await import("vfile-message")',
        'new VFileMessage("")',
        'console.log(JSON.stringify(sets))'
      ].join('\n')
      const {stdout} = await execFile(
        process.execPath,
        ['--conditions', 'development', '--input-type=module', '--eval', code],
        {cwd: new URL('.', import.meta.url), encoding: 'utf8'}
      )

      assert.deepEqual(JSON.parse(stdout), [])
    }
  )
})
