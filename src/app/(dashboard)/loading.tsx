export default function DashboardLoading() {
  return (
    <div style={{ padding: "40px 32px" }}>
      <div style={{ height: 28, width: 220, borderRadius: 8, background: "var(--line)", marginBottom: 24, animation: "pulse 1.4s ease-in-out infinite" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ height: 120, borderRadius: 14, background: "var(--line)", animation: "pulse 1.4s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
      <div style={{ height: 200, borderRadius: 14, background: "var(--line)", animation: "pulse 1.4s ease-in-out infinite" }} />
      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4 } 50% { opacity: 0.8 } }`}</style>
    </div>
  );
}
