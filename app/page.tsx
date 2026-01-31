export default function Page() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <iframe
        src="/main.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          margin: 0,
          padding: 0,
          display: 'block'
        }}
        title="MigrateX"
      />
    </div>
  );
}
