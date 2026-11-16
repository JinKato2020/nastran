(() => {
 'use strict';
 const arrow=(id,x1,y1,x2,y2,kind='axis')=>`<path class="${kind}" d="M${x1} ${y1}L${x2} ${y2}" marker-end="url(#material-${id}-${kind})"/>`;
 const svg=(id,title,body,height=158)=>`<svg class="lesson-sketch" viewBox="0 0 344 ${height}" role="img" aria-label="${title}">
  <defs>${['axis','load','direction'].map(kind=>`<marker id="material-${id}-${kind}" class="${kind}-marker" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L8 4L0 8Z"/></marker>`).join('')}</defs>
  ${body}
 </svg>`;
 window.LessonDiagrams={arrow,svg};
})();
