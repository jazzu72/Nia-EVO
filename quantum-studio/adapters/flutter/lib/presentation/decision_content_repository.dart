import 'dart:convert';
import 'dart:io';

import 'decision_view_model.dart';

class DecisionContentRepository {
  final String worldPath;

  const DecisionContentRepository({
    this.worldPath = 'quantum-studio/worlds/money-munchkins/world.json',
  });

  Map<String, dynamic> loadWorld() {
    final decoded = jsonDecode(File(worldPath).readAsStringSync());

    if (decoded is! Map<String, dynamic>) {
      throw const FormatException(
        'INVALID_WORLD_JSON',
      );
    }

    return decoded;
  }

  DecisionViewModel? decision(String nodeId) {
    final world = loadWorld();
    final nodes = world['decisionNodes'];

    if (nodes is! List) return null;

    for (final rawNode in nodes) {
      if (rawNode is! Map) continue;
      if (rawNode['id'] != nodeId) continue;

      final rawOptions = rawNode['options'];
      final options = <DecisionOptionViewModel>[];

      if (rawOptions is List) {
        for (final rawOption in rawOptions) {
          if (rawOption is! Map) continue;

          final id = rawOption['id']?.toString();
          if (id == null || id.isEmpty) continue;

          options.add(
            DecisionOptionViewModel(
              id: id,
              label: rawOption['label']?.toString() ?? id,
              description: rawOption['description']?.toString() ?? '',
              enabled: true,
            ),
          );
        }
      }

      return DecisionViewModel(
        nodeId: nodeId,
        prompt: rawNode['prompt']?.toString() ?? 'Choose your path.',
        options: options,
        reflectionPrompt: rawNode['reflectionPrompt']?.toString(),
      );
    }

    return null;
  }
}
