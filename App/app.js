const video = document.getElementById("camera");
        const captureTextButton = document.getElementById("capture-text");
        const detectedTextElement = document.getElementById("detected-text");
        const qrCodeContainer = document.getElementById("qr-code");
        const barcodeCanvas = document.getElementById("barcode");

        // Function to start the camera
        async function startCamera() {
            try {
                // Request camera access
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                video.srcObject = stream;
            } catch (error) {
                alert("Camera access denied or unavailable. Make sure you grant permission.");
            }
        }

        // Start the camera when the page loads
        startCamera();

        // Capture text from the video feed
        captureTextButton.addEventListener("click", () => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Use Tesseract.js for OCR
            Tesseract.recognize(canvas, "eng", { logger: (info) => console.log(info) })
                .then(({ data: { text } }) => {
                    const cleanedText = text.trim().toUpperCase(); // Ensure uppercase
                    if (isValidFormat(cleanedText)) {
                        detectedTextElement.textContent = cleanedText;
                        generateQRCode(cleanedText);
                        generateBarcode(cleanedText);
                    } else {
                        detectedTextElement.textContent = "Invalid format. Ensure it is 6 characters (A-Z, 0-9).";
                        clearOutputs();
                    }
                })
                .catch((error) => {
                    alert("Failed to detect text. Please try again.");
                    console.error(error);
                });
        });

        // Validate the detected text format
        function isValidFormat(text) {
            const regex = /^[A-Z0-9]{6}$/; // Matches exactly 6 alphanumeric characters
            return regex.test(text);
        }

        // Generate QR code
        function generateQRCode(text) {
            qrCodeContainer.innerHTML = ""; // Clear previous QR code
            new QRCode(qrCodeContainer, {
                text: text,
                width: 200,
                height: 200,
            });
        }

        // Generate Barcode
        function generateBarcode(text) {
            const ctx = barcodeCanvas.getContext("2d");
            ctx.clearRect(0, 0, barcodeCanvas.width, barcodeCanvas.height); // Clear previous barcode
            try {
                JsBarcode(barcodeCanvas, text, {
                    format: "CODE128", // Barcode format with vertical lines
                    width: 2,         // Set barcode line width
                    height: 100,      // Set barcode height
                    displayValue: true, // Display the text below the barcode
                });
            } catch (error) {
                alert("Error generating barcode. Ensure text is valid.");
                console.error(error);
            }
        }

        // Clear outputs for invalid input
        function clearOutputs() {
            qrCodeContainer.innerHTML = "";
            const ctx = barcodeCanvas.getContext("2d");
            ctx.clearRect(0, 0, barcodeCanvas.width, barcodeCanvas.height);
        }
