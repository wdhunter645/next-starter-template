export default function GehrigTimeline() {
  // Timeline events - can be expanded with more detail than public milestones
  const timelineEvents = [
    {
      year: '1903',
      title: 'Birth',
      description: 'Born June 19, 1903, in New York City to German immigrant parents.',
    },
    {
      year: '1923',
      title: 'Yankees Debut',
      description: 'Signed with the New York Yankees and made his major league debut.',
    },
    {
      year: '1925',
      title: 'The Streak Begins',
      description: 'Started his consecutive games played streak on June 1, 1925.',
    },
    {
      year: '1927',
      title: 'Murderers\' Row',
      description: 'Part of the legendary 1927 Yankees lineup alongside Babe Ruth.',
    },
    {
      year: '1934',
      title: 'Triple Crown',
      description: 'Won the Triple Crown, leading the league in batting average, home runs, and RBIs.',
    },
    {
      year: '1939',
      title: 'Farewell Speech',
      description: 'Delivered his famous "Luckiest Man" speech at Yankee Stadium on July 4, 1939.',
    },
    {
      year: '1941',
      title: 'Passing',
      description: 'Passed away on June 2, 1941, at the age of 37 from ALS.',
    },
    {
      year: '1969',
      title: 'MLB\'s Greatest First Baseman',
      description: 'Named the greatest first baseman of all time as part of baseball\'s centennial celebration.',
    },
  ];

  return (
    <section style={{
      padding: '32px 20px',
      maxWidth: 900,
      margin: '0 auto',
    }}>
      <h2 style={{
        fontSize: 22,
        margin: '0 0 20px 0',
        fontWeight: 700,
        textAlign: 'center',
      }}>
        Gehrig Timeline
      </h2>

      {/* Timeline */}
      <div style={{
        position: 'relative',
        paddingLeft: 40,
      }}>
        {/* Vertical line */}
        <div style={{
          position: 'absolute',
          left: 15,
          top: 0,
          bottom: 0,
          width: 2,
          background: 'var(--lgfc-blue)',
          opacity: 0.3,
        }} />

        {/* Events */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {timelineEvents.map((event, index) => (
            <div key={index} style={{ position: 'relative' }}>
              {/* Dot */}
              <div style={{
                position: 'absolute',
                left: -33,
                top: 4,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: 'var(--lgfc-blue)',
                border: '3px solid #fff',
                boxShadow: '0 0 0 1px var(--lgfc-blue)',
              }} />

              {/* Content */}
              <div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--lgfc-blue)',
                  marginBottom: 4,
                }}>
                  {event.year}
                </div>
                <div style={{
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 4,
                }}>
                  {event.title}
                </div>
                <div style={{
                  fontSize: 14,
                  color: 'rgba(0,0,0,0.7)',
                  lineHeight: 1.5,
                }}>
                  {event.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
