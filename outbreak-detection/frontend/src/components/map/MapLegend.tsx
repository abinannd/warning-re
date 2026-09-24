export default function MapLegend() {
  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: '10px',
      borderRadius: '5px',
      zIndex: 400,
      border: '1px solid #ccc'
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>Legend</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px' }}>
        <div><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: 'red', borderRadius: '50%', marginRight: '5px' }}></span> High Risk</div>
        <div><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: 'orange', borderRadius: '50%', marginRight: '5px' }}></span> Moderate Risk</div>
        <div><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: 'green', borderRadius: '50%', marginRight: '5px' }}></span> Low Risk</div>
        <div><span style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px dashed #9c27b0', borderRadius: '50%', marginRight: '5px' }}></span> AI Signal</div>
        <div><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#f44336', opacity: 0.5, borderRadius: '50%', border: '1px solid #d32f2f', marginRight: '5px' }}></span> Cluster</div>
      </div>
    </div>
  );
}
