"""
Privacy Amplification Module for BB84 QKD Simulation.

Privacy Amplification:
  Reduces potential information leaked to an eavesdropper during classical error reconciliation.
  Transforms the `reconciled_key` into a shorter, highly secure `final_secret_key` using SHA-256 cryptographic hashing.
"""

from typing import List, Tuple
import hashlib
from simulation.types import PrivacyAmplificationStats


def amplify_privacy(
    reconciled_key: List[int],
    qber: float,
    security_parameter_bits: int = 32
) -> Tuple[str, List[int], PrivacyAmplificationStats]:
    """
    Perform privacy amplification on reconciled key.
    Returns:
      - Final key hex string
      - Final key as binary list (0s and 1s)
      - PrivacyAmplificationStats object
    """
    n = len(reconciled_key)
    if n == 0:
        stats = PrivacyAmplificationStats(
            reconciled_key_length=0,
            final_key_length=0,
            compression_ratio=0.0
        )
        return "", [], stats

    # Pack bits into bytes for hashing
    key_bytes = bytearray()
    for i in range(0, n, 8):
        byte_chunk = reconciled_key[i:i+8]
        byte_val = 0
        for bit in byte_chunk:
            byte_val = (byte_val << 1) | bit
        key_bytes.append(byte_val)

    # Compute cryptographic hash (SHA-256)
    digest = hashlib.sha256(key_bytes).digest()
    digest_hex = hashlib.sha256(key_bytes).hexdigest()

    # Determine targeted target final key length in bits
    # Final key length target = max(16, n // 2) capped by hash length (256 bits)
    target_bits = max(16, min(256, n // 2))
    target_bytes = (target_bits + 7) // 8

    final_hex = digest_hex[:target_bytes * 2]

    # Convert digest to bit list
    final_bits: List[int] = []
    for b in digest[:target_bytes]:
        for shift in range(7, -1, -1):
            if len(final_bits) < target_bits:
                final_bits.append((b >> shift) & 1)

    compression_ratio = round(len(final_bits) / n, 3) if n > 0 else 0.0

    stats = PrivacyAmplificationStats(
        reconciled_key_length=n,
        final_key_length=len(final_bits),
        compression_ratio=compression_ratio
    )

    return final_hex, final_bits, stats
