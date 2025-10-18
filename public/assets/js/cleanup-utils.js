// Utility functions for cleaning up orphaned data
(function() {
  'use strict';

  const MEASURE_PREFIX = 'measurements:';

  // Function to find and clean orphaned measurement data
  function cleanOrphanedMeasurements() {
    if (!window.ST || !ST.clients) {
      console.warn('StyleTrack core not loaded');
      return 0;
    }

    const clients = ST.clients.all();
    const clientIds = clients.map(c => c.id);
    const clientNames = clients.map(c => c.name);
    
    let removedCount = 0;
    const keysToRemove = [];
    
    // Scan all localStorage keys for orphaned measurements
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(MEASURE_PREFIX)) {
        const clientId = key.replace(MEASURE_PREFIX, '').split('|')[0];
        const isOrphaned = !clientIds.includes(clientId) && !clientNames.includes(clientId);
        if (isOrphaned) {
          keysToRemove.push(key);
        }
      }
    }
    
    // Remove orphaned keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      removedCount++;
    });
    
    console.log(`Cleaned up ${removedCount} orphaned measurement records`);
    return removedCount;
  }

  // Function to get orphaned measurement info
  function getOrphanedMeasurements() {
    if (!window.ST || !ST.clients) {
      return [];
    }

    const clients = ST.clients.all();
    const clientIds = clients.map(c => c.id);
    const clientNames = clients.map(c => c.name);
    
    const orphanedKeys = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(MEASURE_PREFIX)) {
        const clientId = key.replace(MEASURE_PREFIX, '').split('|')[0];
        const isOrphaned = !clientIds.includes(clientId) && !clientNames.includes(clientId);
        if (isOrphaned) {
          orphanedKeys.push({
            key: key,
            clientId: clientId,
            data: JSON.parse(localStorage.getItem(key) || '{}')
          });
        }
      }
    }
    
    return orphanedKeys;
  }

  // Auto-cleanup on page load if there are orphaned measurements
  document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for ST to be loaded
    setTimeout(() => {
      const orphaned = getOrphanedMeasurements();
      if (orphaned.length > 0) {
        console.log(`Found ${orphaned.length} orphaned measurement records. Auto-cleaning...`);
        cleanOrphanedMeasurements();
        
        // Trigger dashboard update if available
        if (window.renderCounts && typeof window.renderCounts === 'function') {
          window.renderCounts();
        }
      }
    }, 100);
  });

  // Expose functions globally for manual use
  window.StyleTrackCleanup = {
    cleanOrphanedMeasurements,
    getOrphanedMeasurements
  };

})();