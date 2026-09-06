"""
Modular Attack Layer Factory for Q-SHIELD BB84 Simulator.
"""

import numpy as np
from simulation.types import AttackType
from simulation.attacks.base import BaseAttackLayer
from simulation.attacks.none import NoAttack
from simulation.attacks.pns import PNSAttack
from simulation.attacks.trojan_horse import TrojanHorseAttack
from simulation.attacks.detector_blinding import DetectorBlindingAttack
from simulation.attacks.mitm import MITMAttack


def create_attack(attack_type: str, intensity: float, rng: np.random.Generator) -> BaseAttackLayer:
    """
    Instantiates modular attack handler based on attack_type and intensity scale.
    """
    atk_str = str(attack_type).lower().strip()

    if atk_str == AttackType.NONE or atk_str == "none" or intensity <= 0.0:
        return NoAttack(intensity=0.0, rng=rng)
    elif atk_str == AttackType.PNS or atk_str == "pns":
        return PNSAttack(intensity=intensity, rng=rng)
    elif atk_str == AttackType.TROJAN_HORSE or atk_str == "trojan_horse":
        return TrojanHorseAttack(intensity=intensity, rng=rng)
    elif atk_str == AttackType.DETECTOR_BLINDING or atk_str == "detector_blinding":
        return DetectorBlindingAttack(intensity=intensity, rng=rng)
    elif atk_str == AttackType.MITM or atk_str == "mitm":
        return MITMAttack(intensity=intensity, rng=rng)
    else:
        raise ValueError(f"Unknown attack type: '{attack_type}'. Allowed: none, pns, trojan_horse, detector_blinding, mitm")


__all__ = [
    "BaseAttackLayer",
    "NoAttack",
    "PNSAttack",
    "TrojanHorseAttack",
    "DetectorBlindingAttack",
    "MITMAttack",
    "create_attack",
]
