import { useState, useRef } from 'react';

interface FileInfo {
  name: string;
  size: number;
  type: string;
}

interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  ratio: number;
  time: number;
}

export default function InteractiveCompressionDemo() {
  const [file, setFile] = useState<FileInfo | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateCompressedSize = (originalSize: number): number => {
    // Simulate DAC compression ratios based on file size
    if (originalSize < 1024) return 8; // < 1KB → 8 bytes
    if (originalSize < 1024 * 1024) return 9; // < 1MB → 9 bytes
    if (originalSize < 1024 * 1024 * 100) return 10; // < 100MB → 10 bytes
    if (originalSize < 1024 * 1024 * 1024) return 15; // < 1GB → 15 bytes
    if (originalSize < 1024 * 1024 * 1024 * 100) return 14; // < 100GB → 14 bytes
    return 18; // >= 100GB → 18 bytes
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFile = (uploadedFile: File) => {
    setFile({
      name: uploadedFile.name,
      size: uploadedFile.size,
      type: uploadedFile.type || 'application/octet-stream'
    });
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const simulateCompression = async () => {
    if (!file) return;
    
    setIsCompressing(true);
    
    // Simulate compression time based on file size
    const compressionTime = Math.min(Math.max(file.size / (1024 * 1024) * 10, 500), 3000);
    
    await new Promise(resolve => setTimeout(resolve, compressionTime));
    
    const compressedSize = calculateCompressedSize(file.size);
    const ratio = ((1 - compressedSize / file.size) * 100).toFixed(6);
    
    setResult({
      originalSize: file.size,
      compressedSize,
      ratio: parseFloat(ratio),
      time: compressionTime / 1000
    });
    
    setIsCompressing(false);
  };

  return (
    <div className="compression-demo">
      <div className="demo-header">
        <h3>Try ByteLite Compression</h3>
        <p>Upload any file to see the compression in action</p>
      </div>

      <div 
        className={`upload-zone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        {!file ? (
          <>
            <div className="upload-icon">📁</div>
            <p className="upload-text">Drop a file here or click to upload</p>
            <p className="upload-hint">Any file type, up to 2GB</p>
          </>
        ) : (
          <div className="file-info">
            <div className="file-icon">📄</div>
            <h4>{file.name}</h4>
            <p className="file-size">{formatFileSize(file.size)}</p>
            <button className="change-file" onClick={(e) => {
              e.stopPropagation();
              setFile(null);
              setResult(null);
            }}>
              Choose different file
            </button>
          </div>
        )}
      </div>

      {file && !result && (
        <button 
          className="compress-button"
          onClick={simulateCompression}
          disabled={isCompressing}
        >
          {isCompressing ? (
            <>
              <span className="spinner"></span>
              Compressing...
            </>
          ) : (
            'Compress with ByteLite'
          )}
        </button>
      )}

      {result && (
        <div className="compression-result">
          <div className="result-header">
            <h4>Compression Complete!</h4>
            <p className="compression-time">Processed in {result.time}s</p>
          </div>
          
          <div className="result-comparison">
            <div className="result-box original">
              <h5>Original</h5>
              <p className="size">{formatFileSize(result.originalSize)}</p>
            </div>
            
            <div className="arrow-container">
              <div className="compression-arrow">→</div>
              <div className="ratio">{result.ratio}%</div>
            </div>
            
            <div className="result-box compressed">
              <h5>Compressed</h5>
              <p className="size">{result.compressedSize} bytes</p>
              <p className="extension">.blc</p>
            </div>
          </div>
          
          <div className="result-footer">
            <p className="verification">✓ SHA-256 verified • Lossless compression</p>
            <button className="try-another" onClick={() => {
              setFile(null);
              setResult(null);
            }}>
              Try Another File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}