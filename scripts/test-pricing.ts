/**
 * Sale price and "posted ago". No network.
 *
 *   node --import tsx --test scripts/test-pricing.ts
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { compareAtPrice, nextOriginalPrice } from '../lib/pricing'
import { postedAgo } from '../lib/posted'

const NOW = Date.parse('2026-11-06T18:00:00.000Z')

test('a first price has nothing to strike', () => {
  assert.equal(nextOriginalPrice(null, null, 400), null)
})

test('lowering stores the price the piece just left', () => {
  assert.equal(nextOriginalPrice(500, null, 400), 500)
})

test('lowering again stores the new previous price', () => {
  assert.equal(nextOriginalPrice(400, 500, 350), 400)
})

test('saving the same price keeps a strike that is still higher', () => {
  assert.equal(nextOriginalPrice(400, 500, 400), 500)
})

test('saving the same price with no strike stays empty', () => {
  assert.equal(nextOriginalPrice(400, null, 400), null)
})

test('raising the price clears the strike', () => {
  assert.equal(nextOriginalPrice(400, 500, 450), null)
})

test('clearing the price clears the strike', () => {
  assert.equal(nextOriginalPrice(400, 500, null), null)
})

test('a one-cent drop is a sale and an equal price is not', () => {
  assert.equal(nextOriginalPrice(10.5, null, 10.25), 10.5)
  assert.equal(nextOriginalPrice(10, null, 10), null)
})

test('compare-at only when the previous price is strictly higher', () => {
  assert.equal(compareAtPrice(400, 500), 500)
  assert.equal(compareAtPrice(500, 500), undefined)
  assert.equal(compareAtPrice(600, 500), undefined)
  assert.equal(compareAtPrice(400, null), undefined)
})

test('a few seconds ago reads as one minute', () => {
  assert.deepEqual(postedAgo(new Date(NOW - 20_000).toISOString(), NOW), {
    count: 1,
    unit: 'minute',
  })
})

test('hours, days, weeks, months and years', () => {
  assert.deepEqual(postedAgo(new Date(NOW - 3 * 60 * 60_000).toISOString(), NOW), {
    count: 3,
    unit: 'hour',
  })
  assert.deepEqual(postedAgo(new Date(NOW - 2 * 24 * 60 * 60_000).toISOString(), NOW), {
    count: 2,
    unit: 'day',
  })
  assert.deepEqual(postedAgo(new Date(NOW - 15 * 24 * 60 * 60_000).toISOString(), NOW), {
    count: 2,
    unit: 'week',
  })
  assert.deepEqual(postedAgo(new Date(NOW - 70 * 24 * 60 * 60_000).toISOString(), NOW), {
    count: 2,
    unit: 'month',
  })
  assert.deepEqual(postedAgo(new Date(NOW - 400 * 24 * 60 * 60_000).toISOString(), NOW), {
    count: 1,
    unit: 'year',
  })
})

test('a bad date is omitted', () => {
  assert.equal(postedAgo('not-a-date', NOW), null)
})
