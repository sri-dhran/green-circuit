import React, { memo } from 'react';
import './GlassBackground.css';

const ECO_ICONS = ['♻', '⚡', '🌿', '💡', '🔋', '🌍'];

const GlassBackground = ({ showEcoIcons = true, showSpheres = true }) => {
  return (
    <div className="gc-global-bg" aria-hidden="true">
      {/* Radial gradient background layers */}
      <div className="gc-bg-gradient" />

      {/* Subtle circuit grid overlay */}
      <div className="gc-bg-circuit-grid" />

      {/* Floating glowing gradient blobs */}
      <div className="gc-bg-blobs">
        <div className="gc-bg-blob gc-bg-blob-1" />
        <div className="gc-bg-blob gc-bg-blob-2" />
        <div className="gc-bg-blob gc-bg-blob-3" />
        <div className="gc-bg-blob gc-bg-blob-4" />
      </div>

      {/* Floating glass spheres */}
      {showSpheres && (
        <div className="gc-bg-spheres">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`gc-bg-sphere gc-bg-sphere-${i + 1}`} />
          ))}
        </div>
      )}

      {/* Floating eco / recycling icons */}
      {showEcoIcons && (
        <div className="gc-bg-icons">
          {ECO_ICONS.map((icon, i) => (
            <div key={i} className={`gc-bg-icon gc-bg-icon-${i + 1}`}>
              {icon}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(GlassBackground);
