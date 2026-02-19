
type Props = {
  email?: string;
};

export default function WelcomeSection({ email }: Props) {
  return (
    <section aria-label="WelcomeSection" style={{ padding: 16, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 12 }}>
      <h2 style={{ margin: "0 0 8px 0" }}>WelcomeSection</h2>
      <p style={{ margin: 0 }}>Placeholder component. Implement per FanClub design.</p>
    </section>
  );
}