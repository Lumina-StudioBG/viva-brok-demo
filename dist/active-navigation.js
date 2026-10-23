/* Homepage navigation follows the chapter currently being read. */
(()=>{
  'use strict';
  if(!document.body.classList.contains('home-page'))return;
  const links=[...document.querySelectorAll('.desktop-nav>a,.insurance-nav-desktop>a,.mobile-nav>a,.insurance-nav-mobile>a')];
  const ids=['top','insurance','zashto-nas','contacts'];
  const chapters=ids.map(id=>({id,node:document.getElementById(id)})).filter(x=>x.node);
  function linkChapter(link){
    const url=new URL(link.href,location.href);
    if(url.pathname==='/kontakti/')return 'contacts';
    return url.pathname==='/'?url.hash.slice(1):'';
  }
  const row=document.querySelector('.site-header .header-inner');
  let scheduled=false;
  function sync(){
    scheduled=false;
    const readingLine=row.getBoundingClientRect().height+Math.min(160,innerHeight*.2);
    let active='top';
    for(const chapter of chapters){if(chapter.node.getBoundingClientRect().top<=readingLine)active=chapter.id;}
    for(const link of links){if(linkChapter(link)===active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}
  }
  function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(sync);}}
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule);
  window.addEventListener('load',schedule);
  window.addEventListener('hashchange',schedule);
  document.fonts.ready.then(schedule);
  sync();
})();
