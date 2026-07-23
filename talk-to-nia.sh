#!/bin/bash

echo "🧠 Connecting to Nia..."
echo ""
echo "Type a message to Nia. She will respond."
echo "Type 'exit' to quit."
echo ""

while true; do
  read -p "You: " input
  if [[ "$input" == "exit" ]]; then
    echo "Disconnecting."
    break
  fi
  echo "Nia: Thinking..."
  # This would trigger the LLM response pipeline
  # For now, it simulates a response
  echo "Nia: I am online and ready to close deals. What is your next directive?"
done
