#!/usr/bin/env node
// Observable GitHub Actions operations. gh supplies authentication from the OS keychain.
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const args=process.argv.slice(2);
function option(flag,fallback){const at=args.indexOf(flag);return at<0?fallback:args[at+1]}
const command=args[0];
const repo=option('--repo','elymas/claude-journey');
function gh(argv,json=false){const r=spawnSync('gh',argv,{encoding:'utf8'});if(r.status!==0){process.stderr.write(r.stderr||r.stdout);process.exit(r.status||1)}return json?JSON.parse(r.stdout):r.stdout}
if(!command||command==='--help'){
 console.log(`Usage: node scripts/ci_monitor.cjs <command> [arguments] [--repo owner/name]
  runs [--branch main] [--workflow deploy.yml]  List recent workflow runs
  status <run-id>                             Print status, jobs, URL and SHA
  watch <run-id>                              Watch a run with gh's progress output
  log-failed <run-id>                         Print failed step logs
  check-actions <workflow-file>               Verify referenced action refs exist
Default repository: elymas/claude-journey`);process.exit(0);
}
if(command==='runs'){
 const params=['run','list','--repo',repo,'--limit','5','--json','databaseId,status,conclusion,headSha,url,workflowName'];
 if(option('--branch'))params.push('--branch',option('--branch'));
 if(option('--workflow'))params.push('--workflow',option('--workflow'));
 console.log(JSON.stringify(gh(params,true),null,2));
}else if(command==='status'){
 console.log(JSON.stringify(gh(['run','view',args[1],'--repo',repo,'--json','status,conclusion,jobs,url,headSha'],true),null,2));
}else if(command==='watch'){
 const r=spawnSync('gh',['run','watch',args[1],'--repo',repo,'--exit-status','--interval','5'],{stdio:'inherit'});process.exit(r.status||0);
}else if(command==='log-failed'){
 process.stdout.write(gh(['run','view',args[1],'--repo',repo,'--log-failed']));
}else if(command==='check-actions'){
 const file=args[1];
 for(const [,name,ref]of fs.readFileSync(file,'utf8').matchAll(/uses:\s*([\w-]+\/[\w-]+)@([\w.-]+)/g)){
  const result=gh(['api',`repos/${name}/git/ref/tags/${ref}`],true);
  console.log(`OK ${name}@${ref} -> ${result.object.sha}`);
 }
}else{console.error(`Unknown command: ${command}`);process.exit(1)}
