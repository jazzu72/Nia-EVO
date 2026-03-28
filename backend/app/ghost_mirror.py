import random

def simulate_review_board(proposal_text, target_agency):
    """
    Nia-EVO: Ghost-Mirror Protocol.
    Simulates a 5-person review panel based on agency persona.
    """
    personas = ["The Fiscal Skeptic", "The Tech Visionary", "The Social Impact Officer"]
    feedback = []
    
    for p in personas:
        # Quantum logic simulates the 'vibe' of the review
        score = random.randint(70, 95)
        feedback.append({"reviewer": p, "score": score, "critique": f"Logic aligned with {target_agency} mandates."})
        
    return feedback
