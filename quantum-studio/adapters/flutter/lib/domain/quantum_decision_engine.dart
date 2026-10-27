import 'quantum_events.dart';
import 'quantum_state_machine.dart';
import 'scenario_result.dart';
import 'scenario_rules.dart';
import 'scenario_rules_repository.dart';

class QuantumDecisionEngine {
  final QuantumStateMachine machine;
  final WorldRepository repository;
  final ScenarioRules rules;

  QuantumDecisionEngine(
    this.machine, {
    required this.repository,
    ScenarioRules? rules,
  }) : rules = rules ?? const ScenarioRulesRepository().load();

  Future<ScenarioResult> resolve({
    required String missionId,
    required String optionId,
    required int seed,
    required List<Map<String, dynamic>> effects,
  }) async {
    if (machine.state.phase != GamePhase.decision) {
      throw StateError(
        'INVALID_PHASE_FOR_DECISION:${machine.state.phase}',
      );
    }

    final nextSequence =
        await repository.nextSequence(machine.state.aggregateId);
    final expectedSequence = nextSequence - 1;

    final event = DecisionResolved(
      aggregateId: machine.state.aggregateId,
      sequence: nextSequence,
      missionId: missionId,
      optionId: optionId,
      seed: seed,
      effects: effects,
    );

    await repository.appendEvents(
      machine.state.aggregateId,
      [event],
      expectedSequence,
    );

    machine.state = machine.state.copyWith(
      phase: GamePhase.resolving,
    );

    return ScenarioResult(
      missionId: missionId,
      optionId: optionId,
      seed: seed,
      effects: effects,
      learningSignals: rules.signalsFor(optionId),
      recoveryOptions: rules.recoveryFor(optionId),
    );
  }
}
