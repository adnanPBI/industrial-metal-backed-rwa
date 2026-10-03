import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View, StyleSheet } from 'react-native';
import { getAssets, getConfig } from './src/api';
import { PRELAUNCH_FEATURES } from './src/features';

export default function App() {
  const [assets, setAssets] = useState<any[]>([]);
  const [mode, setMode] = useState('PRE-LAUNCH');

  useEffect(() => {
    getAssets().then(x => setAssets(x.items ?? [])).catch(() => {});
    getConfig().then(x => setMode(x.mode ?? 'prelaunch')).catch(() => {});
  }, []);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.wrap}>
        <Text style={s.kicker}>RESERVECHAIN.IO</Text>
        <Text style={s.h1}>Industrial asset infrastructure</Text>
        <Text style={s.notice}>Mode: {String(mode).toUpperCase()} · No tokens are offered or sold through this application.</Text>
        {assets.map(a => (
          <View style={s.card} key={a.program_id ?? a.id}>
            <Text style={s.h2}>{a.name}</Text>
            <Text style={s.body}>Purity: {a.purity}</Text>
            <Text style={s.body}>Verification: {a.verification_status}</Text>
            <Text style={s.body}>Custody: {a.custody_status}</Text>
            <Text style={s.body}>Tokenization: {a.tokenization_status}</Text>
          </View>
        ))}
        <View style={s.card}>
          <Text style={s.h2}>Stage-gated functions</Text>
          <Text style={s.body}>Wallet: {String(PRELAUNCH_FEATURES.wallet)}</Text>
          <Text style={s.body}>Purchase: {String(PRELAUNCH_FEATURES.purchase)}</Text>
          <Text style={s.body}>Proof of Reserves: {String(PRELAUNCH_FEATURES.proofOfReserves)}</Text>
          <Text style={s.body}>Redemption: {String(PRELAUNCH_FEATURES.redemption)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#020916' },
  wrap: { padding: 24, gap: 16 },
  kicker: { color: '#77e0ff', letterSpacing: 3, fontWeight: '800' },
  h1: { color: '#fff', fontSize: 38, fontWeight: '700' },
  notice: { color: '#b8cbe0', lineHeight: 21, backgroundColor: 'rgba(20,72,132,0.22)', borderColor: 'rgba(119,224,255,0.24)', borderWidth: 1, borderRadius: 14, padding: 14 },
  card: { backgroundColor: 'rgba(10,43,84,0.72)', borderWidth: 1, borderColor: 'rgba(119,224,255,0.22)', borderRadius: 20, padding: 18, shadowColor: '#000', shadowOpacity: 0.32, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 6 },
  h2: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 9 },
  body: { color: '#a9bfd4', marginTop: 4 }
});
