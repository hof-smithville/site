const fs = require("fs");
const path = require("path");

async function listDriveFiles(auth, folderId) {
  const headers = await auth.getRequestHeaders();
  let files = [];
  let pageToken;

  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "nextPageToken, files(id, name)",
      pageSize: "1000",
      supportsAllDrives: "true",
      includeItemsFromAllDrives: "true",
    });
    if (pageToken) params.set("pageToken", pageToken);

    const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, { headers });
    if (!res.ok) throw new Error(`Drive API ${res.status}: ${await res.text()}`);
    const data = await res.json();
    files = files.concat(data.files || []);
    pageToken = data.nextPageToken;
  } while (pageToken);

  return files;
}

async function downloadDriveFile(auth, fileId, destPath) {
  const headers = await auth.getRequestHeaders();
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, { headers });
  if (!res.ok) throw new Error(`Drive download ${res.status} for file ${fileId}: ${await res.text()}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, buf);
}

// A folder the service account can't see lists as 200 with zero files -
// identical to an empty folder - so check reachability explicitly or a
// permissions problem masquerades as "nobody uploaded photos yet".
async function checkFolderAccess(auth, folderId) {
  const headers = await auth.getRequestHeaders();
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name`, { headers });
  if (res.ok) return null;
  if (res.status === 404 || res.status === 403) {
    return `Drive folder ${folderId} is not readable by the service account (HTTP ${res.status}). Share it with the build service account as Viewer.`;
  }
  return `Drive folder ${folderId} check failed: HTTP ${res.status}`;
}

// Pulls every file in the folder down into destDir, fresh each time - the
// folder is ~100 photos, not worth the complexity of incremental sync.
// Never throws on an unreachable folder: the build must publish anyway.
async function syncDriveFolder(auth, folderId, destDir) {
  fs.rmSync(destDir, { recursive: true, force: true });
  fs.mkdirSync(destDir, { recursive: true });

  const accessError = await checkFolderAccess(auth, folderId);
  if (accessError) return { files: [], error: accessError };

  const files = await listDriveFiles(auth, folderId);
  await Promise.all(files.map((f) => downloadDriveFile(auth, f.id, path.join(destDir, f.name))));
  return { files, error: null };
}

module.exports = { listDriveFiles, downloadDriveFile, syncDriveFolder };
