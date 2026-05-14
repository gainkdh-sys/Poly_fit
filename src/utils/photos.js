const PARTY_COLORS = {
  '더불어민주당': { bg: '1e40af', color: 'fff' },
  '국민의힘': { bg: 'ef4444', color: 'fff' },
  '개혁신당': { bg: 'f97316', color: 'fff' },
  '진보당': { bg: '7c3aed', color: 'fff' },
  '정의당': { bg: 'facc15', color: '111827' },
  '녹색정의당': { bg: '16a34a', color: 'fff' },
  '무소속': { bg: '64748b', color: 'fff' }
};

function normalizeKeyPart(value) {
  return String(value || '').replace(/\s/g, '');
}

export function candidatePhotoKey(candidate) {
  const region = candidate.region || [];
  return [
    normalizeKeyPart(region[0]),
    normalizeKeyPart(region[1]),
    normalizeKeyPart(candidate.electionType),
    normalizeKeyPart(candidate.name)
  ].join('|');
}

export function candidateIdPhotoKey(candidate) {
  return `id:${candidate.id}`;
}

export function getPartyAvatarUrl(candidate) {
  const party = candidate.party || '무소속';
  const palette = PARTY_COLORS[party] || PARTY_COLORS['무소속'];
  const name = encodeURIComponent(candidate.name || '후보');

  return `https://ui-avatars.com/api/?name=${name}&background=${palette.bg}&color=${palette.color}&size=256&bold=true&format=svg`;
}

function isGeneratedAvatar(url) {
  return String(url || '').includes('ui-avatars.com');
}

function getApprovedPhotoEntry(candidate, photoRegistry) {
  const photos = photoRegistry?.photos || {};
  const keys = [
    candidatePhotoKey(candidate),
    candidateIdPhotoKey(candidate)
  ];

  return keys
    .map(key => photos[key])
    .find(entry => entry?.url && (!entry.status || entry.status === 'approved'));
}

export function resolveCandidateImage(candidate, photoRegistry) {
  const approved = getApprovedPhotoEntry(candidate, photoRegistry);
  if (approved) return approved.url;

  if (candidate.imageUrl && !isGeneratedAvatar(candidate.imageUrl)) {
    return candidate.imageUrl;
  }

  return getPartyAvatarUrl(candidate);
}

export function resolveCandidatePhotoMeta(candidate, photoRegistry) {
  const approved = getApprovedPhotoEntry(candidate, photoRegistry);
  if (!approved) return null;

  return {
    source: approved.source || '',
    license: approved.license || '',
    attribution: approved.attribution || ''
  };
}
