import '../models/quantum_dashboard_snapshot.dart';
import '../services/quantum_mission_service.dart';
import '../state/quantum_player_state.dart';

class QuantumDashboardApi {
  final QuantumMissionService service;

  const QuantumDashboardApi({
    required this.service,
  });

  Map<String, dynamic> snapshot({
    required QuantumPlayerState player,
  }) {
    final dashboard = service.dashboardSnapshot(
      player: player,
    );

    return dashboard.toJson();
  }

  QuantumDashboardSnapshot snapshotModel({
    required QuantumPlayerState player,
  }) {
    return service.dashboardSnapshot(
      player: player,
    );
  }
}
