import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const QRCodeScanner = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef(null);
  const regionIdRef = useRef(
    `qr-reader-${Math.random().toString(36).slice(2, 10)}`,
  );

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      regionIdRef.current,
      {
        fps: 10,
        qrbox: {
          width: 260,
          height: 260,
        },
        rememberLastUsedCamera: true,
      },
      false,
    );

    scannerRef.current = scanner;

    scanner.render(
      async (decodedText) => {
        if (!decodedText) return;

        onScanSuccess(decodedText);

        try {
          await scanner.clear();
        } catch (error) {
          console.log("Scanner clear error:", error);
        }

        if (onClose) {
          onClose();
        }
      },
      () => {
        // Ignore repeated scan frame errors
      },
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [onScanSuccess, onClose]);

  return (
    <div className="rounded-[2rem] border border-cyan-100 bg-white p-4 shadow-xl">
      <div id={regionIdRef.current} className="overflow-hidden rounded-2xl" />

      <p className="mt-3 text-center text-xs font-semibold text-slate-500">
        Allow camera permission and place the patient QR inside the scanner box.
      </p>
    </div>
  );
};

export default QRCodeScanner;
