class DecisionOptionViewModel {
  final String id;
  final String label;
  final String description;
  final bool enabled;

  const DecisionOptionViewModel({
    required this.id,
    required this.label,
    required this.description,
    required this.enabled,
  });
}

class DecisionViewModel {
  final String nodeId;
  final String prompt;
  final List<DecisionOptionViewModel> options;
  final String? reflectionPrompt;

  const DecisionViewModel({
    required this.nodeId,
    required this.prompt,
    required this.options,
    this.reflectionPrompt,
  });

  DecisionOptionViewModel? option(String id) {
    for (final option in options) {
      if (option.id == id) return option;
    }

    return null;
  }

  bool canChoose(String id) {
    final selected = option(id);
    return selected != null && selected.enabled;
  }
}
