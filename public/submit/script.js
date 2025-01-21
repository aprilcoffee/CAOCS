document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('questionnaireForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {};
        const textareas = this.getElementsByTagName('textarea');
        
        // Validate input
        let isValid = true;
        Array.from(textareas).forEach(textarea => {
            const value = textarea.value.trim();
            
            // Check for empty submissions
            if (!value) {
                isValid = false;
                textarea.classList.add('error');
                return;
            }
            
            // Check for length (e.g., max 1000 characters)
            if (value.length > 1000) {
                isValid = false;
                textarea.classList.add('error');
                return;
            }
            
            // Basic XSS prevention
            if (/<script|javascript:|data:/i.test(value)) {
                isValid = false;
                textarea.classList.add('error');
                return;
            }

            formData[textarea.getAttribute('name')] = value;
        });

        if (!isValid) {
            alert('Please check your input. Submissions must not be empty, must be under 1000 characters, and cannot contain scripts.');
            return;
        }

        // Submit to server for validation and processing
        fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                Array.from(textareas).forEach(textarea => textarea.value = '');
                alert('Thank you for your submission!');
                window.location.href = "/";
            } else {
                alert(result.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('There was an error submitting your form. Please try again.');
        });
    });
});
