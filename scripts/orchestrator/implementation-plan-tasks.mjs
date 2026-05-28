#!/usr/bin/env node
import fs from 'node:fs';
const plan=JSON.parse(fs.readFileSync('docs/reference/ci/lgfc-ci-orchestration-tasks.json','utf8'));
const done=new Set(plan.tasks.filter(t=>t.status==='complete').map(t=>t.id));
const next=plan.tasks.find(t=>t.status==='queued'&&t.depends_on.every(d=>done.has(d)));
if(!next){console.log(JSON.stringify({ok:true,action:'none'},null,2));process.exit(0);} 
console.log(JSON.stringify({ok:true,parent_issue:plan.parent_issue,next_task:next.id,title:`${next.title} — Child #${plan.parent_issue}`},null,2));
