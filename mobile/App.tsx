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
        <Text style={s.kicker}>RESERVECHAIN.IO · PRE-LAUNCH</Text>
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
  safe: { flex: 1, backgroundColor: '#07090e' },
  wrap: { padding: 24, gap: 16 },
  kicker: { color: '#f4d086', letterSpacing: 3, fontWeight: '800' },
  h1: { color: '#fbf6ee', fontSize: 36, fontWeight: '700' },
  notice: { color: '#e6dccb', lineHeight: 21, backgroundColor: 'rgba(216,158,72,0.12)', borderColor: 'rgba(224,168,88,0.34)', borderWidth: 1, borderRadius: 14, padding: 14 },
  card: { backgroundColor: 'rgba(18,24,35,0.92)', borderWidth: 1, borderColor: 'rgba(224,168,88,0.28)', borderRadius: 20, padding: 18, shadowColor: '#000', shadowOpacity: 0.32, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 6 },
  h2: { color: '#ffdfb5', fontSize: 20, fontWeight: '700', marginBottom: 9 },
  body: { color: '#c9d2dd', marginTop: 4 }
});
