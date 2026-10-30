import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { TaskList, TaskItem } from '@tiptap/extension-list';

const createEditor = () => new Editor({
  element: null,
  extensions: [StarterKit, TaskList, TaskItem.configure({ nested: true })],
  content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Prepare report' }] }] },
});

test('turn a paragraph into a checklist and preserve completed state when reloading', () => {
  const editor = createEditor();
  const restored = createEditor();
  try {
    assert.equal(editor.commands.toggleTaskList(), true);
    assert.equal(editor.commands.updateAttributes('taskItem', { checked: true }), true);
    restored.commands.setContent(editor.getJSON());
    const list = restored.getJSON().content[0];
    assert.equal(list.type, 'taskList');
    assert.equal(list.content[0].attrs.checked, true);
    assert.equal(list.content[0].content[0].content[0].text, 'Prepare report');
    restored.commands.updateAttributes('taskItem', { checked: false });
    assert.equal(restored.getJSON().content[0].content[0].attrs.checked, false);
  } finally {
    editor.destroy();
    restored.destroy();
  }
});

test('nested tasks preserve independent completion states', () => {
  const editor = createEditor();
  try {
    const paragraph = text => ({ type: 'paragraph', content: [{ type: 'text', text }] });
    editor.commands.setContent({ type: 'doc', content: [{
      type: 'taskList', content: [{ type: 'taskItem', attrs: { checked: false }, content: [
        paragraph('Parent task'),
        { type: 'taskList', content: [{ type: 'taskItem', attrs: { checked: true }, content: [paragraph('Child task')] }] },
      ] }],
    }] });
    const parent = editor.getJSON().content[0].content[0];
    assert.equal(parent.attrs.checked, false);
    assert.equal(parent.content[1].content[0].attrs.checked, true);
    editor.state.doc.check();
  } finally {
    editor.destroy();
  }
});
