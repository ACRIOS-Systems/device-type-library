function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};
  const topic = "default";
  lifecycle.protocolType = Bits.bitsToUnsigned(bits.substr(0, 8));
  lifecycle.manufacturerID = Hex.hexLittleEndianToBigEndian(
    payload.substr(2, 4),
    false,
  );
  lifecycle.meterID = Number(
    `${payload.substr(12, 2)}${payload.substr(10, 2)}${payload.substr(
      8,
      2,
    )}${payload.substr(6, 2)}`,
  );
  const meterMedium = Bits.bitsToUnsigned(bits.substr(56, 8));
  if (meterMedium === 3) {
    data.meterMedium = "GAS";
  } else if (meterMedium === 6) {
    data.meterMedium = "WARM_WATER";
  } else if (meterMedium === 7) {
    data.meterMedium = "WATER";
  }
  // State M-Bus
  const appError = Bits.bitsToUnsigned(bits.substr(64, 2));
  if (appError === 0) {
    lifecycle.appError = "NO_ERROR";
  } else if (appError === 1) {
    lifecycle.appError = "APPLICATION_BUSY";
  } else if (appError === 2) {
    lifecycle.appError = "ANY_APPLICATION_ERROR";
  } else if (appError === 3) {
    lifecycle.appError = "RESERVED";
  }
  lifecycle.batteryPowerLow = !!Bits.bitsToUnsigned(bits.substr(66, 1));
  lifecycle.permantError = !!Bits.bitsToUnsigned(bits.substr(67, 1));
  lifecycle.temporaryError = !!Bits.bitsToUnsigned(bits.substr(68, 1));
  lifecycle.commandError1 = !!Bits.bitsToUnsigned(bits.substr(69, 1));
  lifecycle.commandError2 = !!Bits.bitsToUnsigned(bits.substr(70, 1));
  lifecycle.commandError3 = !!Bits.bitsToUnsigned(bits.substr(71, 1));
  data.actualityDuration = Hex.hexLittleEndianToBigEndian(
    payload.substr(18, 4),
    false,
  );
  const volumeVIF = Bits.bitsToUnsigned(bits.substr(88, 8));
  data.absoluteVolume = Hex.hexLittleEndianToBigEndian(
    payload.substr(24, 8),
    false,
  );
  if (volumeVIF === 16) {
    data.absoluteVolume /= 1000000;
  } else if (volumeVIF === 17) {
    data.absoluteVolume /= 100000;
  } else if (volumeVIF === 18) {
    data.absoluteVolume /= 10000;
  } else if (volumeVIF === 19) {
    data.absoluteVolume /= 1000;
  } else if (volumeVIF === 20) {
    data.absoluteVolume /= 100;
  } else if (volumeVIF === 21) {
    data.absoluteVolume /= 10;
  }

  // Init state && Check for the case the counter reseted
  if (
    event.state.lastVolume === undefined ||
    event.state.lastVolume > data.absoluteVolume
  ) {
    event.state.lastVolume = data.absoluteVolume;
  }

  // Calculate increment
  data.volume = data.absoluteVolume - event.state.lastVolume;
  event.state.lastVolume = data.absoluteVolume;

  // Additional functions
  // reserved
  lifecycle.continuousFlow = !!Bits.bitsToUnsigned(bits.substr(129, 1));
  // reserved
  lifecycle.brokenPipe = !!Bits.bitsToUnsigned(bits.substr(131, 1));
  // reserved
  lifecycle.batteryLow = !!Bits.bitsToUnsigned(bits.substr(133, 1));
  lifecycle.backflow = !!Bits.bitsToUnsigned(bits.substr(134, 1));
  lifecycle.noUsage = !!Bits.bitsToUnsigned(bits.substr(135, 1));
  lifecycle.batteryLifetime = Bits.bitsToUnsigned(
    bits.substr(140, 1) +
      bits.substr(139, 1) +
      bits.substr(138, 1) +
      bits.substr(137, 1) +
      bits.substr(136, 1),
  );
  lifecycle.batteryLifetime *= 6; // semester to months
  lifecycle.loraLinkError = !!Bits.bitsToUnsigned(bits.substr(135, 1));
  // reserved
  // reserved
  emit("sample", { data, topic });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("state", event.state);
}
