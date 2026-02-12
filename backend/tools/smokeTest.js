(async ()=>{
  const base = 'http://localhost:3000';
  const headersOrg = { 'X-User-Id': '1', 'X-User-Role': 'ORGANIZER', 'Content-Type': 'application/json' };
  const headersP1 = { 'X-User-Id': '2', 'X-User-Role': 'PARTICIPANT', 'Content-Type': 'application/json' };
  const headersP2 = { 'X-User-Id': '3', 'X-User-Role': 'PARTICIPANT', 'Content-Type': 'application/json' };

  try {
    console.log('1) Creating event as organizer (userId=1)');
    let r = await fetch(base + '/api/events', { method: 'POST', headers: headersOrg, body: JSON.stringify({ title: 'Smoke Test Event', description: 'Automated smoke test event', date: '2099-01-01T10:00:00.000Z', capacity: 1 }) });
    let ev = await r.json();
    console.log('create ->', ev);
    if (!ev || !ev.id) throw new Error('Event creation failed');

    console.log('2) Publishing event');
    let pub = await fetch(base + `/api/events/${ev.id}/publish`, { method: 'POST', headers: headersOrg });
    console.log('publish ->', await pub.text());

    console.log('3) Participant 2 registering (should be registered)');
    let reg1 = await fetch(base + `/api/events/${ev.id}/register`, { method: 'POST', headers: headersP1 });
    try { console.log('reg1 ->', await reg1.json()); } catch(e){ console.log('reg1 raw ->', await reg1.text()); }

    console.log('4) Participant 3 registering (should be waitlisted due to capacity=1)');
    let reg2 = await fetch(base + `/api/events/${ev.id}/register`, { method: 'POST', headers: headersP2 });
    try { console.log('reg2 ->', await reg2.json()); } catch(e){ console.log('reg2 raw ->', await reg2.text()); }

    console.log('5) Unregister participant 2 to free a slot and trigger promotion');
    let del = await fetch(base + `/api/events/${ev.id}/register`, { method: 'DELETE', headers: headersP1 });
    try { console.log('unreg1 ->', await del.json()); } catch(e){ console.log('unreg1 raw ->', await del.text()); }

    console.log('6) Fetch registrations (as organizer)');
    let regs = await fetch(base + `/api/events/${ev.id}/registrations`, { headers: headersOrg });
    console.log('registrations ->', await regs.json());

    console.log('7) Fetch waitlist (as organizer)');
    let wls = await fetch(base + `/api/events/${ev.id}/waitlist`, { headers: headersOrg });
    console.log('waitlist ->', await wls.json());

    console.log('8) Participant 3 posts a rating');
    let rate = await fetch(base + `/api/ratings/events/${ev.id}`, { method: 'POST', headers: headersP2, body: JSON.stringify({ rating: 5, review: 'Great event (smoke test)' }) });
    try { console.log('rating ->', await rate.json()); } catch(e){ console.log('rating raw ->', await rate.text()); }

    console.log('9) Fetch rating stats');
    let stats = await fetch(base + `/api/ratings/events/${ev.id}/stats`);
    console.log('rating stats ->', await stats.json());

    console.log('Smoke test completed.');
  } catch (err) {
    console.error('Smoke test failed:', err);
    process.exit(2);
  }
})();
