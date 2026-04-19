import React, { useState, useEffect } from 'react';
import './StadiumMap.css';

const ZONES = [
  { id: 'north', name: 'North Stand', className: 'stand-north' },
  { id: 'south', name: 'South Stand', className: 'stand-south' },
  { id: 'east', name: 'East Stand', className: 'stand-east' },
  { id: 'west', name: 'West Stand', className: 'stand-west' },
];

export default function StadiumMap() {
  const [densities, setDensities] = useState({
    north: 'low',
    south: 'med',
    east: 'low',
    west: 'high',
  });

  // Simulate real-time crowd changes
  useEffect(() => {
    const interval = setInterval(() => {
      const statuses = ['low', 'med', 'high'];
      setDensities(prev => {
        const newDensities = { ...prev };
        // Randomly change one zone's density
        const keys = Object.keys(newDensities);
        const randomZone = keys[Math.floor(Math.random() * keys.length)];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        newDensities[randomZone] = randomStatus;
        return newDensities;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getDensityClass = (status) => {
    switch(status) {
      case 'low': return 'density-low';
      case 'med': return 'density-med';
      case 'high': return 'density-high';
      default: return 'density-low';
    }
  };

  const getCapacityText = (status) => {
    switch(status) {
      case 'low': return '20% Full';
      case 'med': return '65% Full';
      case 'high': return '95% Full';
      default: return '0% Full';
    }
  };

  return (
    <div className="stadium-wrapper">
      <div className="stand stand-concourse"></div>
      <div className="pitch"></div>
      
      {ZONES.map(zone => (
        <div 
          key={zone.id} 
          className={`stand ${zone.className} ${getDensityClass(densities[zone.id])}`}
        >
          <div className="zone-label">
            <span>{zone.name}</span>
            <span className="zone-capacity">{getCapacityText(densities[zone.id])}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
