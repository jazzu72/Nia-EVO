import 'scenario_result.dart';
import 'quantum_events.dart';

class QuantumTransition {
  final WorldState state;
  final ScenarioResult? scenario;

  const QuantumTransition({
    required this.state,
    this.scenario,
  });
}
