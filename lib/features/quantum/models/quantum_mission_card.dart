import 'quantum_mission.dart';
import 'quantum_mission_status.dart';

class QuantumMissionCard {
  final QuantumMission mission;
  final QuantumMissionStatus status;

  const QuantumMissionCard({
    required this.mission,
    required this.status,
  });

  Map<String, dynamic> toJson() => {
        'mission': mission.toJson(),
        'status': status.name,
      };
}
