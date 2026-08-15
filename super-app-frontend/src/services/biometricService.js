/**
 * biometricService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Full WebAuthn / Passkey flow connected to the real FastAPI backend.
 *
 * REGISTER (called after account creation):
 *   1. POST /api/passkey/register/begin/  → get PublicKeyCredentialCreationOptions
 *   2. navigator.credentials.create(options) → user does Face ID / Fingerprint
 *   3. POST /api/passkey/register/finish/ → backend stores public key in DB
 *
 * AUTHENTICATE (called on login):
 *   1. POST /api/passkey/auth/begin/  → get PublicKeyCredentialRequestOptions + challenge
 *   2. navigator.credentials.get(options) → user authenticates with biometric
 *   3. POST /api/passkey/auth/finish/ → backend verifies signature → returns JWT
 */

// ─── API base ────────────────────────────────────────────────────────────────
// Vite proxies /api → http://localhost:8000, so we use relative paths
const API = '/api/passkey';

async function apiPost(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || `Request failed: ${res.status}`);
  }
  return data;
}

// ─── Base64url helpers ────────────────────────────────────────────────────────

function bufferToBase64url(buffer) {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlToBuffer(base64url) {
  if (!base64url || typeof base64url !== 'string') {
    return new Uint8Array(0).buffer;
  }
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

/**
 * Convert the JSON options from the server into proper WebAuthn format
 * (challenge and credential IDs must be ArrayBuffers, not strings).
 */
function prepareCreationOptions(optionsInput) {
  let serverOptions = optionsInput;
  if (typeof serverOptions === 'string') {
    try {
      serverOptions = JSON.parse(serverOptions);
    } catch (e) {
      console.error('Failed to parse server registration options:', e);
    }
  }

  const userObj = serverOptions?.user || {};
  return {
    ...serverOptions,
    challenge: base64urlToBuffer(serverOptions?.challenge),
    user: {
      ...userObj,
      id: base64urlToBuffer(userObj.id),
    },
    authenticatorSelection: {
      authenticatorAttachment: 'platform', // Hardware sensor
      userVerification: 'required',
      residentKey: 'preferred',
    },
    excludeCredentials: (serverOptions?.excludeCredentials || []).map(c => ({
      ...c,
      id: base64urlToBuffer(c.id),
    })),
  };
}

function prepareRequestOptions(optionsInput) {
  let serverOptions = optionsInput;
  if (typeof serverOptions === 'string') {
    try {
      serverOptions = JSON.parse(serverOptions);
    } catch (e) {
      console.error('Failed to parse server authentication options:', e);
    }
  }

  return {
    ...serverOptions,
    challenge: base64urlToBuffer(serverOptions?.challenge),
    userVerification: 'required',
    allowCredentials: (serverOptions?.allowCredentials || []).map(c => ({
      ...c,
      id: base64urlToBuffer(c.id),
    })),
  };
}

/**
 * Serialize a PublicKeyCredential returned by navigator.credentials.create()
 * into a plain JSON object that can be sent to the backend.
 */
function serializeRegistrationCredential(credential) {
  return {
    id: credential.id,
    rawId: bufferToBase64url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToBase64url(credential.response.clientDataJSON),
      attestationObject: bufferToBase64url(credential.response.attestationObject),
    },
  };
}

/**
 * Serialize a PublicKeyCredential returned by navigator.credentials.get()
 * into a plain JSON object that can be sent to the backend.
 */
function serializeAuthenticationCredential(credential) {
  return {
    id: credential.id,
    rawId: bufferToBase64url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToBase64url(credential.response.clientDataJSON),
      authenticatorData: bufferToBase64url(credential.response.authenticatorData),
      signature: bufferToBase64url(credential.response.signature),
      userHandle: credential.response.userHandle
        ? bufferToBase64url(credential.response.userHandle)
        : null,
    },
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Check if the browser/device supports WebAuthn platform authenticators
 * (Face ID, Touch ID, Windows Hello, Android biometrics).
 */
export async function isBiometricAvailable() {
  try {
    if (!window.PublicKeyCredential) return false;
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/**
 * Register a passkey for the given username.
 * Call this AFTER the user has successfully created their account.
 *
 * @param {string} username - The user's username
 * @param {string} deviceName - Label for the device: "Face ID" | "Fingerprint" | "Windows Hello"
 * @returns {{ success: boolean, error?: string }}
 */
export async function registerPasskey(username, deviceName = 'Passkey') {
  try {
    // Step 1: Get creation options from the server
    const options = await apiPost('/register/begin/', { username });

    // Step 2: Trigger the native biometric dialog
    const credential = await navigator.credentials.create({
      publicKey: prepareCreationOptions(options),
    });

    if (!credential) {
      return { success: false, error: 'Biometric dialog was cancelled.' };
    }

    // Step 3: Send credential to the server for verification + storage
    const result = await apiPost('/register/finish/', {
      username,
      credential: serializeRegistrationCredential(credential),
      device_name: deviceName,
    });

    return { success: true, credentialId: result.credential_id, deviceName: result.device_name };
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      return { success: false, error: 'Biometric registration was cancelled or denied.' };
    }
    if (err.name === 'InvalidStateError') {
      return { success: false, error: 'This device is already registered as a passkey for this account.' };
    }
    return { success: false, error: err.message || 'Passkey registration failed.' };
  }
}

/**
 * Authenticate using a registered passkey.
 * Returns full JWT tokens + user object on success (same as normal login response).
 *
 * @param {string} username - The username identifying whose passkeys to offer
 * @returns {{ success: boolean, access?: string, refresh?: string, user?: object, error?: string }}
 */
export async function authenticateWithPasskey(username) {
  try {
    // Step 1: Get authentication options + challenge from server
    const options = await apiPost('/auth/begin/', { username });

    // Step 2: Trigger native biometric dialog
    const assertion = await navigator.credentials.get({
      publicKey: prepareRequestOptions(options),
    });

    if (!assertion) {
      return { success: false, error: 'Biometric verification was cancelled.' };
    }

    // Step 3: Send assertion to server for cryptographic verification → get JWT
    const result = await apiPost('/auth/finish/', {
      username,
      credential: serializeAuthenticationCredential(assertion),
    });

    // result contains: { access, refresh, user }
    return { success: true, ...result };
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      return { success: false, error: 'Biometric verification was cancelled or timed out.' };
    }
    // Backend errors (404 = no passkey, 401 = verification failed, etc.)
    return { success: false, error: err.message || 'Passkey authentication failed.' };
  }
}

/**
 * List all passkeys registered for the current user (requires auth token).
 */
export async function listPasskeys() {
  try {
    const token = localStorage.getItem('sentinel_access_token');
    const res = await fetch(`${API}/list/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/**
 * Delete a passkey by its ID (requires auth token).
 */
export async function deletePasskey(passkeyId) {
  try {
    const token = localStorage.getItem('sentinel_access_token');
    const res = await fetch(`${API}/${passkeyId}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Legacy compat shim ──────────────────────────────────────────────────────
// Keep old names so existing Register.jsx / BiometricSetup.jsx don't break
export { registerPasskey as registerBiometric };
export function hasBiometricRegistered() {
  // We no longer use localStorage for this — always false means "check server"
  // The Login page now always goes through the server challenge flow
  return false;
}
export function clearBiometricData() {
  // No-op — credentials are in the DB now, not localStorage
}
