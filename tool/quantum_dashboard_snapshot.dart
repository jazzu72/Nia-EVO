import 'dart:convert';

import 'package:nia_capital_os/features/quantum/api/quantum_dashboard_api.dart';
import 'package:nia_capital_os/features/quantum/services/quantum_mission_service.dart';
import 'package:nia_capital_os/features/quantum/state/quantum_player_state.dart';

void main() {
  final service = QuantumMissionService(
    missionDirectory: 'lib/features/quantum/data/missions',
  );

  final player = QuantumPlayerState(
    playerId: 'dashboard',
    currentNodeId: 'start-001',
    sparkCoins: 20,
    xp: 0,
  );

  final api = QuantumDashboardApi(service: service);
  final snapshot = api.snapshot(player: player);

  print(const JsonEncoder.withIndent('  ').convert(snapshot));
}
