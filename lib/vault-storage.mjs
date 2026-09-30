function decodeLegacyKey(key) {
  return key.split("/").map(part => {
    try { return decodeURIComponent(part); }
    catch { return part; }
  }).join("/");
}

// Keep object selection consistent with the filenames exposed by /api/vault.
export function objectPath(key, object) {
  return object.customMetadata?.pathEncoding === "raw-v1"
    ? key
    : decodeLegacyKey(key);
}

export async function objectsForPath(bucket, path) {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  const keys = [...new Set([path, encoded])];
  const objects = await Promise.all(keys.map(async key => {
    const object = await bucket.get(key);
    return object && objectPath(key, object) === path ? { key, object } : null;
  }));
  // A raw representation takes precedence over an older encoded alias.
  return objects.filter(Boolean);
}

export async function preserveLegacyObject(bucket, key) {
  const object = await bucket.get(key);
  if (!object) return;
  const path = objectPath(key, object);
  if (path === key) return;

  const destination = await bucket.get(path);
  // An existing raw copy already supersedes this legacy representation.
  if (destination && objectPath(path, destination) === path) return;

  // The decoded key can itself hold an unrelated encoded legacy note.
  // Preserve that note first; each decoding step shortens the key.
  await preserveLegacyObject(bucket, path);
  await bucket.put(path, await object.text(), {
    httpMetadata: object.httpMetadata,
    customMetadata: { ...object.customMetadata, pathEncoding: "raw-v1" },
  });
}
