/* Navigate between homepage chapters without loading another document. */
(()=>{
  'use strict';
  const header=document.querySelector('.site-header .header-inner');
  function align(hash,behavior){
    const target=hash==='#top'?null:document.getElementById(hash.slice(1));
    if(hash!=='#top'&&!target)return;
    const offset=header.getBoundingClientRect().height+1;
    const top=target?target.getBoundingClientRect().top+window.scrollY-offset:0;
    window.scrollTo({top:Math.max(0,top),behavior});
  }
  document.querySelectorAll('.site-header a').forEach(link=>{
    const url=new URL(link.href,location.href);
    if(url.origin!==location.origin||url.pathname!==location.pathname||!url.hash)return;
    link.addEventListener('click',event=>{
      if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
      event.preventDefault();
      if(location.hash!==url.hash)history.pushState(null,'',url.hash);
      align(url.hash,matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth');
    });
  });
  const loaded=document.readyState==='complete'?Promise.resolve():new Promise(resolve=>window.addEventListener('load',resolve,{once:true}));
  Promise.all([loaded,document.fonts.ready]).then(()=>{
    if(location.hash)requestAnimationFrame(()=>requestAnimationFrame(()=>align(location.hash,'auto')));
  });
})();
