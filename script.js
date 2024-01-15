class HuffmanNode {
  constructor(symbol, frequency) {
    this.symbol = symbol;
    this.frequency = frequency;
    this.left = null;
    this.right = null;
  }
}

class MinHeap {
  constructor() {
    this.heap = [];
  }

  insert(node) {
    this.heap.push(node);
    this.heapifyUp();
  }

  extractMin() {
    if (this.isEmpty()) {
      return null;
    }

    const minNode = this.heap[0];
    const lastNode = this.heap.pop();

    if (!this.isEmpty()) {
      this.heap[0] = lastNode;
      this.heapifyDown();
    }

    return minNode;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  heapifyUp() {
    let index = this.heap.length - 1;

    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index].frequency < this.heap[parentIndex].frequency) {
        this.swap(index, parentIndex);
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  heapifyDown() {
    let index = 0;

    while (true) {
      const leftChildIndex = 2 * index + 1;
      const rightChildIndex = 2 * index + 2;
      let smallestChildIndex = index;

      if (leftChildIndex < this.heap.length && this.heap[leftChildIndex].frequency < this.heap[smallestChildIndex].frequency) {
        smallestChildIndex = leftChildIndex;
      }

      if (rightChildIndex < this.heap.length && this.heap[rightChildIndex].frequency < this.heap[smallestChildIndex].frequency) {
        smallestChildIndex = rightChildIndex;
      }

      if (smallestChildIndex !== index) {
        this.swap(index, smallestChildIndex);
        index = smallestChildIndex;
      } else {
        break;
      }
    }
  }

  swap(i, j) {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}

function buildHuffmanTree(frequencies) {
  const heap = new MinHeap();

  for (const [symbol, frequency] of frequencies) {
    const node = new HuffmanNode(symbol, frequency);
    heap.insert(node);
  }

  while (heap.heap.length > 1) {
    const left = heap.extractMin();
    const right = heap.extractMin();

    const combinedNode = new HuffmanNode(null, left.frequency + right.frequency);
    combinedNode.left = left;
    combinedNode.right = right;

    heap.insert(combinedNode);
  }

  return heap.extractMin();
}

function buildHuffmanCodes(tree, currentCode = '', codes = {}) {
  if (tree) {
    if (tree.symbol !== null) {
      codes[tree.symbol] = currentCode;
    }

    buildHuffmanCodes(tree.left, currentCode + '0', codes);
    buildHuffmanCodes(tree.right, currentCode + '1', codes);
  }

  return codes;
}

function compressFile() {
  const fileInput = document.getElementById('fileInput');
  const downloadLink = document.getElementById('downloadLink');

  if (fileInput.files.length > 0) {
    const inputFile = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      const fileContent = e.target.result;
      const frequencies = calculateFrequencies(fileContent);
      const huffmanTree = buildHuffmanTree(frequencies);
      const huffmanCodes = buildHuffmanCodes(huffmanTree);

      const compressedData = compressData(fileContent, huffmanCodes);
      const compressedBlob = new Blob([compressedData], { type: 'application/octet-stream' });
      const compressedUrl = URL.createObjectURL(compressedBlob);

      downloadLink.href = compressedUrl;
      downloadLink.download = `${inputFile.name}_compressed.huffman`;
      downloadLink.style.display = 'block';
    };

    reader.readAsText(inputFile);
  } else {
    alert('Please select a file.');
  }
}

function calculateFrequencies(data) {
  const frequencies = new Map();

  for (const symbol of data) {
    frequencies.set(symbol, (frequencies.get(symbol) || 0) + 1);
  }

  return [...frequencies.entries()];
}

function compressData(data, huffmanCodes) {
  let compressedBits = '';

  for (const symbol of data) {
    compressedBits += huffmanCodes[symbol];
  }

  const extraBits = compressedBits.length % 8;
  if (extraBits !== 0) {
    compressedBits += '0'.repeat(8 - extraBits);
  }

  const compressedBytes = [];
  for (let i = 0; i < compressedBits.length; i += 8) {
    const byte = compressedBits.substr(i, 8);
    compressedBytes.push(parseInt(byte, 2));
  }

  const header = createHeader(huffmanCodes);
  const compressedData = new Uint8Array([header, ...compressedBytes]);

  return compressedData;
}

function createHeader(huffmanCodes) {
  const header = Object.keys(huffmanCodes)
    .map(symbol => `${symbol.charCodeAt(0)}:${huffmanCodes[symbol]}`)
    .join(',');

  return `${header.length};${header}`;
}

function handleFileInput() {
  const fileInput = document.getElementById('fileInput');
  const selectedFileName = fileInput.files.length > 0 ? fileInput.files[0].name : 'No file selected';
  const fileInputLabel = document.querySelector('.file-label span');
  fileInputLabel.textContent = selectedFileName;
}

document.getElementById('fileInput').addEventListener('change', handleFileInput);
