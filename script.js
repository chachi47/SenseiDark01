$(document).ready(function () {
    const canvas = document.getElementById('imagePreview');
    const ctx = canvas.getContext('2d');
    const downloadButton = $('#downloadImage');

    let imageLoaded = false;
    let overlayApplied = false;

    downloadButton.hide();

    $('#imageUpload').on('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = function () {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    convertToBlackAndWhite();
                    imageLoaded = true;
                    overlayApplied = false; // Reset overlay flag
                    downloadButton.show();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    $('input[name="overlay"]').on('change', function () {
        if (imageLoaded) {
            applyOverlay();
        }
    });

    function convertToBlackAndWhite() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg; // red
            data[i + 1] = avg; // green
            data[i + 2] = avg; // blue
        }
        ctx.putImageData(imageData, 0, 0);
    }

    function applyOverlay(callback) {
        const overlay = $('input[name="overlay"]:checked').val();
        if (overlay) {
            const overlayImg = new Image();
            overlayImg.onload = function () {
                ctx.drawImage(overlayImg, 0, 0, canvas.width, canvas.height);
                overlayApplied = true; // Mark overlay as applied
                if (callback) callback(); // Call function (like saveCanvasImage) after overlay is applied
            };
            overlayImg.src = overlay;
        } else if (callback) {
            callback(); // No overlay selected, proceed with download
        }
    }

    $('#downloadImage').on('click', function () {
        if (!imageLoaded) {
            alert("Please upload an image first.");
            return;
        }

        if (!$('input[name="overlay"]:checked').val()) {
            alert("Please apply an overlay before downloading.");
            return;
        }

        if (!overlayApplied) {
            applyOverlay(saveCanvasImage); // Apply overlay and then download
        } else {
            saveCanvasImage(); // Download directly if overlay is already applied
        }
    });

    function saveCanvasImage() {
        const link = document.createElement('a');
        link.download = 'edited-image.png';
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert('Your image has been downloaded.');
    }

    $('#shareTwitter').on('click', function() {
        const imageData = canvas.toDataURL('image/png');
        const message = prompt("Enter your message for Twitter:");
        if (message) {
            // Send imageData and message to the server for sharing on Twitter
            $.post('/share-twitter', { image: imageData, message: message }, function(response) {
                alert(response);
            });
        }
    });
});