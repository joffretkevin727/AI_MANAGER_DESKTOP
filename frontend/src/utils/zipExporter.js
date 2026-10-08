import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { playSound } from './audio';

export const downloadProjectZip = async (fileTree, projectName) => {
  playSound('click');
  const zip = new JSZip();
  const cleanProjectName = projectName ? projectName.replace(/\s+/g, '_') : 'Projet_IA';

  const addToZip = (folder, node) => {
    Object.entries(node).forEach(([key, val]) => {
      if (val.type === 'file') {
        folder.file(key, val.content);
      } else if (val.type === 'dir') {
        const subFolder = folder.folder(key);
        addToZip(subFolder, val.children);
      }
    });
  };

  if (fileTree[Object.keys(fileTree)[0]]) {
    const rootNode = fileTree[Object.keys(fileTree)[0]].children;
    const rootFolder = zip.folder(cleanProjectName);
    addToZip(rootFolder, rootNode);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `${cleanProjectName}.zip`);
};