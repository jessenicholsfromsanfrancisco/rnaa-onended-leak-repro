import React, { useEffect, useState } from 'react';
import { Text, View, Button } from 'react-native';
import { AudioContext } from 'react-native-audio-api';

// Every second: a new AudioBufferSourceNode on a 16 s buffer, played for 1 s.
// With onEnded set, Hermes external memory grows ~12 MB/s and is never collected.
// Without it (disconnect on a timer instead), it stays flat.
export default function App() {
  const [mb, setMb] = useState(0);
  const [withOnEnded, setWithOnEnded] = useState(true);

  useEffect(() => {
    const ctx = new AudioContext();
    const buf = ctx.createBuffer(2, ctx.sampleRate * 16, ctx.sampleRate);
    const play = setInterval(() => {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      if (withOnEnded) src.onEnded = () => { src.disconnect(); src.onEnded = null; };
      else setTimeout(() => src.disconnect(), 1500);
      src.start();
      src.stop(ctx.currentTime + 1);
    }, 1000);
    const read = setInterval(() => {
      const s = global.HermesInternal?.getInstrumentedStats?.();
      if (s) setMb(Math.round(s.js_externalBytes / 1e6));
    }, 2000);
    return () => { clearInterval(play); clearInterval(read); ctx.close(); };
  }, [withOnEnded]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <Text style={{ fontSize: 28 }}>js_externalBytes: {mb} MB</Text>
      <Text>onEnded is {withOnEnded ? 'ON (leaks)' : 'OFF (flat)'}</Text>
      <Button title="toggle onEnded" onPress={() => setWithOnEnded((v) => !v)} />
    </View>
  );
}
