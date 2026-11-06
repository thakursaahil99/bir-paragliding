/**
 * Runs inline in <head> before first paint: a cheap first guess at the device tier so CSS
 * can switch off expensive effects immediately. `lib/perf.ts` refines it (GPU check, live FPS)
 * and can only lower it. Keep the rules in sync with the comment at the top of lib/perf.ts.
 */
export const PERF_BOOT_SCRIPT = `(function(){var d=document.documentElement;d.classList.add('js');try{
var q=(location.search.match(/[?&]perf=(low|mid|high)\\b/)||[])[1];
if(q){d.setAttribute('data-perf',q);d.setAttribute('data-perf-forced','');return;}
var n=navigator,c=n.hardwareConcurrency||4,m=n.deviceMemory||8,cn=n.connection||{},
coarse=matchMedia('(pointer: coarse)').matches,
rm=matchMedia('(prefers-reduced-motion: reduce)').matches,
slowNet=cn.saveData||/(^|-)(2g|3g)$/.test(cn.effectiveType||''),
t='high';
if(rm||slowNet||c<=2||m<=2)t='low';
else if(coarse&&(c<=4||m<=4))t='low';
else if(coarse||c<=4||m<=4)t='mid';
var o=['low','mid','high'],s=JSON.parse(localStorage.getItem('bir-perf-v1')||'null');
if(s&&Date.now()-s.at<6048e5&&o.indexOf(s.tier)>-1&&o.indexOf(s.tier)<o.indexOf(t))t=s.tier;
d.setAttribute('data-perf',t);
}catch(e){}})();`;
