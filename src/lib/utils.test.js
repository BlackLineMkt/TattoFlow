import { describe, it, expect } from 'vitest'
import { cleanPhone, formatPhone, buildWhatsAppUrl, getDaysSince, isLate } from './utils'

describe('cleanPhone', () => {
  it('removes all non-digit characters', () => {
    expect(cleanPhone('(11) 99999-8888')).toBe('11999998888')
    expect(cleanPhone('11999998888')).toBe('11999998888')
    expect(cleanPhone('+55 (11) 99999-8888')).toBe('5511999998888')
  })
})

describe('formatPhone', () => {
  it('formats 11-digit number as (XX) XXXXX-XXXX', () => {
    expect(formatPhone('11999998888')).toBe('(11) 99999-8888')
  })
  it('formats 10-digit number as (XX) XXXX-XXXX', () => {
    expect(formatPhone('1199998888')).toBe('(11) 9999-8888')
  })
  it('returns raw digits if not 10 or 11 digits', () => {
    expect(formatPhone('123')).toBe('123')
    expect(formatPhone('')).toBe('')
  })
  it('cleans non-digits before formatting', () => {
    expect(formatPhone('(11) 99999-8888')).toBe('(11) 99999-8888')
  })
})

describe('buildWhatsAppUrl', () => {
  it('prepends country code 55 and builds wa.me URL', () => {
    expect(buildWhatsAppUrl('11999998888')).toBe('https://wa.me/5511999998888')
  })
  it('cleans non-digit chars before building URL', () => {
    expect(buildWhatsAppUrl('(11) 99999-8888')).toBe('https://wa.me/5511999998888')
  })
})

describe('getDaysSince', () => {
  it('returns 0 for a date just now', () => {
    expect(getDaysSince(new Date().toISOString())).toBe(0)
  })
  it('returns 2 for a date 2 days ago', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86_400_000).toISOString()
    expect(getDaysSince(twoDaysAgo)).toBe(2)
  })
})

describe('isLate', () => {
  it('returns false for leads updated today', () => {
    expect(isLate(new Date().toISOString())).toBe(false)
  })
  it('returns false for leads updated 3 days ago', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86_400_000).toISOString()
    expect(isLate(threeDaysAgo)).toBe(false)
  })
  it('returns true for leads updated more than 3 days ago', () => {
    const fourDaysAgo = new Date(Date.now() - 4 * 86_400_000).toISOString()
    expect(isLate(fourDaysAgo)).toBe(true)
  })
})
