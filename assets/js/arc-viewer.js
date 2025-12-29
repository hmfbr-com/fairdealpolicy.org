(function(){
  'use strict';

  function el(id){ return document.getElementById(id); }
  function esc(s){
    return String(s ?? '').replace(/[&<>"']/g, function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]);
    });
  }

  async function fetchJson(url){
    const r = await fetch(url, { cache: 'no-store' });
    if(!r.ok) throw new Error('HTTP ' + r.status + ' for ' + url);
    return r.json();
  }

  async function fetchText(url){
    const r = await fetch(url, { cache: 'no-store' });
    if(!r.ok) throw new Error('HTTP ' + r.status + ' for ' + url);
    return r.text();
  }

  function parseGraphJsonl(txt){
    const lines = txt.split(/\r?\n/).filter(Boolean);
    const rels = [];
    for(const line of lines){
      try{ rels.push(JSON.parse(line)); }catch(e){ /* ignore */ }
    }
    return rels;
  }

  function buildIndexes(rels){
    const byType = new Map();
    const outgoing = new Map();
    const incoming = new Map();
    for(const r of rels){
      const t = r.type || 'unknown';
      if(!byType.has(t)) byType.set(t, []);
      byType.get(t).push(r);

      if(!outgoing.has(r.from)) outgoing.set(r.from, []);
      outgoing.get(r.from).push(r);

      if(!incoming.has(r.to)) incoming.set(r.to, []);
      incoming.get(r.to).push(r);
    }
    return { byType, outgoing, incoming };
  }

  function atomRef(artifactId, atomId){
    return 'arc://' + artifactId + '/atom/' + atomId;
  }

  function mdToHtml(md){
    const safe = esc(md).replace(/\r\n/g,'\n');
    const withLinks = safe.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    const withEm = withLinks.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
    return withEm.split(/\n\n+/).map(p => '<p>' + p.replace(/\n/g,'<br>') + '</p>').join('');
  }

  function setStatus(kind, msg){
    const s = el('arcStatus');
    s.classList.remove('arc-error','arc-ok');
    if(kind === 'error') s.classList.add('arc-error');
    if(kind === 'ok') s.classList.add('arc-ok');
    s.innerHTML = '<strong>Status:</strong> ' + esc(msg);
  }

  function renderBundleInfo(manifest){
    const kv = el('bundleKv');
    kv.innerHTML = '';
    const pills = [
      ['artifact', manifest.artifact_id],
      ['schema', manifest.schema],
      ['title', manifest.title],
      ['created', manifest.created_utc]
    ];
    for(const [k,v] of pills){
      const span = document.createElement('span');
      span.className = 'arc-pill';
      span.innerHTML = '<strong>' + esc(k) + ':</strong> ' + esc(v);
      kv.appendChild(span);
    }
    el('bundleNotes').textContent = manifest.notes || '';
  }

  function renderBrief(atomsById){
    const brief = atomsById.get('text_brief_001');
    if(!brief) return;
    el('briefTitle').textContent = brief.payload?.title ?? 'Brief';
    el('briefBody').innerHTML = mdToHtml(brief.payload?.body ?? '');
  }

  function renderPrintLink(atomsById, base){
    const view = atomsById.get('view_print_a4_001');
    const a = el('printLink');
    const target = view?.payload?.target ?? 'views/print_a4.html';
    a.href = base + '/' + String(target).replace(/^\/+/,'');
  }

  function claimTitle(atom){
    const t = atom?.payload?.claim_text ?? '';
    return t.length > 120 ? (t.slice(0,117) + '…') : t;
  }

  function selectClaim(claimId, atomsById, indexes, artifactId){
    document.querySelectorAll('[data-claim-id]').forEach(n => {
      n.style.outline = (n.getAttribute('data-claim-id') === claimId)
        ? '2px solid rgba(120,255,180,.35)'
        : 'none';
    });

    const map = el('mapList');
    map.innerHTML = '';

    const claimRef = atomRef(artifactId, claimId);
    const supports = (indexes.byType.get('supports') || []).filter(r => r.to === claimRef);

    if(!supports.length){
      const empty = document.createElement('div');
      empty.className = 'arc-item';
      empty.innerHTML = '<h3>No evidence linked</h3><div class="arc-meta">This claim has no supports() relations yet.</div>';
      map.appendChild(empty);
      return;
    }

    for(const r of supports){
      const evidId = r.from.split('/atom/')[1];
      const evid = atomsById.get(evidId);
      const evSummary = evid?.payload?.summary ?? evidId;

      const derived = (indexes.byType.get('derived_from') || []).filter(d => d.from === atomRef(artifactId, evidId));
      const sources = derived
        .map(d => d.to.split('/atom/')[1])
        .map(sid => atomsById.get(sid))
        .filter(Boolean);

      const card = document.createElement('div');
      card.className = 'arc-item';

      const conf = r.props?.confidence;
      const confTxt = (typeof conf === 'number') ? ('Support confidence: ' + Math.round(conf*100) + '%') : '';

      let sourcesHtml = '';
      if(sources.length){
        sourcesHtml =
          '<div class="arc-rel"><div class="arc-meta">Sources</div>' +
          sources.map(s => {
            const title = esc(s.payload?.title ?? s.atom_id);
            const loc = esc(s.payload?.locator ?? '');
            return '<div class="arc-small"><strong>' + title + '</strong><br>' +
              '<a href="' + loc + '" target="_blank" rel="noopener">' + loc + '</a></div>';
          }).join('<div style="height:8px"></div>') +
          '</div>';
      } else {
        sourcesHtml = '<div class="arc-rel arc-meta">No sources linked (derived_from) for this evidence.</div>';
      }

      card.innerHTML =
        '<h3>Evidence</h3>' +
        '<div class="arc-meta">' + esc(confTxt) + '</div>' +
        '<div style="margin-top:8px">' + esc(evSummary) + '</div>' +
        sourcesHtml;

      map.appendChild(card);
    }
  }

  function renderClaims(atomsById, indexes, artifactId){
    const list = el('claimsList');
    list.innerHTML = '';

    const refs = indexes.byType.get('references') || [];
    const briefRef = atomRef(artifactId, 'text_brief_001');
    const claimRefs = refs
      .filter(r => r.from === briefRef && /^arc:\/\/.+\/atom\/claim_/.test(r.to))
      .map(r => r.to.split('/atom/')[1])
      .filter(Boolean);

    const unique = [...new Set(claimRefs)];
    for(const cid of unique){
      const atom = atomsById.get(cid);
      if(!atom) continue;

      const div = document.createElement('div');
      div.className = 'arc-item';
      div.tabIndex = 0;
      div.setAttribute('data-claim-id', cid);

      const ctext = atom.payload?.claim_text ?? cid;
      const conf = atom.payload?.confidence_self_reported;
      const confTxt = (typeof conf === 'number') ? ('Self confidence: ' + Math.round(conf*100) + '%') : '';

      div.innerHTML =
        '<h3>' + esc(claimTitle(atom)) + '</h3>' +
        '<div class="arc-meta">' + esc(confTxt) + '</div>' +
        '<div style="margin-top:8px">' + esc(ctext) + '</div>';

      div.addEventListener('click', () => selectClaim(cid, atomsById, indexes, artifactId));
      div.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' || e.key === ' ') selectClaim(cid, atomsById, indexes, artifactId);
      });

      list.appendChild(div);
    }

    if(unique.length){
      selectClaim(unique[0], atomsById, indexes, artifactId);
    }
  }

  async function main(){
    const root = document.getElementById('arcRoot');
    if(!root) return;

    const base = root.getAttribute('data-arc-base');
    if(!base){ setStatus('error','Missing data-arc-base'); return; }

    try{
      const manifest = await fetchJson(base + '/manifest.json');
      const artifactId = manifest.artifact_id;

      renderBundleInfo(manifest);

      const graphTxt = await fetchText(base + '/graph.jsonl');
      const rels = parseGraphJsonl(graphTxt);
      const indexes = buildIndexes(rels);

      const atomIndex = await fetchJson(base + '/atoms/index.json');
      const ids = atomIndex.atom_ids || [];

      const atomsById = new Map();
      for(const id of ids){
        const atom = await fetchJson(base + '/atoms/' + id + '.json');
        atomsById.set(id, atom);
      }

      renderBrief(atomsById);
      renderPrintLink(atomsById, base);
      renderClaims(atomsById, indexes, artifactId);

      setStatus('ok','loaded ' + ids.length + ' atoms, ' + rels.length + ' relations');
    }catch(err){
      setStatus('error', err?.message || String(err));
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', main);
  }else{
    main();
  }
})();