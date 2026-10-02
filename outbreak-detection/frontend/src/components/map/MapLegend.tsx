export default function MapLegend() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        background:
          'linear-gradient(135deg, rgba(89, 45, 45, 0.07), rgba(121, 63, 63, 0.04))',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '14px 16px',
        borderRadius: '12px',
        zIndex: 400,
        border: '1px solid rgba(255, 255, 255, 0.16)',
        boxShadow:
          'inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 8px 25px rgba(0, 0, 0, 0.12)',
        minWidth: '145px',
        color: '#ffffff'
      }}
    >
      <h4
        style={{
          margin: '0 0 10px 0',
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: '#ffffff'
        }}
      >
        Map Legend
      </h4>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontSize: '11px'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            color: '#ffffff'
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '11px',
              height: '11px',
              backgroundColor: 'red',
              borderRadius: '50%',
              marginRight: '8px',
              flexShrink: 0
            }}
          />
          High Risk Taluk
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            color: '#ffffff'
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '11px',
              height: '11px',
              backgroundColor: 'orange',
              borderRadius: '50%',
              marginRight: '8px',
              flexShrink: 0
            }}
          />
          Moderate Risk Taluk
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            color: '#ffffff'
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '11px',
              height: '11px',
              backgroundColor: 'green',
              borderRadius: '50%',
              marginRight: '8px',
              flexShrink: 0
            }}
          />
          Low Risk Taluk
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            color: '#ffffff'
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '12px',
              height: '12px',
              border: '2px dashed #9c27b0',
              borderRadius: '50%',
              marginRight: '7px',
              flexShrink: 0
            }}
          />
          AI Signal
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            color: '#ffffff'
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '11px',
              height: '11px',
              backgroundColor: '#f44336',
              opacity: 0.65,
              borderRadius: '50%',
              border: '1px solid #d32f2f',
              marginRight: '8px',
              flexShrink: 0
            }}
          />
          Outbreak Cluster
        </div>
      </div>
    </div>
  );
}