import 'dart:convert';

enum GamePhase {
  briefing,
  planning,
  exploring,
  decision,
  resolving,
  reflecting,
  complete,
}

class WorldState {
  final String aggregateId;
  final GamePhase phase;

  // Canonical Quantum world state.
  final Map<String, int> playerResources;
  final Map<String, int> skills;
  final Map<String, int> relationships;
  final List<String> completedMissions;
  final List<String> unlockedLocations;
  final List<Map<String, dynamic>> decisions;
  final List<String> currentPath;

  // General scenario state retained for cross-format simulations.
  final Map<String, int> goalProgress;
  final Map<String, int> knowledge;

  const WorldState({
    required this.aggregateId,
    required this.phase,
    this.playerResources = const {},
    this.skills = const {},
    this.relationships = const {},
    this.completedMissions = const [],
    this.unlockedLocations = const [],
    this.decisions = const [],
    this.currentPath = const [],
    this.goalProgress = const {},
    this.knowledge = const {},
  });

  WorldState copyWith({
    GamePhase? phase,
    Map<String, int>? playerResources,
    Map<String, int>? skills,
    Map<String, int>? relationships,
    List<String>? completedMissions,
    List<String>? unlockedLocations,
    List<Map<String, dynamic>>? decisions,
    List<String>? currentPath,
    Map<String, int>? goalProgress,
    Map<String, int>? knowledge,
  }) {
    return WorldState(
      aggregateId: aggregateId,
      phase: phase ?? this.phase,
      playerResources: playerResources ?? this.playerResources,
      skills: skills ?? this.skills,
      relationships: relationships ?? this.relationships,
      completedMissions: completedMissions ?? this.completedMissions,
      unlockedLocations: unlockedLocations ?? this.unlockedLocations,
      decisions: decisions ?? this.decisions,
      currentPath: currentPath ?? this.currentPath,
      goalProgress: goalProgress ?? this.goalProgress,
      knowledge: knowledge ?? this.knowledge,
    );
  }
}

class DomainEvent {
  final String id;
  final String type;
  final String aggregateId;
  final int sequence;
  final Map<String, dynamic> payload;

  const DomainEvent({
    required this.id,
    required this.type,
    required this.aggregateId,
    required this.sequence,
    required this.payload,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type,
        'aggregateId': aggregateId,
        'sequence': sequence,
        'payload': payload,
      };

  String encode() => jsonEncode(toJson());
}

class DecisionResolved extends DomainEvent {
  DecisionResolved({
    required String aggregateId,
    required int sequence,
    required String missionId,
    required String optionId,
    required int seed,
    required List<Map<String, dynamic>> effects,
  }) : super(
          id: 'evt_${sequence.toString().padLeft(4, '0')}',
          type: 'decision_resolved',
          aggregateId: aggregateId,
          sequence: sequence,
          payload: {
            'missionId': missionId,
            'optionId': optionId,
            'seed': seed,
            'effects': effects,
          },
        );
}

abstract class WorldRepository {
  Future<WorldState?> loadSnapshot(String aggregateId);

  Future<List<DomainEvent>> loadEvents(String aggregateId);

  Future<void> appendEvents(
    String aggregateId,
    List<DomainEvent> events,
    int expectedSequence,
  );

  Future<void> saveSnapshot(
    WorldState state,
    int sequence,
  );

  Future<int> nextSequence(String aggregateId);
}

class InMemoryWorldRepository implements WorldRepository {
  final Map<String, WorldState> _snapshots = {};
  final Map<String, List<DomainEvent>> _events = {};

  @override
  Future<WorldState?> loadSnapshot(String aggregateId) async {
    return _snapshots[aggregateId];
  }

  @override
  Future<List<DomainEvent>> loadEvents(String aggregateId) async {
    return List.unmodifiable(_events[aggregateId] ?? []);
  }

  @override
  Future<void> appendEvents(
    String aggregateId,
    List<DomainEvent> events,
    int expectedSequence,
  ) async {
    final existing = _events[aggregateId] ?? [];
    final actualSequence = existing.isEmpty ? 0 : existing.last.sequence;

    if (actualSequence != expectedSequence) {
      throw StateError(
        'CONCURRENCY_CONFLICT:expected=$expectedSequence actual=$actualSequence',
      );
    }

    _events[aggregateId] = [
      ...existing,
      ...events,
    ];
  }

  @override
  Future<void> saveSnapshot(
    WorldState state,
    int sequence,
  ) async {
    _snapshots[state.aggregateId] = state;
  }

  @override
  Future<int> nextSequence(String aggregateId) async {
    final events = _events[aggregateId] ?? [];
    return events.isEmpty ? 1 : events.last.sequence + 1;
  }
}
