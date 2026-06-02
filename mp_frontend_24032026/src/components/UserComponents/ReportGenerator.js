import {saveAs} from 'file-saver'
import atob from 'atob';



export const ConvertToXLSX = (base64Data, fileName) => {
    const binaryData = new Uint8Array(window.atob(base64Data).split('').map(char => char.charCodeAt(0)));
    const blob = new Blob([binaryData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);
  };

  export const PrintAsPDF = (base64Data) => {
    const binaryData = atob(base64Data);
    const arrayBuffer = new ArrayBuffer(binaryData.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < binaryData.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i);
    }
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    saveAs(blob, 'Progress Report');
};