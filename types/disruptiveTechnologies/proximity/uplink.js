function consume(event) {
  const { eventType } = event.data;
  const sample = {};
  let topic = eventType;

  if (eventType === "objectPresent") {
    sample.objectPresent = event.data.objectPresent.state;
    topic = "object_present";
  } else if (eventType === "touch") {
    sample.touch = true;
  } else if (eventType === "networkStatus") {
    sample.signalStrength = event.data.networkStatus.signalStrength;
    sample.rssi = event.data.networkStatus.rssi;
    sample.transmissionMode = event.data.networkStatus.transmissionMode;
    if (sample.rssi >= -50) {
      sample.sqi = 3;
    } else if (sample.rssi < -50 && sample.rssi >= -100) {
      sample.sqi = 2;
    } else {
      sample.sqi = 1;
    }
    topic = "network_status";
  } else if (eventType === "batteryStatus") {
    sample.batteryLevel = event.data.batteryStatus.percentage;
    topic = "lifecycle";
  }

  emit("sample", { data: sample, topic });
}
