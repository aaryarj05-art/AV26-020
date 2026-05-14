import React from 'react';
import DataFusionPanel from '../components/DataFusionPanel';

export default function DataSources() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-helix-text mb-1">Data <span className="text-helix-accent">Sources & Fusion</span></h1>
        <p className="text-helix-text-muted text-sm">Real-time status of all intelligence arrays powering Helix</p>
      </div>
      
      <DataFusionPanel />
    </div>
  );
}
