import { groupDoctors, slugifyDoctorId } from '../doctors';

describe('slugifyDoctorId', () => {
  it('lowercases and dasherises whitespace', () => {
    expect(slugifyDoctorId('Christy Schumm')).toBe('christy-schumm');
    expect(slugifyDoctorId('Dr. Geovany Keebler')).toBe('dr.-geovany-keebler');
  });

  it("strips disallowed characters but keeps apostrophes' meaning", () => {
    expect(slugifyDoctorId("Elyssa O'Kon")).toBe('elyssa-okon');
  });

  it('collapses multiple separators', () => {
    expect(slugifyDoctorId('Foo   Bar')).toBe('foo-bar');
  });
});

describe('groupDoctors', () => {
  const sample = [
    {
      name: 'Christy Schumm',
      timezone: 'Australia/Sydney',
      day_of_week: 'Monday',
      available_at: ' 9:00AM',
      available_until: ' 5:30PM',
    },
    {
      name: 'Christy Schumm',
      timezone: 'Australia/Sydney',
      day_of_week: 'Tuesday',
      available_at: ' 8:00AM',
      available_until: ' 4:00PM',
    },
    {
      name: 'Dr. Geovany Keebler',
      timezone: 'Australia/Perth',
      day_of_week: 'Thursday',
      available_at: ' 7:00AM',
      available_until: ' 2:00PM',
    },
    {
      name: 'Dr. Geovany Keebler',
      timezone: 'Australia/Perth',
      day_of_week: 'Thursday',
      available_at: ' 3:00PM',
      available_until: ' 5:00PM',
    },
  ];

  it('groups rows by doctor name', () => {
    const doctors = groupDoctors(sample);
    expect(doctors).toHaveLength(2);
    const christy = doctors.find((d) => d.name === 'Christy Schumm');
    expect(christy?.windows).toHaveLength(2);
    expect(christy?.timezone).toBe('Australia/Sydney');
  });

  it('keeps multiple windows on the same day', () => {
    const doctors = groupDoctors(sample);
    const geo = doctors.find((d) => d.name === 'Dr. Geovany Keebler');
    expect(geo?.windows).toHaveLength(2);
    expect(geo?.windows.every((w) => w.dayOfWeek === 'Thursday')).toBe(true);
  });

  it('returns doctors sorted by name', () => {
    const doctors = groupDoctors(sample);
    expect(doctors.map((d) => d.name)).toEqual(['Christy Schumm', 'Dr. Geovany Keebler']);
  });

  it('returns empty array for non-array input', () => {
    expect(groupDoctors(null)).toEqual([]);
    expect(groupDoctors(undefined)).toEqual([]);
    expect(groupDoctors({})).toEqual([]);
    expect(groupDoctors('nope')).toEqual([]);
  });

  it('skips malformed rows but keeps the rest', () => {
    const mixed = [
      ...sample.slice(0, 1),
      { name: 123, timezone: 'X', day_of_week: 'Monday' },
      { name: 'Foo', timezone: 'Australia/Sydney', day_of_week: 'NotADay', available_at: '9:00AM', available_until: '5:00PM' },
      { name: 'Bar', timezone: 'Australia/Sydney', day_of_week: 'Monday', available_at: 'rubbish', available_until: '5:00PM' },
      null,
      undefined,
    ];
    const doctors = groupDoctors(mixed);
    expect(doctors).toHaveLength(1);
    expect(doctors[0].name).toBe('Christy Schumm');
  });

  it('skips windows where end is not after start', () => {
    const rows = [
      {
        name: 'Zero',
        timezone: 'Australia/Sydney',
        day_of_week: 'Monday',
        available_at: ' 9:00AM',
        available_until: ' 9:00AM',
      },
      {
        name: 'Zero',
        timezone: 'Australia/Sydney',
        day_of_week: 'Tuesday',
        available_at: ' 9:00AM',
        available_until: ' 8:00AM',
      },
    ];
    expect(groupDoctors(rows)).toEqual([]);
  });

  it('skips conflicting timezone rows for same doctor', () => {
    const rows = [
      {
        name: 'Conflict',
        timezone: 'Australia/Sydney',
        day_of_week: 'Monday',
        available_at: '9:00AM',
        available_until: '5:00PM',
      },
      {
        name: 'Conflict',
        timezone: 'Australia/Perth',
        day_of_week: 'Tuesday',
        available_at: '9:00AM',
        available_until: '5:00PM',
      },
    ];
    const doctors = groupDoctors(rows);
    expect(doctors).toHaveLength(1);
    expect(doctors[0].timezone).toBe('Australia/Sydney');
    expect(doctors[0].windows).toHaveLength(1);
    expect(doctors[0].windows[0].dayOfWeek).toBe('Monday');
  });
});
