const mockStore = require('../utils/mockData');

exports.getBusTelemetry = async (req, res) => {
  try {
    const telemetry = mockStore.liveBusTelemetry;
    // Simulate slight live variance for realism
    const speedVariation = Math.floor(Math.random() * 8) - 4;
    const baseSpeed = 36;
    const currentSpeed = `${Math.max(20, baseSpeed + speedVariation)} km/h`;

    res.json({
      success: true,
      telemetry: {
        ...telemetry,
        currentSpeed,
        lastPing: new Date().toLocaleTimeString()
      }
    });
  } catch (error) {
    console.error('Error fetching bus telemetry:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving telemetry' });
  }
};

exports.getBusRoute = async (req, res) => {
  try {
    res.json({
      success: true,
      route: mockStore.busRoute,
      telemetry: mockStore.liveBusTelemetry
    });
  } catch (error) {
    console.error('Error fetching bus route:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving route' });
  }
};

exports.updateBusLocation = async (req, res) => {
  try {
    const { currentLocation, nextStop, etaNextStop, currentSpeed } = req.body;
    if (currentLocation) mockStore.liveBusTelemetry.currentLocation = currentLocation;
    if (nextStop) mockStore.liveBusTelemetry.nextStop = nextStop;
    if (etaNextStop) mockStore.liveBusTelemetry.etaNextStop = etaNextStop;
    if (currentSpeed) mockStore.liveBusTelemetry.currentSpeed = currentSpeed;

    res.json({
      success: true,
      message: 'Bus telemetry updated successfully',
      telemetry: mockStore.liveBusTelemetry
    });
  } catch (error) {
    console.error('Error updating bus telemetry:', error);
    res.status(500).json({ success: false, message: 'Server error updating telemetry' });
  }
};
