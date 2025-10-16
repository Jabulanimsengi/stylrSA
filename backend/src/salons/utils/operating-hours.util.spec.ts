import {
  normalizeOperatingHours,
  DEFAULT_OPERATING_HOURS,
} from './operating-hours.util';

describe('normalizeOperatingHours', () => {
  it('normalizes HH:MM:SS values down to HH:MM and preserves custom hours', () => {
    const result = normalizeOperatingHours([
      { day: 'Monday', open: '08:00:00', close: '18:30:00' },
      { day: 'Sunday', open: '09:15:00', close: '14:45:00' },
    ]);

    expect(result).toEqual([
      { day: 'Monday', open: '08:00', close: '18:30' },
      { day: 'Sunday', open: '09:15', close: '14:45' },
    ]);
  });

  it('still falls back to defaults when no input is provided', () => {
    expect(normalizeOperatingHours(undefined)).toEqual(DEFAULT_OPERATING_HOURS);
  });
});
