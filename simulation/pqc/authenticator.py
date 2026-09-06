"""
Stage 4 Post-Quantum Classical-Channel Authentication (ML-DSA / CRYSTALS-Dilithium).

Implements the `IPQCAuthenticator` interface using NIST FIPS 204 ML-DSA-65 digital signatures.
Protects classical BB84 communications (e.g. basis reconciliation, sifting parameters)
against active Man-in-the-Middle (MITM) tampering, session replay, and message substitution.
"""

import time
import json
import uuid
from typing import Dict, Any, Tuple, Optional
from dilithium_py.ml_dsa import ML_DSA_65
from simulation.interfaces import IPQCAuthenticator


class MLDSAAuthenticator(IPQCAuthenticator):
    """
    ML-DSA (CRYSTALS-Dilithium) Post-Quantum Digital Signature Authenticator.
    Provides cryptographic authentication for classical BB84 basis reconciliation messages.
    """

    def __init__(self, algorithm_name: str = "ML-DSA-65 (NIST FIPS 204)"):
        self.algorithm_name = algorithm_name
        self.public_key: Optional[bytes] = None
        self._private_key: Optional[bytes] = None
        self.keygen_time_ms: float = 0.0

    def generate_keypair(self) -> Tuple[bytes, bytes]:
        """
        Generate ML-DSA-65 post-quantum signing keypair (Alice's keys).

        :return: Tuple of (public_key_bytes, private_key_bytes)
        """
        t0 = time.perf_counter()
        pk, sk = ML_DSA_65.keygen()
        self.keygen_time_ms = round((time.perf_counter() - t0) * 1000.0, 3)
        self.public_key = pk
        self._private_key = sk
        return pk, sk

    @staticmethod
    def canonicalize_message(payload: Dict[str, Any]) -> bytes:
        """
        Canonicalize classical message structure into a deterministic byte stream
        ensuring bit-exact representation for signing and verification across parties.
        """
        return json.dumps(payload, sort_keys=True, separators=(',', ':')).encode('utf-8')

    def sign(self, sk: bytes, message_bytes: bytes) -> Tuple[bytes, float]:
        """
        Generate ML-DSA-65 post-quantum digital signature for canonical message bytes.

        :param sk: Sender's secret/private signing key
        :param message_bytes: Canonical byte stream
        :return: Tuple of (signature_bytes, signing_time_ms)
        """
        t0 = time.perf_counter()
        signature = ML_DSA_65.sign(sk, message_bytes)
        signing_time_ms = round((time.perf_counter() - t0) * 1000.0, 3)
        return signature, signing_time_ms

    def verify(self, pk: bytes, message_bytes: bytes, signature_bytes: bytes) -> Tuple[bool, float]:
        """
        Verify ML-DSA-65 post-quantum digital signature against canonical message bytes.

        :param pk: Sender's public verification key
        :param message_bytes: Message byte stream to verify
        :param signature_bytes: Signature byte stream
        :return: Tuple of (is_valid_boolean, verification_time_ms)
        """
        t0 = time.perf_counter()
        try:
            is_valid = ML_DSA_65.verify(pk, message_bytes, signature_bytes)
        except Exception:
            is_valid = False
        verification_time_ms = round((time.perf_counter() - t0) * 1000.0, 3)
        return is_valid, verification_time_ms

    def authenticate_channel(
        self,
        classical_message: bytes,
        signature: bytes
    ) -> bool:
        """
        IPQCAuthenticator interface compatibility method.
        """
        if self.public_key is None:
            raise ValueError("Public key not set. Call generate_keypair() first.")
        valid, _ = self.verify(self.public_key, classical_message, signature)
        return valid

    def process_bb84_classical_exchange(
        self,
        session_id: str,
        alice_bases_str: str,
        mitm_active: bool = False,
        eve_tampered_bases_str: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Simulate complete PQC-authenticated classical basis reconciliation exchange.

        :param session_id: Simulation session identifier for session binding
        :param alice_bases_str: Alice's original basis string (e.g. "+×++×+")
        :param mitm_active: Whether active Eve MITM tampering is attempted
        :param eve_tampered_bases_str: Modified basis string injected by Eve
        :return: Structured authentication summary dictionary
        """
        # 1. Key Generation
        pk, sk = self.generate_keypair()

        # 2. Build Canonical Message Payload with Session Binding
        alice_payload = {
            "protocol": "BB84",
            "session_id": session_id,
            "sender": "alice",
            "receiver": "bob",
            "message_type": "basis_reconciliation",
            "bases": alice_bases_str,
            "sequence": 1
        }
        canonical_alice_bytes = self.canonicalize_message(alice_payload)

        # 3. Alice Signs Message with ML-DSA-65 Private Key
        signature_bytes, sign_time_ms = self.sign(sk, canonical_alice_bytes)

        # 4. Transmission over Classical Channel with optional Eve MITM Tampering
        if mitm_active and eve_tampered_bases_str:
            bob_received_payload = dict(alice_payload)
            bob_received_payload["bases"] = eve_tampered_bases_str
            message_modified = (eve_tampered_bases_str != alice_bases_str)
        else:
            bob_received_payload = alice_payload
            message_modified = False

        canonical_bob_bytes = self.canonicalize_message(bob_received_payload)

        # 5. Bob Cryptographically Verifies Signature against Received Message
        sig_valid, verify_time_ms = self.verify(pk, canonical_bob_bytes, signature_bytes)

        # 6. Bob Decision & MITM Outcome Logic
        message_accepted = sig_valid
        mitm_blocked = message_modified and not sig_valid

        if message_modified and not sig_valid:
            explanation = (
                f"Active classical MITM tampering detected! Eve altered Alice's basis reconciliation message "
                f"during transit. ML-DSA-65 signature verification FAILED. Bob REJECTED the tampered message, "
                f"successfully blocking the MITM attack."
            )
        elif message_modified and sig_valid:
            explanation = "SECURITY BREACH: Tampered message passed signature verification."
        else:
            explanation = (
                f"Classical basis reconciliation message successfully verified with ML-DSA-65 digital signature. "
                f"No classical message tampering detected. Message ACCEPTED by Bob."
            )

        return {
            "enabled": True,
            "algorithm": self.algorithm_name,
            "signature_generated": True,
            "signature_valid": sig_valid,
            "message_modified": message_modified,
            "message_accepted": message_accepted,
            "mitm_blocked": mitm_blocked,
            "session_id": session_id,
            "sequence": 1,
            "key_generation_time_ms": self.keygen_time_ms,
            "signing_time_ms": sign_time_ms,
            "verification_time_ms": verify_time_ms,
            "total_authentication_time_ms": round(self.keygen_time_ms + sign_time_ms + verify_time_ms, 3),
            "public_key_bytes": len(pk),
            "private_key_bytes": len(sk),
            "signature_bytes": len(signature_bytes),
            "original_bases_sample": alice_bases_str[:20] + ("..." if len(alice_bases_str) > 20 else ""),
            "received_bases_sample": bob_received_payload["bases"][:20] + ("..." if len(bob_received_payload["bases"]) > 20 else ""),
            "explanation": explanation
        }
