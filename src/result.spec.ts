import {
  err,
  fromPromise,
  isResult,
  ok,
  Result,
} from "./result"

describe('ts-result', () => {
  describe('creation', () => {
    it('creates an ok result', () => {
      const result = ok('foo')

      expect(result.isOk()).toBe(true)
      expect(result).toBeInstanceOf(Result)
    })

    it('creates an err result', () => {
      const error = new Error('oopsie!')
      const result = err(error)

      expect(result.isErr()).toBe(true)
      expect(result).toBeInstanceOf(Result)
    })
  })

  describe('isResult', () => {
    it('verifies an ok result', () => {
      const result = ok(1)
      expect(isResult(result)).toBe(true)
    })

    it('verifies an err result', () => {
      const result = err(new Error('boom'))
      expect(isResult(result)).toBe(true)
    })

    it('verifies non-results', () => {
      expect(isResult({ isErr: false } as any)).toBe(false)
      expect(isResult({ isOk: true } as any)).toBe(false)
      expect(isResult({ isOk: true, value: 1 } as any)).toBe(false)
      expect(isResult({} as any)).toBe(false)
      expect(isResult(null as any)).toBe(false)
      expect(isResult(undefined as any)).toBe(false)
      expect(isResult([] as any)).toBe(false)
    })
  })

  describe('matchResult', () => {
    it('matches an ok result', () => {
      const result = ok(10)

      const newValue = result.match({
        ok: (value) => value * 2,
        err: (e) => e
      })

      expect(newValue).toBe(20)
    })

    it('matches an err result', () => {
      const result = err(new Error('foo'))

      const newValue = result.match({
        ok: (_) => 'bar',
        err: (err) => err.message
      })

      expect(newValue).toBe('foo')
    })
  })

  describe('unwrap', () => {
    it('unwraps an ok result', () => {
      const result = ok(100)
      expect(result.unwrap()).toBe(100)
    })

    it('throws when trying to unwrap an err', () => {
      const e = new Error('failed')
      const result = err(e)
            
      expect(() => result.unwrap()).toThrow(e)
    })
  })

  describe('unwrapOrElse', () => {
    it('unwraps an ok result', () => {
      const result = ok(100)
      const value = result.unwrapOrElse(() => 0)
      expect(value).toBe(100)
    })

    it('returns computed value when result if err', () => {
      const result = err(new Error('failed'))
      const value = result.unwrapOrElse(() => 0)
      expect(value).toBe(0)
    })
  })

  describe('unwrapOrDefault', () => {
    it('returns a default value is result is err', () => {
      const result = err(new Error('boom'))
      const value = result.unwrapOrDefault(99)
      expect(value).toBe(99)
    })

    it('can return nullish values as default', () => {
      const result = err(new Error('failed'))
      const value1 = result.unwrapOrDefault(null)
      const value2 = result.unwrapOrDefault(undefined)
      const value3 = result.unwrapOrDefault('')
      const value4 = result.unwrapOrDefault(0)

      expect(value1).toBe(null)
      expect(value2).toBe(undefined)
      expect(value3).toBe('')
      expect(value4).toBe(0)
    })
  })

  describe('mapOk', () => {
    it('maps ok values, leaving errs untouched', () => {
      const error = new Error('do not touch me')

      const values = [
        ok(1),
        err(error),
        ok(2)
      ].map((result) =>result.mapOk((value) => value * 2))

      expect(values[0].unwrap()).toBe(2)
      expect(values[1].unwrapErr()).toBe(error)
      expect(values[2].unwrap()).toBe(4)
    })
  })

  describe('mapErr', () => {
    it('maps err values, leaving oks untouched', () => {
      const error1 = new Error('hello')
      const error2 = new Error('hey')

      const values = [
        err(error1),
        ok('foo'),
        err(error2)
      ]
        .map((result) => result.mapErr((value) => new Error(`${value.message} world`)))

        expect(values[0].unwrapErr()).toMatchObject({ message: 'hello world'})
        expect(values[1].unwrap()).toBe('foo')
        expect(values[2].unwrapErr()).toMatchObject({ message: 'hey world'})
    })
  })

  describe('fromPromise', () => {
    it('retuns an ok result from a fulfilled promise', async () => {
      const result = await fromPromise(Promise.resolve(10))
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(10)
    })

    it('retuns an err result from a rejected promise', async () => {
      const error = new Error('rejected!')
      const result = await fromPromise(Promise.reject(error))
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr()).toBe(error)
    })
  })
})
