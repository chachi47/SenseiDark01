$(document).ready(function() {
    const canvas = document.getElementById('imagePreview');
    const ctx = canvas.getContext('2d');

    $('#imageUpload').on('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    convertToBlackAndWhite();
                    applyOverlay();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    $('input[name="overlay"]').on('change', function() {
        applyOverlay();
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

    function applyOverlay() {
        const overlay = $('input[name="overlay"]:checked').val();
        if (overlay) {
            const overlayImg = new Image();
            overlayImg.onload = function() {
                ctx.drawImage(overlayImg, 0, 0, canvas.width, canvas.height);
            };
            overlayImg.src = overlay;
        }
    }

    $('#downloadImage').on('click', function() {
        const link = document.createElement('a');
        link.download = 'edited-image.png';
        link.href = canvas.toDataURL();
        link.click();
    });

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