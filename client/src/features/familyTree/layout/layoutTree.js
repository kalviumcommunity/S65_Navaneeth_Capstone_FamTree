// client/src/features/familyTree/layout/layoutTree.js

const NODE_W = 190
const NODE_H = 94
const SPOUSE_GAP = 42
const H_GAP = 80
const V_GAP = 160

function uniq(arr) {
  return [...new Set((arr || []).filter(Boolean))]
}

function safeGet(membersById, id) {
  return membersById[id]
}

function buildParentsMap(membersById) {
  const parentsById = {}
  for (const id of Object.keys(membersById)) {
    const m = membersById[id]
    parentsById[id] = uniq(m.parents)
  }
  return parentsById
}

function buildChildrenMap(membersById) {
  const childrenById = {}
  for (const id of Object.keys(membersById)) {
    childrenById[id] = []
  }

  for (const id of Object.keys(membersById)) {
    const m = membersById[id]

    // Prefer explicit `children`.
    for (const childId of uniq(m.children)) {
      if (!childrenById[id]) childrenById[id] = []
      if (membersById[childId]) childrenById[id].push(childId)
    }
  }

  // Backfill: if a child has parents, ensure parent->child exists.
  for (const id of Object.keys(membersById)) {
    const m = membersById[id]
    for (const parentId of uniq(m.parents)) {
      if (!membersById[parentId]) continue
      if (!childrenById[parentId]) childrenById[parentId] = []
      if (!childrenById[parentId].includes(id)) childrenById[parentId].push(id)
    }
  }

  // Normalize unique.
  for (const id of Object.keys(childrenById)) {
    childrenById[id] = uniq(childrenById[id])
  }

  return childrenById
}

function topoGenerations(membersById, parentsById) {
  const ids = Object.keys(membersById)
  const indeg = {}
  const childrenById = {}

  for (const id of ids) {
    const parents = (parentsById[id] || []).filter((p) => membersById[p])
    indeg[id] = parents.length
    for (const p of parents) {
      if (!childrenById[p]) childrenById[p] = []
      childrenById[p].push(id)
    }
  }

  const gen = {}
  const q = []
  for (const id of ids) {
    if (indeg[id] === 0) {
      gen[id] = 0
      q.push(id)
    }
  }

  // If no roots (cycle), just pick all as roots.
  if (q.length === 0) {
    for (const id of ids) {
      gen[id] = 0
      q.push(id)
    }
  }

  while (q.length) {
    const cur = q.shift()
    const curGen = gen[cur] ?? 0
    const children = childrenById[cur] || []
    for (const childId of children) {
      const nextGen = Math.max(gen[childId] ?? 0, curGen + 1)
      gen[childId] = nextGen
      indeg[childId] = Math.max(0, (indeg[childId] || 0) - 1)
      if (indeg[childId] === 0) q.push(childId)
    }
  }

  // Fallback for anything missed.
  for (const id of ids) {
    if (gen[id] === undefined) gen[id] = 0
  }

  return gen
}

function spouseKey(a, b) {
  return [a, b].sort().join('::')
}

function buildSpousePairs(membersById, gen) {
  const pairs = new Map()

  for (const id of Object.keys(membersById)) {
    const m = membersById[id]
    const spouseIds = uniq(m.spouses).filter((s) => membersById[s])
    const firstSameGenSpouse = spouseIds.find((s) => gen[s] === gen[id])
    if (!firstSameGenSpouse) continue

    const key = spouseKey(id, firstSameGenSpouse)
    if (!pairs.has(key)) pairs.set(key, { a: key.split('::')[0], b: key.split('::')[1] })
  }

  return [...pairs.values()]
}

function desiredXFromParents(id, membersById, genPositions, parentsById) {
  const parents = (parentsById[id] || []).filter((p) => genPositions[p])
  if (parents.length === 0) return null
  const xs = parents.map((p) => genPositions[p].x)
  const avg = xs.reduce((a, b) => a + b, 0) / xs.length
  return avg
}

function spreadByMinGap(items, getX, setX, minGap) {
  items.sort((a, b) => getX(a) - getX(b))
  for (let i = 1; i < items.length; i++) {
    const prev = items[i - 1]
    const cur = items[i]
    const target = getX(prev) + minGap
    if (getX(cur) < target) setX(cur, target)
  }
}

