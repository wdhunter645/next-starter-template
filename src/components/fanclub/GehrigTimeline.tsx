export default function GehrigTimeline() {
  const events = [
    { year: '1903', text: 'Born in New York City.' },
    { year: '1923', text: 'Debuts with the New York Yankees.' },
    { year: '1927', text: 'Key member of the “Murderers’ Row” Yankees.' },
    { year: '1939', text: 'Delivers farewell speech at Yankee Stadium.' },
    { year: '1941', text: 'Passes away from ALS.' },
  ];

  return (
    <section
      aria-label="Gehrig timeline"
      style={{ padding: 16, borderRadius: 16, border: '1px solid rgba(0,0,0,0.12)', background: 'rgba(255,255,255,0.72)' }}
    >
      <h2 style={{ margin: 0, fontSize: 20 }}>Gehrig Timeline</h2>
      <ul style={{ marginTop: 10, paddingLeft: 18 }}>
        {events.map((e) => (
          <li key={e.year} style={{ marginBottom: 6 }}>
            <strong>{e.year}:</strong> {e.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
