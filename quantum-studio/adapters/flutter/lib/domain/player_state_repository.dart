import 'quantum_events.dart';

abstract class PlayerStateRepository {
  Future<WorldState?> load(String aggregateId);

  Future<void> save(
    WorldState state,
    int expectedVersion,
  );

  Future<int> version(String aggregateId);
}

class InMemoryPlayerStateRepository implements PlayerStateRepository {
  final Map<String, WorldState> _states = {};
  final Map<String, int> _versions = {};

  @override
  Future<WorldState?> load(String aggregateId) async {
    return _states[aggregateId];
  }

  @override
  Future<void> save(
    WorldState state,
    int expectedVersion,
  ) async {
    final actualVersion = _versions[state.aggregateId] ?? 0;

    if (actualVersion != expectedVersion) {
      throw StateError(
        'CONCURRENCY_CONFLICT:'
        'expected=$expectedVersion '
        'actual=$actualVersion',
      );
    }

    _states[state.aggregateId] = state;
    _versions[state.aggregateId] = actualVersion + 1;
  }

  @override
  Future<int> version(String aggregateId) async {
    return _versions[aggregateId] ?? 0;
  }
}
