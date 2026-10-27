import 'quantum_events.dart';

class EventReplay {
  static WorldState replay({
    required WorldState initialState,
    required List<DomainEvent> events,
  }) {
    var state = initialState;

    for (final event in events) {
      if (event.type != 'decision_resolved') continue;

      final effects = event.payload['effects'];
      if (effects is! List) continue;

      final goals = Map<String, int>.from(state.goalProgress);
      final knowledge = Map<String, int>.from(state.knowledge);

      for (final raw in effects) {
        if (raw is! Map) continue;

        final type = raw['type'];
        final key = raw['key'];
        final amount = raw['amount'];

        if (key is! String || amount is! num) continue;

        if (type == 'goalProgress') {
          goals[key] = (goals[key] ?? 0) + amount.toInt();
        } else if (type == 'knowledge') {
          knowledge[key] = (knowledge[key] ?? 0) + amount.toInt();
        }
      }

      state = state.copyWith(
        phase: GamePhase.resolving,
        goalProgress: goals,
        knowledge: knowledge,
      );
    }

    return state;
  }
}
