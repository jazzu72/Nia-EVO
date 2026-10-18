enum GamePhase {
  idle,
  started,
  exploring,
  planning,
  confirmation,
  resolution,
}

sealed class GameCommand {
  const GameCommand();

  const factory GameCommand.start(String missionId) = StartCommand;
  const factory GameCommand.explore() = ExploreCommand;
  const factory GameCommand.plan() = PlanCommand;
  const factory GameCommand.confirmPlan() = ConfirmPlanCommand;
  const factory GameCommand.decide(
    String missionId,
    String decisionId, {
    int seed,
  }) = DecideCommand;
}

class StartCommand extends GameCommand {
  final String missionId;
  const StartCommand(this.missionId);
}

class ExploreCommand extends GameCommand {
  const ExploreCommand();
}

class PlanCommand extends GameCommand {
  const PlanCommand();
}

class ConfirmPlanCommand extends GameCommand {
  const ConfirmPlanCommand();
}

class DecideCommand extends GameCommand {
  final String missionId;
  final String decisionId;
  final int seed;

  const DecideCommand(
    this.missionId,
    this.decisionId, {
    this.seed = 0,
  });
}

class GameState {
  final GamePhase phase;
  final String? missionId;

  const GameState({
    this.phase = GamePhase.idle,
    this.missionId,
  });

  GameState copyWith({
    GamePhase? phase,
    String? missionId,
  }) {
    return GameState(
      phase: phase ?? this.phase,
      missionId: missionId ?? this.missionId,
    );
  }
}

class ScenarioResult {
  final String scenarioId;
  final List<String> learningSignals;
  final List<String> recoveryOptions;
  final Map<String, num> resourceChanges;
  final List<String> consequences;
  final GamePhase nextPhase;

  const ScenarioResult({
    required this.scenarioId,
    required this.learningSignals,
    required this.recoveryOptions,
    required this.resourceChanges,
    required this.consequences,
    required this.nextPhase,
  });
}

class Transition {
  final GameState state;
  final ScenarioResult? scenario;

  const Transition({
    required this.state,
    this.scenario,
  });
}

class RulesEngine {
  ScenarioResult resolve({
    required String missionId,
    required String decisionId,
    required int seed,
  }) {
    return ScenarioResult(
      scenarioId: missionId,
      learningSignals: const [
        'strategic_planning',
        'resource_tradeoff',
        'decision_consequence',
      ],
      recoveryOptions: const [
        'rebalance_resources',
        'review_strategy',
        'try_alternate_path',
      ],
      resourceChanges: const {
        'strategy': 1,
      },
      consequences: [
        'Decision "$decisionId" resolved deterministically with seed $seed.'
      ],
      nextPhase: GamePhase.resolution,
    );
  }
}

class QuantumStateMachine {
  GameState state;
  final Map<String, dynamic> missions;
  final RulesEngine engine;

  QuantumStateMachine({
    required GameState initialState,
    required this.missions,
    required this.engine,
  }) : state = initialState;

  Transition dispatch(GameCommand command) {
    if (command is StartCommand) {
      if (!missions.containsKey(command.missionId)) {
        throw StateError('MISSION_NOT_FOUND:${command.missionId}');
      }

      state = state.copyWith(
        phase: GamePhase.started,
        missionId: command.missionId,
      );

      return Transition(state: state);
    }

    if (command is ExploreCommand) {
      state = state.copyWith(phase: GamePhase.exploring);
      return Transition(state: state);
    }

    if (command is PlanCommand) {
      state = state.copyWith(phase: GamePhase.planning);
      return Transition(state: state);
    }

    if (command is ConfirmPlanCommand) {
      state = state.copyWith(phase: GamePhase.confirmation);
      return Transition(state: state);
    }

    if (command is DecideCommand) {
      final result = engine.resolve(
        missionId: command.missionId,
        decisionId: command.decisionId,
        seed: command.seed,
      );

      state = state.copyWith(phase: result.nextPhase);

      return Transition(
        state: state,
        scenario: result,
      );
    }

    throw StateError('UNSUPPORTED_COMMAND');
  }
}
