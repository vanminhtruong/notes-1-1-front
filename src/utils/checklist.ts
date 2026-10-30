export function readChecklist(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const items = Array.from(doc.querySelectorAll('ul[data-type="taskList"] > li')).map((item, index) => {
    const body = item.querySelector(':scope > div')?.cloneNode(true) as HTMLElement | undefined;
    body?.querySelectorAll('ul, ol').forEach(list => list.remove());
    return {
      index,
      text: (body?.textContent || '').replace(/\s+/g, ' ').trim(),
      checked: item.getAttribute('data-checked') === 'true',
    };
  });
  doc.querySelectorAll('ul[data-type="taskList"]').forEach(list => list.remove());
  return { items, introduction: doc.body.textContent?.trim() || '' };
}

export function setChecklistItem(html: string, index: number, checked: boolean) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const item = doc.querySelectorAll('ul[data-type="taskList"] > li')[index];
  if (!item) throw new Error('Checklist item no longer exists');
  item.setAttribute('data-checked', String(checked));
  const input = item.querySelector(':scope > label input');
  if (checked) input?.setAttribute('checked', 'checked');
  else input?.removeAttribute('checked');
  return doc.body.innerHTML;
}