export function layoutTree(membersById, { centerId } = {}) {
  const ids = Object.keys(membersById)
  if (ids.length === 0) return {}

  const parentsById = buildParentsMap(membersById)
  const childrenById = buildChildrenMap(membersById)
  const gen = topoGenerations(membersById, parentsById)

  const gens = new Map()
  for (const id of ids) {
    const g = gen[id] ?? 0
    if (!gens.has(g)) gens.set(g, [])
    gens.get(g).push(id)
  }

  const maxGen = Math.max(...[...gens.keys()])
  const spousePairs = buildSpousePairs(membersById, gen)
  const spousePartnerById = {}
  for (const pair of spousePairs) {
    spousePartnerById[pair.a] = pair.b
    spousePartnerById[pair.b] = pair.a
  }

  const positions = {}

  // 1) Seed generation 0 left-to-right.
  const g0 = (gens.get(0) || []).slice()
  g0.sort((a, b) => a.localeCompare(b))

  let cursor = 0
  for (const id of g0) {
    if (positions[id]) continue

    const spouseId = spousePartnerById[id]
    if (spouseId && !positions[spouseId] && gen[spouseId] === 0) {
      positions[id] = { x: cursor, y: 0 }
      positions[spouseId] = { x: cursor + NODE_W + SPOUSE_GAP, y: 0 }
      cursor += 2 * NODE_W + SPOUSE_GAP + H_GAP
    } else {
      positions[id] = { x: cursor, y: 0 }
      cursor += NODE_W + H_GAP
    }
  }

  // 2) For each next generation, place nodes by desiredX from parents, then spread.
  for (let g = 1; g <= maxGen; g++) {
    const idsInGen = (gens.get(g) || []).slice()
    if (idsInGen.length === 0) continue

    const desired = new Map()
    for (const id of idsInGen) {
      const dx = desiredXFromParents(id, membersById, positions, parentsById)
      desired.set(id, dx ?? 0)
    }

    // Sort by desired x then stable by id.
    idsInGen.sort((a, b) => {
      const ax = desired.get(a)
      const bx = desired.get(b)
      if (ax !== bx) return ax - bx
      return a.localeCompare(b)
    })

    // Initial placement.
    for (const id of idsInGen) {
      if (positions[id]) continue

      const spouseId = spousePartnerById[id]
      if (spouseId && gen[spouseId] === g && !positions[spouseId]) {
        const baseX = desired.get(id) ?? 0
        positions[id] = { x: baseX, y: g * V_GAP }
        positions[spouseId] = { x: baseX + NODE_W + SPOUSE_GAP, y: g * V_GAP }
      } else {
        positions[id] = { x: desired.get(id) ?? 0, y: g * V_GAP }
      }
    }

    // Spread singles/couples to avoid overlap.
    const clusters = []
    const visited = new Set()
    for (const id of idsInGen) {
      if (visited.has(id)) continue
      const spouseId = spousePartnerById[id]
      if (spouseId && gen[spouseId] === g) {
        visited.add(id)
        visited.add(spouseId)
        clusters.push({ ids: [id, spouseId] })
      } else {
        visited.add(id)
        clusters.push({ ids: [id] })
      }
    }

    // Cluster x is min x of its nodes.
    spreadByMinGap(
      clusters,
      (c) => Math.min(...c.ids.map((id) => positions[id].x)),
      (c, newX) => {
        const ids0 = c.ids
        if (ids0.length === 2) {
          const [a, b] = ids0
          positions[a].x = newX
          positions[b].x = newX + NODE_W + SPOUSE_GAP
        } else {
          positions[ids0[0]].x = newX
        }
      },
      NODE_W + H_GAP
    )

    // After spread, gently center children under parents when possible.
    for (const id of idsInGen) {
      const dx = desiredXFromParents(id, membersById, positions, parentsById)
      if (dx === null) continue
      positions[id].x = (positions[id].x * 2 + dx) / 3
    }

    // Final spread pass.
    const singles = idsInGen.slice()
    spreadByMinGap(
      singles,
      (id) => positions[id].x,
      (id, x) => {
        positions[id].x = x
        const spouseId = spousePartnerById[id]
        if (spouseId && gen[spouseId] === g) {
          // Keep spouse next to it.
          if (positions[spouseId]) positions[spouseId].x = x + NODE_W + SPOUSE_GAP
        }
      },
      NODE_W + H_GAP
    )
  }

  // 3) Normalize around centerId (or first member) so the view starts centered.
  const anchorId = centerId && membersById[centerId] ? centerId : ids[0]
  const ax = positions[anchorId]?.x ?? 0
  const ay = positions[anchorId]?.y ?? 0

  for (const id of ids) {
    positions[id].x -= ax
    positions[id].y -= ay
  }

  // 4) Ensure parents are above children if any inverted edges exist (best-effort).
  for (const parentId of Object.keys(childrenById)) {
    for (const childId of childrenById[parentId] || []) {
      if (!positions[parentId] || !positions[childId]) continue
      if (positions[parentId].y >= positions[childId].y) {
        positions[parentId].y = positions[childId].y - V_GAP
      }
    }
  }

  return positions
}

export const layoutConstants = {
  NODE_W,
  NODE_H,
  SPOUSE_GAP,
  H_GAP,
  V_GAP,
}
