/**
 * College ID Card Generator - Core Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const idForm = document.getElementById('idForm');
    const idCard = document.getElementById('idCard');
    const idCardWrapper = document.getElementById('idCardWrapper');
    const emptyState = document.getElementById('emptyState');
    const qrcodeContainer = document.getElementById('qrcode');

    // Action Buttons
    const printBtn = document.getElementById('printBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadImgBtn = document.getElementById('downloadImgBtn');
    const generateBtn = document.getElementById('generateBtn');

    // Display Elements
    const displayFields = {
        name: document.getElementById('display-name'),
        dept: document.getElementById('display-dept'),
        regNo: document.getElementById('display-regNo'),
        year: document.getElementById('display-year'),
        mobile: document.getElementById('display-mobile'),
        bloodGroup: document.getElementById('display-bloodGroup'),
        address: document.getElementById('display-address'),
        uniqueId: document.getElementById('display-uniqueId')
    };

    /**
     * Generates a unique ID for the student
     * Format: CFE-[Year]-[Random-Hex]
     */
    function generateUniqueID() {
        const chars = 'ABCDEF0123456789';
        let random = '';
        for (let i = 0; i < 4; i++) {
            random += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const yearSuffix = new Date().getFullYear().toString().substr(-2);
        return `CFE-${yearSuffix}-${random}`;
    }

    /**
     * Handles Form Submission
     */
    idForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Collect Data
        const formData = {
            name: document.getElementById('name').value.trim(),
            dept: document.getElementById('dept').value.trim(),
            regNo: document.getElementById('regNo').value.trim(),
            address: document.getElementById('address').value.trim(),
            year: document.getElementById('year').value,
            mobile: document.getElementById('mobile').value.trim(),
            bloodGroup: document.getElementById('bloodGroup').value,
            uniqueId: generateUniqueID()
        };

        // 2. Update Preview UI
        displayFields.name.textContent = formData.name;
        displayFields.dept.textContent = formData.dept;
        displayFields.regNo.textContent = formData.regNo;
        displayFields.year.textContent = formData.year;
        displayFields.mobile.textContent = formData.mobile;
        displayFields.bloodGroup.textContent = formData.bloodGroup;
        displayFields.address.textContent = formData.address;
        displayFields.uniqueId.textContent = formData.uniqueId;

        // 3. Generate QR Code
        // Required QR Content: Unique ID, Name, Department, Register Number
        const qrContent = `ID: ${formData.uniqueId}\nName: ${formData.name}\nDept: ${formData.dept}\nReg No: ${formData.regNo}`;

        // Clear previous QR
        qrcodeContainer.innerHTML = '';

        // Create new QR
        new QRCode(qrcodeContainer, {
            text: qrContent,
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H,
            useSVG: false // Generate as image/canvas for better PDF capture
        });

        // 4. Show ID Card & Enable Actions
        idCardWrapper.style.display = 'block';
        emptyState.style.display = 'none';
        idCard.classList.add('generated');

        printBtn.disabled = false;
        downloadBtn.disabled = false;
        downloadImgBtn.disabled = false;

        // Scroll to preview on mobile
        if (window.innerWidth < 992) {
            idCardWrapper.scrollIntoView({ behavior: 'smooth' });
        }

        // Button Animation
        generateBtn.innerHTML = '<i class="fas fa-check-circle"></i> ID Card Generated!';
        generateBtn.style.background = 'linear-gradient(135deg, var(--secondary), #059669)';

        setTimeout(() => {
            generateBtn.innerHTML = '<i class="fas fa-magic"></i> Re-generate ID Card';
            generateBtn.style.background = ''; // reset to CSS default
        }, 3000);
    });

    /**
     * Print Functionality
     */
    printBtn.addEventListener('click', () => {
        window.print();
    });

    /**
     * Download PDF Functionality
     */
    downloadBtn.addEventListener('click', () => {
        const studentName = document.getElementById('name').value.trim().replace(/\s+/g, '_') || 'Student';
        const cardElement = document.getElementById('idCard');

        // UI feedback
        const originalBtnContent = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        downloadBtn.disabled = true;

        // Strip CSS features that break html2canvas
        const originalTransform = cardElement.style.transform;
        const originalTransition = cardElement.style.transition;
        const originalAnimation = cardElement.style.animation;
        const originalBoxShadow = cardElement.style.boxShadow;

        // Reset scroll position to top
        const originalScroll = window.scrollY;
        window.scrollTo(0, 0);

        cardElement.style.transform = 'none';
        cardElement.style.transition = 'none';
        cardElement.style.animation = 'none';
        cardElement.style.boxShadow = 'none';

        // Wait a frame for browser to paint the style changes
        setTimeout(() => {
            const opt = {
                margin: 0,
                filename: `IDCard_${studentName}.pdf`,
                image: { type: 'jpeg', quality: 1.0 },
                html2canvas: {
                    scale: 3,
                    useCORS: true,
                    logging: false,
                    scrollY: 0,
                    scrollX: 0
                },
                jsPDF: {
                    unit: 'px',
                    format: [cardElement.offsetWidth, cardElement.offsetHeight],
                    orientation: 'portrait',
                    hotfixes: ['px_scaling']
                }
            };

            html2pdf().set(opt).from(cardElement).save().then(() => {
                restoreUI();
            }).catch(err => {
                console.error("PDF generation failed:", err);
                downloadBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Failed';
                restoreUI(true);
            });
        }, 100);

        function restoreUI(failed = false) {
            if (!failed) {
                downloadBtn.innerHTML = originalBtnContent;
            }
            downloadBtn.disabled = false;
            cardElement.style.transform = originalTransform;
            cardElement.style.transition = originalTransition;
            cardElement.style.animation = originalAnimation;
            cardElement.style.boxShadow = originalBoxShadow;
            window.scrollTo(0, originalScroll);
        }
    });

    /**
     * Download Image Functionality (JPG)
     */
    downloadImgBtn.addEventListener('click', () => {
        const studentName = document.getElementById('name').value.trim().replace(/\s+/g, '_') || 'Student';
        const cardElement = document.getElementById('idCard');

        // UI feedback
        const originalBtnContent = downloadImgBtn.innerHTML;
        downloadImgBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gen...';
        downloadImgBtn.disabled = true;

        // Strip CSS features that break html2canvas
        const originalTransform = cardElement.style.transform;
        const originalTransition = cardElement.style.transition;
        const originalAnimation = cardElement.style.animation;
        const originalBoxShadow = cardElement.style.boxShadow;

        // Reset scroll position to top
        const originalScroll = window.scrollY;
        window.scrollTo(0, 0);

        cardElement.style.transform = 'none';
        cardElement.style.transition = 'none';
        cardElement.style.animation = 'none';
        cardElement.style.boxShadow = 'none';

        // Wait a frame for browser to paint the style changes
        setTimeout(() => {
            html2canvas(cardElement, {
                scale: 3, // High resolution
                useCORS: true,
                logging: false,
                scrollY: 0,
                scrollX: 0,
                backgroundColor: '#ffffff'
            }).then(canvas => {
                // Return to normal
                restoreImgUI();

                // Create an isolated anchor and trigger download
                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                const link = document.createElement('a');
                link.download = `IDCard_${studentName}.jpg`;
                link.href = imgData;
                link.click();
            }).catch(err => {
                console.error("Image generation failed:", err);
                downloadImgBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Fail';
                restoreImgUI(true);
            });
        }, 100);

        function restoreImgUI(failed = false) {
            if (!failed) {
                downloadImgBtn.innerHTML = originalBtnContent;
            }
            downloadImgBtn.disabled = false;
            cardElement.style.transform = originalTransform;
            cardElement.style.transition = originalTransition;
            cardElement.style.animation = originalAnimation;
            cardElement.style.boxShadow = originalBoxShadow;
            window.scrollTo(0, originalScroll);
        }
    });

    // Reset button state if form values change manually (optional UX)
    idForm.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('input', () => {
            // Logic to handle changes if needed
        });
    });
});
