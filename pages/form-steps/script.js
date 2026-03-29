document.addEventListener('DOMContentLoaded', () => {

    // --- 1. FAQ Accordion Logic ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(i => i.classList.remove('active'));
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // --- 2. Upload Files & Plaid Logic ---
    const btnOpenUpload = document.getElementById('btn-upload-statements');
    const troubleText = document.getElementById('trouble-text');
    const uploadSection = document.getElementById('upload-section');
    const btnPlaid = document.getElementById('btn-plaid');
    const uploadSubtitle = document.getElementById('upload-subtitle');

    uploadSection.style.display = 'none';

    let uploadedFiles = [];
    const MAX_FILES = 4;
    const MAX_TOTAL_SIZE_MB = 25;
    const MAX_FILE_SIZE_MB = 25;

    if (uploadSubtitle) {
        uploadSubtitle.innerText = `In the last 6 months (max. ${MAX_FILE_SIZE_MB} MB, up to ${MAX_FILES} files)`;
    }

    btnOpenUpload.addEventListener('click', () => {
        troubleText.style.display = 'none';
        uploadSection.style.display = 'flex';
    });

    btnPlaid.addEventListener('click', () => {
        uploadSection.style.display = 'none';
        troubleText.style.display = 'block';
        uploadedFiles = [];
        errorsContainer.innerHTML = '';
        fileInput.value = '';
        renderFiles();
    });

    const dropzone = document.getElementById('upload-dropzone');
    const fileInput = document.getElementById('file-input');
    const filesListContainer = document.getElementById('uploaded-files-list');
    const errorsContainer = document.getElementById('validation-errors');
    const btnNext = document.querySelector('.btn-next');
    const btnBack = document.querySelector('.btn-back');

    dropzone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
        fileInput.value = '';
    });

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    function handleFiles(files) {
        errorsContainer.innerHTML = '';
        let newFiles = Array.from(files);
        let errorMessages = [];

        newFiles.forEach(file => {
            if (file.type !== 'application/pdf') {
                errorMessages.push(`"${file.name}" is not a PDF file.`);
                return;
            }
            if (file.size / (1024 * 1024) > MAX_FILE_SIZE_MB) {
                errorMessages.push(`"${file.name}" exceeds 25MB.`);
                return;
            }
            const isDuplicate = uploadedFiles.some(f => f.name === file.name && f.size === file.size);
            if (!isDuplicate) {
                uploadedFiles.push(file);
            }
        });

        if (uploadedFiles.length > MAX_FILES) {
            uploadedFiles = uploadedFiles.slice(0, MAX_FILES);
            errorMessages.push(`You can only upload up to ${MAX_FILES} files.`);
        }

        const totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);
        if (totalSize / (1024 * 1024) > MAX_TOTAL_SIZE_MB) {
            errorMessages.push(`Total size exceeds 25MB.`);
            uploadedFiles.pop();
        }

        if (errorMessages.length > 0) {
            errorsContainer.innerHTML = errorMessages.join('<br>');
        }

        renderFiles();
    }

    function renderFiles() {
        filesListContainer.innerHTML = '';

        uploadedFiles.forEach((file, index) => {
            const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);

            const fileEl = document.createElement('div');
            fileEl.className = 'file-item';

            fileEl.innerHTML = `
                <div class="upload-dropzone__left">
                    <div class="file-item__icon-wrapper">
                        <svg width="19" height="24" viewBox="0 0 19 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18.7463 6.01875C18.9082 6.17946 19 6.39643 19 6.62411V23.1429C19 23.617 18.6141 24 18.1364 24H0.863636C0.385937 24 0 23.617 0 23.1429V0.857143C0 0.383036 0.385937 0 0.863636 0H12.3257C12.5551 0 12.7764 0.0910715 12.9384 0.251786L18.7463 6.01875ZM17.0082 7.01786L11.929 1.97679V7.01786H17.0082ZM12.7716 15.3552C12.3619 15.3418 11.9263 15.3731 11.4316 15.4345C10.7758 15.0329 10.3342 14.4814 10.0206 13.6712L10.0495 13.5538L10.083 13.4151C10.199 12.9295 10.2614 12.5751 10.28 12.2178C10.294 11.948 10.2789 11.6992 10.2306 11.4686C10.1415 10.9706 9.78662 10.6795 9.33942 10.6615C8.92244 10.6446 8.5392 10.8758 8.44124 11.2339C8.28173 11.813 8.37511 12.5751 8.71328 13.8747C8.28254 14.8939 7.71335 16.0888 7.33146 16.7553C6.82165 17.0162 6.42464 17.2535 6.09107 17.5165C5.65115 17.8639 5.37641 18.221 5.30084 18.596C5.26413 18.7698 5.31946 18.997 5.4455 19.1831C5.58854 19.3942 5.80391 19.5313 6.06219 19.5512C6.71396 19.6012 7.51499 18.9343 8.3994 17.4281C8.4882 17.3987 8.58212 17.3676 8.69682 17.329L9.01798 17.2213C9.22121 17.1533 9.36857 17.1046 9.51431 17.0577C10.1458 16.8536 10.6235 16.7247 11.0581 16.6513C11.8132 17.0526 12.686 17.3156 13.2738 17.3156C13.7591 17.3156 14.087 17.066 14.2055 16.673C14.3094 16.328 14.2271 15.9279 14.0036 15.7066C13.7726 15.4813 13.3478 15.3737 12.7716 15.3552ZM6.07865 18.795V18.7854L6.08216 18.7762C6.12168 18.6749 6.17236 18.5783 6.2333 18.488C6.34881 18.3118 6.50777 18.1264 6.70479 17.929C6.81058 17.8232 6.9207 17.7201 7.04997 17.6044C7.07885 17.5787 7.26345 17.4155 7.298 17.3834L7.59946 17.1048L7.38031 17.4512C7.04781 17.9772 6.74716 18.356 6.48969 18.6029C6.39496 18.694 6.31156 18.761 6.24409 18.8041C6.22182 18.8189 6.19824 18.8316 6.17365 18.8421C6.16259 18.8467 6.15287 18.8494 6.14315 18.8502C6.1329 18.8515 6.12248 18.8501 6.11293 18.8462C6.10277 18.8419 6.09409 18.8348 6.088 18.8257C6.0819 18.8166 6.07865 18.8059 6.07865 18.795ZM9.4776 12.9482L9.4166 13.0554L9.37882 12.938C9.29516 12.6747 9.23362 12.278 9.21662 11.9202C9.19719 11.513 9.22984 11.2688 9.35939 11.2688C9.54129 11.2688 9.62469 11.558 9.63116 11.9933C9.6371 12.3758 9.57638 12.7738 9.47733 12.9482H9.4776ZM9.3208 14.5141L9.36209 14.4056L9.4185 14.5074C9.73399 15.0763 10.1434 15.551 10.5936 15.8818L10.6907 15.953L10.5723 15.9771C10.1315 16.0677 9.72104 16.2038 9.15967 16.4285C9.21824 16.4049 8.57618 16.6658 8.41371 16.7277L8.27202 16.7815L8.34758 16.6508C8.68089 16.0749 8.98884 15.3833 9.32053 14.5141H9.3208ZM13.5747 16.5568C13.3626 16.6398 12.906 16.5656 12.102 16.2249L11.8979 16.1387L12.1192 16.1226C12.7481 16.0763 13.1934 16.1105 13.453 16.2048C13.5637 16.245 13.6374 16.2956 13.67 16.3535C13.6872 16.3809 13.693 16.4138 13.6861 16.4454C13.6793 16.4769 13.6603 16.5046 13.6333 16.5225C13.6161 16.5375 13.5963 16.5491 13.5747 16.5568Z" fill="#D81015"/>
                        </svg>
                    </div>
                    <div class="upload-dropzone__text">
                        <div class="file-item__title">${file.name}</div>
                        <div class="file-item__subtitle">${sizeInMB} MB</div>
                    </div>
                </div>
                <button type="button" class="btn-delete-file" data-index="${index}">
                    <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.53906 0C10.3902 0 11.0859 0.695767 11.0859 1.54688V3.55762H16V4.98535H14.0469V14.2617C14.0469 15.6843 12.8904 16.8408 11.4678 16.8408H3.93457C2.51193 16.8408 1.35547 15.6843 1.35547 14.2617V4.9834H0V3.55664H4.32227V1.54688C4.32227 0.695767 5.018 0 5.86914 0H9.53906ZM2.78613 14.2598C2.78613 14.8944 3.30192 15.4111 3.9375 15.4111H11.4688C12.1032 15.4109 12.6191 14.8952 12.6191 14.2598V4.9834H2.78613V14.2598ZM6.9375 12.7783H5.51074V7.53125H6.9375V12.7783ZM10.209 12.7783H8.78125V7.53125H10.209V12.7783ZM5.86914 1.42773C5.80224 1.42773 5.75 1.47998 5.75 1.54688V3.55664H9.6582V1.54688C9.6582 1.47998 9.60596 1.42773 9.53906 1.42773H5.86914Z" fill="currentColor" />
                    </svg>
                </button>
            `;
            filesListContainer.appendChild(fileEl);
        });

        const deleteButtons = document.querySelectorAll('.btn-delete-file');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                uploadedFiles.splice(index, 1);
                errorsContainer.innerHTML = '';
                renderFiles();
            });
        });
    }

    // --- 3. Next Button Logic (Mock Backend) ---
    btnNext.addEventListener('click', async (e) => {
        e.preventDefault();

        if (uploadedFiles.length === 0) {
            errorsContainer.innerHTML = 'Connect your bank account or select requirement documents.';
            return;
        }

        errorsContainer.innerHTML = '';

        btnNext.disabled = true;
        btnNext.style.opacity = '0.5';
        btnNext.style.cursor = 'not-allowed';
        btnBack.style.pointerEvents = 'none';
        btnBack.style.opacity = '0.5';

        try {
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    Math.random() > 0.1 ? resolve() : reject(new Error('Server error during upload. Please try again.'));
                }, 2000);
            });

            console.log('--- SUCCESS: DATA SENT TO BACKEND ---');
            console.log('Selected files:', uploadedFiles.map(f => f.name));

            uploadedFiles = [];
            fileInput.value = '';
            renderFiles();

        } catch (error) {
            console.error('--- ERROR: FAILED TO SEND DATA TO BACKEND ---', error);
            errorsContainer.innerHTML = error.message;
        } finally {
            btnNext.disabled = false;
            btnNext.style.opacity = '1';
            btnNext.style.cursor = 'pointer';
            btnBack.style.pointerEvents = 'auto';
            btnBack.style.opacity = '1';
        }
    });

    // --- 4. Mobile Menu Logic ---
    const burgerBtn = document.getElementById('burger-btn');
    const headerNav = document.getElementById('header-nav');

    burgerBtn.addEventListener('click', () => {
        const isActive = burgerBtn.classList.toggle('active');
        headerNav.classList.toggle('active');

        document.body.style.overflow = isActive ? 'hidden' : '';
    });
});